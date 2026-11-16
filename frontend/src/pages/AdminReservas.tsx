/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { ReciboReservaPDF } from '../components/ReciboReservaPDF';
import { FiCalendar, FiDownload, FiX } from 'react-icons/fi';

interface Reserva {
  id: number;
  dataHora: string;
  quantidadePessoas: number;
  status: string;
  codigoRecibo: string;
  observacoes?: string | null;
  nomeContacto?: string | null;
  emailContacto?: string | null;
  telefoneContacto?: string | null;
  cliente: { id?: number | null; nome: string; email: string; telefone?: string | null };
  mesa: { numero: number };
}

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: 'Pendente',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
};

const STATUS_COR: Record<string, string> = {
  PENDENTE: 'bg-dourado/15 text-[#8a6a34]',
  CONFIRMADA: 'bg-oliva/15 text-oliva',
  CANCELADA: 'bg-red-100 text-red-700',
};

export default function AdminReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<'TODAS' | 'PENDENTE' | 'CONFIRMADA' | 'CANCELADA'>('TODAS');

  const fetchReservas = async () => {
    try {
      const res = await api.get<Reserva[]>('/reservas/admin/todas');
      setReservas(res.data);
    } catch {
      toast.error('Erro ao carregar reservas');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  const handleConfirmar = async (id: number) => {
    try {
      await api.patch(`/reservas/admin/${id}/confirmar`);
      toast.success('Reserva confirmada');
      fetchReservas();
    } catch {
      toast.error('Erro ao confirmar');
    }
  };

  const handleCancelar = async (id: number) => {
    if (!confirm('Cancelar esta reserva?')) return;
    try {
      await api.patch(`/reservas/admin/${id}/cancelar`);
      toast.success('Reserva cancelada');
      fetchReservas();
    } catch {
      toast.error('Erro ao cancelar');
    }
  };

  const handleBaixarRecibo = async (reserva: Reserva) => {
    try {
      const appUrl = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, '');
      const qrData = `${appUrl}/reservas/validar/${reserva.id}?codigo=${reserva.codigoRecibo}`;
      const qrDataUrl = await QRCode.toDataURL(qrData, { width: 200, margin: 1 });
      const blob = await pdf(<ReciboReservaPDF reserva={reserva} qrDataUrl={qrDataUrl} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo_reserva_${reserva.codigoRecibo}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Erro ao gerar PDF');
    }
  };

  const filtradas = filtro === 'TODAS' ? reservas : reservas.filter((r) => r.status === filtro);
  const pendentes = reservas.filter((r) => r.status === 'PENDENTE').length;

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaria" />
      </div>
    );
  }

  return (
    <section className="section">
      <div className="container-custom">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Administração</p>
            <h1 className="mt-2 font-display text-3xl text-secundaria sm:text-4xl">
              Reservas
            </h1>
            <p className="mt-2 text-sm text-texto/65">
              {reservas.length} reservas no total
              {pendentes > 0 ? ` · ${pendentes} por confirmar` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['TODAS', 'PENDENTE', 'CONFIRMADA', 'CANCELADA'] as const).map((opcao) => (
              <button
                key={opcao}
                type="button"
                onClick={() => setFiltro(opcao)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                  filtro === opcao
                    ? 'border-secundaria bg-secundaria text-creme'
                    : 'border-texto/15 bg-white text-texto/70 hover:border-secundaria/40'
                }`}
              >
                {opcao === 'TODAS' ? 'Todas' : STATUS_LABEL[opcao]}
              </button>
            ))}
          </div>
        </div>

        {filtradas.length === 0 ? (
          <div className="card mt-8 p-12 text-center">
            <FiCalendar className="mx-auto text-4xl text-primaria" aria-hidden="true" />
            <p className="mt-4 font-display text-xl text-secundaria">Sem reservas neste estado</p>
            <p className="mt-1 text-sm text-texto/60">As novas reservas aparecem aqui automaticamente.</p>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-sm border border-texto/10 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-secundaria text-creme">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Mesa</th>
                  <th className="px-4 py-3 font-medium">Data e hora</th>
                  <th className="px-4 py-3 font-medium">Pessoas</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-texto/10">
                {filtradas.map((r) => {
                  const telefone = r.cliente.telefone || r.telefoneContacto;
                  const semConta = !r.cliente.id;
                  return (
                    <tr key={r.id} className="align-top hover:bg-areia/30">
                      <td className="px-4 py-4 text-texto/50">{r.id}</td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-texto">{r.cliente.nome}</div>
                        {r.cliente.email && (
                          <div className="text-xs text-texto/55">{r.cliente.email}</div>
                        )}
                        {telefone && (
                          <a
                            href={`tel:${telefone}`}
                            className="text-xs text-primaria hover:underline"
                          >
                            {telefone}
                          </a>
                        )}
                        {semConta && (
                          <span className="mt-1 inline-block rounded-full bg-areia px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-texto/60">
                            Sem conta
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">Mesa {r.mesa.numero}</td>
                      <td className="px-4 py-4">
                        {new Date(r.dataHora).toLocaleString('pt-PT', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="px-4 py-4">{r.quantidadePessoas}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                            STATUS_COR[r.status] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {STATUS_LABEL[r.status] || r.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {r.status === 'PENDENTE' && (
                            <button
                              type="button"
                              onClick={() => handleConfirmar(r.id)}
                              className="btn-primary btn-sm"
                            >
                              Confirmar
                            </button>
                          )}
                          {(r.status === 'PENDENTE' || r.status === 'CONFIRMADA') && (
                            <button
                              type="button"
                              onClick={() => handleCancelar(r.id)}
                              className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50"
                            >
                              <FiX aria-hidden="true" /> Cancelar
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleBaixarRecibo(r)}
                            className="inline-flex items-center gap-1 rounded-full border border-texto/15 px-3 py-1 text-xs font-medium text-texto/70 transition hover:border-secundaria hover:text-secundaria"
                          >
                            <FiDownload aria-hidden="true" /> Recibo
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
