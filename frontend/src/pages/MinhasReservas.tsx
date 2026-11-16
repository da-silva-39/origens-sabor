/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { ReciboReservaPDF } from '../components/ReciboReservaPDF';
import ContaHeader from '../components/ContaHeader';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { RESTAURANTE } from '../data/restaurante';
import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiHash,
  FiPlus,
  FiUsers,
  FiX,
} from 'react-icons/fi';

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

const STATUS_ESTILO: Record<string, { rotulo: string; chip: string; barra: string }> = {
  PENDENTE: {
    rotulo: 'Pendente',
    chip: 'bg-dourado/15 text-[#8a6a34]',
    barra: 'bg-dourado',
  },
  CONFIRMADA: {
    rotulo: 'Confirmada',
    chip: 'bg-oliva/15 text-oliva',
    barra: 'bg-oliva',
  },
  CANCELADA: {
    rotulo: 'Cancelada',
    chip: 'bg-red-50 text-red-700',
    barra: 'bg-red-400',
  },
};

function partesData(valor: string) {
  const data = new Date(valor);
  return {
    dia: new Intl.DateTimeFormat('pt-PT', { day: '2-digit' }).format(data),
    mes: new Intl.DateTimeFormat('pt-PT', { month: 'short' })
      .format(data)
      .replace('.', ''),
    completo: new Intl.DateTimeFormat('pt-PT', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(data),
  };
}

export default function MinhasReservas() {
  useDocumentTitle('Minhas reservas — Origens do Sabor');
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
                  className={`w-full max-w-md border-l-4 border-oliva bg-white p-4 shadow-lg ${
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
    if (!window.confirm('Tem certeza que deseja cancelar esta reserva?')) return;
    try {
      await api.delete(`/reservas/${id}`);
      toast.success('Reserva cancelada');
      fetchReservas();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao cancelar');
    }
  };

  const estatisticas = useMemo(
    () => ({
      total: reservas.length,
      confirmadas: reservas.filter((r) => r.status === 'CONFIRMADA').length,
      pendentes: reservas.filter((r) => r.status === 'PENDENTE').length,
    }),
    [reservas]
  );

  if (carregando) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primaria" />
      </div>
    );
  }

  return (
    <div className="bg-fundo">
      <ContaHeader
        eyebrow="A sua conta"
        titulo="Minhas reservas"
        descricao="Acompanhe o estado das suas reservas, apresente o recibo à chegada e reserve uma nova mesa quando quiser."
        acao={
          <Link to="/reservar-mesa" className="btn-light">
            <FiPlus aria-hidden="true" /> Nova reserva
          </Link>
        }
      />

      <div className="container-custom max-w-5xl py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="border border-carvao/10 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center bg-secundaria/10 text-secundaria">
                <FiCalendar aria-hidden="true" />
              </span>
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-carvao/50">
                Reservas
              </span>
            </div>
            <p className="mt-4 font-display text-3xl text-secundaria">{estatisticas.total}</p>
            <p className="mt-1 text-xs text-carvao/50">Total de reservas efetuadas</p>
          </div>

          <div className="border border-carvao/10 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center bg-oliva/15 text-oliva">
                <FiCheckCircle aria-hidden="true" />
              </span>
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-carvao/50">
                Confirmadas
              </span>
            </div>
            <p className="mt-4 font-display text-3xl text-secundaria">
              {estatisticas.confirmadas}
            </p>
            <p className="mt-1 text-xs text-carvao/50">Mesas já confirmadas pela equipa</p>
          </div>

          <div className="border border-carvao/10 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center bg-dourado/15 text-[#8a6a34]">
                <FiClock aria-hidden="true" />
              </span>
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-carvao/50">
                Pendentes
              </span>
            </div>
            <p className="mt-4 font-display text-3xl text-secundaria">
              {estatisticas.pendentes}
            </p>
            <p className="mt-1 text-xs text-carvao/50">A aguardar confirmação</p>
          </div>
        </div>

        {reservas.length === 0 ? (
          <div className="mt-8 border border-carvao/10 bg-white p-10 text-center sm:p-14">
            <span className="mx-auto flex h-16 w-16 items-center justify-center bg-areia/50 text-terracota">
              <FiCalendar aria-hidden="true" className="h-7 w-7" />
            </span>
            <p className="mt-5 font-display text-2xl text-secundaria">
              Ainda não tem reservas
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-carvao/55">
              Reserve uma mesa e garanta o seu lugar. Receberá aqui a confirmação e o
              recibo para apresentar à chegada.
            </p>
            <Link to="/reservar-mesa" className="btn-primary mt-6">
              Reservar mesa <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {reservas.map((reserva) => {
              const estilo = STATUS_ESTILO[reserva.status] || {
                rotulo: reserva.status,
                chip: 'bg-carvao/5 text-carvao/70',
                barra: 'bg-carvao/30',
              };
              const data = partesData(reserva.dataHora);

              return (
                <article
                  key={reserva.id}
                  className="relative overflow-hidden border border-carvao/10 bg-white"
                >
                  <span className={`absolute inset-y-0 left-0 w-1 ${estilo.barra}`} />

                  <div className="grid gap-5 p-5 pl-6 sm:grid-cols-[5.5rem_1fr_auto] sm:items-start sm:p-6 sm:pl-7">
                    <div className="flex h-20 w-20 flex-col items-center justify-center border border-carvao/10 bg-areia/30">
                      <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-carvao/50">
                        {data.mes}
                      </span>
                      <span className="font-display text-3xl leading-none text-secundaria">
                        {data.dia}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-display text-xl text-secundaria">
                          Mesa {reserva.mesa.numero}
                        </h2>
                        <span
                          className={`inline-flex px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider ${estilo.chip}`}
                        >
                          {estilo.rotulo}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-col gap-2 text-sm text-carvao/65">
                        <span className="inline-flex items-center gap-2">
                          <FiCalendar aria-hidden="true" className="shrink-0 text-terracota" />
                          {data.completo}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <FiUsers aria-hidden="true" className="shrink-0 text-terracota" />
                          {reserva.quantidadePessoas}{' '}
                          {reserva.quantidadePessoas === 1 ? 'pessoa' : 'pessoas'}
                        </span>
                        <span className="inline-flex items-center gap-2 text-xs text-carvao/45">
                          <FiHash aria-hidden="true" className="shrink-0 text-carvao/35" />
                          Código de validação: <span className="font-mono">{reserva.codigoRecibo}</span>
                        </span>
                      </div>

                      {reserva.observacoes && (
                        <p className="mt-3 border-l-2 border-dourado/50 bg-areia/30 px-3 py-2 text-sm text-carvao/65">
                          {reserva.observacoes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
                      {reserva.status === 'CONFIRMADA' && (
                        <button
                          type="button"
                          onClick={() => handleBaixarRecibo(reserva)}
                          className="btn-secondary btn-sm"
                        >
                          <FiDownload aria-hidden="true" /> Recibo
                        </button>
                      )}
                      {(reserva.status === 'PENDENTE' || reserva.status === 'CONFIRMADA') && (
                        <button
                          type="button"
                          onClick={() => handleCancelar(reserva.id)}
                          className="inline-flex items-center justify-center border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
                        >
                          Cancelar reserva
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4 border border-carvao/10 bg-areia/30 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-carvao/70">
            Precisa de alterar uma reserva ou tem alguma dúvida?
          </p>
          <a
            href={RESTAURANTE.whatsappReservas}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-terracota hover:text-secundaria"
          >
            Falar com a equipa <FiArrowRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
