/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

interface ValidacaoResultado {
  valida: boolean;
  motivo?: string;
  reserva?: {
    id: number;
    mesa: number;
    dataHora: string;
    cliente: string;
    quantidadePessoas: number;
  };
}

export default function ValidarReserva() {
  useDocumentTitle('Validar reserva — Origens do Sabor');
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const codigo = searchParams.get('codigo');
  const [carregando, setCarregando] = useState(true);
  const [resultado, setResultado] = useState<ValidacaoResultado | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!id || !codigo) {
      setErro('Link inválido. Verifique o QR code ou o código de validação.');
      setCarregando(false);
      return;
    }

    const validar = async () => {
      try {
        const res = await api.get(`/reservas/validar/${id}?codigo=${codigo}`);
        setResultado(res.data);
      } catch (err: any) {
        if (err.response?.data?.motivo) {
          setResultado({ valida: false, motivo: err.response.data.motivo });
        } else if (err.response?.status === 404) {
          setResultado({ valida: false, motivo: 'Reserva não encontrada ou código inválido.' });
        } else {
          setErro('Erro ao validar reserva. Tente novamente mais tarde.');
        }
      } finally {
        setCarregando(false);
      }
    };

    validar();
  }, [id, codigo]);

  if (carregando) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primaria" />
          <p className="mt-4 text-sm text-texto/60">A validar reserva...</p>
        </div>
      </div>
    );
  }

  const cartao = 'w-full max-w-md rounded-sm border border-texto/10 bg-white p-8 text-center shadow-suave';

  if (erro || !resultado) {
    return (
      <section className="section">
        <div className="container-custom flex justify-center">
          <div className={cartao}>
            <FiXCircle className="mx-auto text-5xl text-red-500" aria-hidden="true" />
            <h1 className="mt-4 font-display text-2xl text-secundaria">Não foi possível validar</h1>
            <p className="mt-2 text-sm text-texto/65">{erro || 'Resposta inválida do servidor.'}</p>
            <Link to="/contacto" className="btn-secondary mt-6">
              Contactar o restaurante
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!resultado.valida) {
    return (
      <section className="section">
        <div className="container-custom flex justify-center">
          <div className={cartao}>
            <FiXCircle className="mx-auto text-5xl text-red-500" aria-hidden="true" />
            <h1 className="mt-4 font-display text-2xl text-secundaria">Reserva inválida</h1>
            <p className="mt-2 text-sm text-texto/65">
              {resultado.motivo || 'Esta reserva não é válida.'}
            </p>
            <Link to="/reservar-mesa" className="btn-primary mt-6">
              Fazer nova reserva
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const reserva = resultado.reserva!;
  return (
    <section className="section">
      <div className="container-custom flex justify-center">
        <div className={cartao}>
          <FiCheckCircle className="mx-auto text-5xl text-oliva" aria-hidden="true" />
          <p className="eyebrow mt-4">Reserva verificada</p>
          <h1 className="mt-2 font-display text-2xl text-secundaria">
            {reserva.cliente}, a sua mesa está confirmada.
          </h1>
          <dl className="mt-6 space-y-3 rounded-sm bg-areia/60 p-4 text-left text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-texto/60">Mesa</dt>
              <dd className="font-medium">{reserva.mesa}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-texto/60">Data e hora</dt>
              <dd className="font-medium">
                {new Date(reserva.dataHora).toLocaleString('pt-PT', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-texto/60">Pessoas</dt>
              <dd className="font-medium">{reserva.quantidadePessoas}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-texto/60">Estado</dt>
              <dd className="font-medium">Confirmada</dd>
            </div>
          </dl>
          <p className="mt-5 text-xs text-texto/45">
            Apresente esta confirmação à equipa ao chegar ao restaurante.
          </p>
        </div>
      </div>
    </section>
  );
}
