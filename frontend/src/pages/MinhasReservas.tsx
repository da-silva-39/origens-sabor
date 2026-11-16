/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { ReciboReservaPDF } from '../components/ReciboReservaPDF';
import { FiCalendar, FiCheckCircle, FiDownload, FiPlus, FiX } from 'react-icons/fi';

interface Reserva {
  id: number;
  dataHora: string;
  quantidadePessoas: number;
  status: string;
  codigoRecibo: string;
  mesa: { id: number; numero: number; qrCode?: string; ocupada?: boolean };
  cliente: { nome: string; email: string; telefone?: string };
  observacoes?: string;
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

export default function MinhasReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);

  const handleBaixarRecibo = useCallback(async (reserva: Reserva) => {
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
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Verifique se os dados da reserva estão completos.');
    }
  }, []);

  const fetchReservas = useCallback(async () => {
    try {
      const res = await api.get<Reserva[]>('/reservas/minhas');
      const novas = res.data;
      setReservas((prev) => {
        const prevMap = new Map(prev.map((r) => [r.id, r]));
        for (const nova of novas) {
          const antiga = prevMap.get(nova.id);
          if (antiga && antiga.status !== 'CONFIRMADA' && nova.status === 'CONFIRMADA') {
            toast.custom(
              (t) => (
                <div
                  className={`w-full max-w-md rounded-lg border-l-4 border-oliva bg-white p-4 shadow-lg ${
                    t.visible ? 'animate-enter' : 'animate-leave'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="mt-0.5 shrink-0 text-xl text-oliva" aria-hidden="true" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-secundaria">Reserva confirmada</h3>
                      <p className="text-sm text-texto/70">
                        A sua reserva para a mesa {nova.mesa.numero} foi confirmada.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          toast.dismiss(t.id);
                          handleBaixarRecibo(nova);
                        }}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primaria hover:underline"
                      >
                        <FiDownload size={12} /> Baixar recibo
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.dismiss(t.id)}
                      aria-label="Fechar notificação"
                      className="text-texto/40 hover:text-texto"
                    >
                      <FiX />
                    </button>
                  </div>
                </div>
              ),
              { duration: 10000 }
            );
          }
        }
        return novas;
      });
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
      toast.error('Erro ao carregar reservas');
    } finally {
      setCarregando(false);
    }
  }, [handleBaixarRecibo]);

  useEffect(() => {
    fetchReservas();
    const interval = setInterval(fetchReservas, 10000);
    return () => clearInterval(interval);
  }, [fetchReservas]);

  const handleCancelar = async (id: number) => {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) return;
    try {
      await api.delete(`/reservas/${id}`);
      toast.success('Reserva cancelada');
      fetchReservas();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao cancelar');
    }
  };

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaria" />
      </div>
    );
  }

  return (
    <section className="section">
      <div className="container-custom max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">A sua conta</p>
            <h1 className="mt-2 font-display text-3xl text-secundaria sm:text-4xl">
              Minhas reservas
            </h1>
            <p className="mt-2 text-sm text-texto/60">
              Acompanhe o estado das suas reservas e apresente o recibo à chegada.
            </p>
          </div>
          <Link to="/reservar-mesa" className="btn-primary btn-sm">
            <FiPlus aria-hidden="true" /> Nova reserva
          </Link>
        </div>

        {reservas.length === 0 ? (
          <div className="card mt-8 p-12 text-center">
            <FiCalendar className="mx-auto text-4xl text-primaria" aria-hidden="true" />
            <p className="mt-4 font-display text-xl text-secundaria">Ainda não tem reservas</p>
            <p className="mt-1 text-sm text-texto/60">
              Reserve uma mesa e garanta o seu lugar no Origens do Sabor.
            </p>
            <Link to="/reservar-mesa" className="btn-primary mt-6">
              Reservar mesa
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {reservas.map((r) => (
              <article
                key={r.id}
                className="rounded-sm border border-texto/10 bg-white p-5 shadow-suave sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-display text-xl text-secundaria">Mesa {r.mesa.numero}</h2>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                          STATUS_COR[r.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {STATUS_LABEL[r.status] || r.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-texto/70">
                      {new Date(r.dataHora).toLocaleString('pt-PT', {
                        dateStyle: 'long',
                        timeStyle: 'short',
                      })}
                      {' · '}
                      {r.quantidadePessoas} {r.quantidadePessoas === 1 ? 'pessoa' : 'pessoas'}
                    </p>
                    <p className="mt-1 text-xs text-texto/45">
                      Código de validação: <span className="font-mono">{r.codigoRecibo}</span>
                    </p>
                    {r.observacoes && (
                      <p className="mt-3 rounded-sm bg-areia/60 px-3 py-2 text-sm text-texto/70">
                        {r.observacoes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(r.status === 'PENDENTE' || r.status === 'CONFIRMADA') && (
                      <button
                        type="button"
                        onClick={() => handleCancelar(r.id)}
                        className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
                      >
                        Cancelar
                      </button>
                    )}
                    {r.status === 'CONFIRMADA' && (
                      <button
                        type="button"
                        onClick={() => handleBaixarRecibo(r)}
                        className="btn-secondary btn-sm"
                      >
                        <FiDownload aria-hidden="true" /> Recibo
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
