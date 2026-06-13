/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

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
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const codigo = searchParams.get('codigo');
  const [carregando, setCarregando] = useState(true);
  const [resultado, setResultado] = useState<ValidacaoResultado | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!id || !codigo) {
      setErro('Link inválido. Verifique o QR code.');
      setCarregando(false);
      return;
    }

    const validar = async () => {
      try {
        const res = await api.get(`/reservas/validar/${id}?codigo=${codigo}`);
        setResultado(res.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setResultado({ valida: false, motivo: 'Reserva não encontrada ou código inválido.' });
        } else if (err.response?.data?.motivo) {
          setResultado({ valida: false, motivo: err.response.data.motivo });
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primaria mx-auto"></div>
          <p className="mt-4 text-gray-600">A validar reserva...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <FiXCircle className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro</h2>
          <p className="text-gray-700">{erro}</p>
        </div>
      </div>
    );
  }

  if (!resultado) return null;

  if (!resultado.valida) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <FiXCircle className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Reserva Inválida</h2>
          <p className="text-gray-700">{resultado.motivo || 'Esta reserva não é válida.'}</p>
        </div>
      </div>
    );
  }

  // Reserva válida
  const { reserva } = resultado;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <FiCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-600 mb-2">Reserva Válida!</h2>
        <p className="text-gray-700 mb-4">A sua reserva está confirmada e activa.</p>
        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
          <p><strong>Cliente:</strong> {reserva?.cliente}</p>
          <p><strong>Mesa:</strong> {reserva?.mesa}</p>
          <p><strong>Data/Hora:</strong> {new Date(reserva?.dataHora!).toLocaleString('pt-PT')}</p>
          <p><strong>Pessoas:</strong> {reserva?.quantidadePessoas}</p>
        </div>
        <p className="text-xs text-gray-400 mt-4">Apresente esta tela ao chegar ao restaurante.</p>
      </div>
    </div>
  );
}