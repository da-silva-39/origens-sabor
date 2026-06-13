/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { ReciboReservaPDF } from '../components/ReciboReservaPDF';
import { FiCheckCircle, FiDownload, FiX } from 'react-icons/fi';

interface Reserva {
  id: number;
  dataHora: string;
  quantidadePessoas: number;
  status: string;
  codigoRecibo: string;
  mesa: { numero: number };
  cliente: { nome: string; email: string; telefone?: string };
  observacoes?: string;
}

export default function MinhasReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);

  const fetchReservas = async () => {
    try {
      const res = await api.get('/reservas/minhas');
      const novas = res.data;
      // Detecta mudanças para CONFIRMADA e mostra notificação
      setReservas(prev => {
        const prevMap = new Map(prev.map(r => [r.id, r]));
        for (const nova of novas) {
          const antiga = prevMap.get(nova.id);
          if (antiga && antiga.status !== 'CONFIRMADA' && nova.status === 'CONFIRMADA') {
            // Notificação animada
            toast.custom((t) => (
              <div className={`bg-green-100 border-l-4 border-green-500 rounded-lg shadow-lg p-4 max-w-md w-full ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <FiCheckCircle className="text-green-600 text-2xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-green-800">Reserva Confirmada!</h3>
                    <p className="text-sm text-green-700">A sua reserva para a mesa {nova.mesa.numero} foi confirmada.</p>
                    <button
                      onClick={() => {
                        toast.dismiss(t.id);
                        handleBaixarRecibo(nova);
                      }}
                      className="mt-2 inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-full text-xs hover:bg-green-700 transition"
                    >
                      <FiDownload size={12} /> Baixar Recibo
                    </button>
                  </div>
                  <button onClick={() => toast.dismiss(t.id)} className="text-green-600 hover:text-green-800">
                    <FiX />
                  </button>
                </div>
              </div>
            ), { duration: 10000 });
          }
        }
        return novas;
      });
    } catch (error) {
      toast.error('Erro ao carregar reservas');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    fetchReservas();
    const interval = setInterval(fetchReservas, 10000); // polling a cada 10s
    return () => clearInterval(interval);
  }, []);

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

  const handleBaixarRecibo = async (reserva: Reserva) => {
    try {
      const qrData = `https://origens-sabor.vercel.app/reservas/${reserva.id}?codigo=${reserva.codigoRecibo}`;
      const qrDataUrl = await QRCode.toDataURL(qrData, { width: 200 });
      const blob = await pdf(<ReciboReservaPDF reserva={reserva} qrDataUrl={qrDataUrl} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo_reserva_${reserva.codigoRecibo}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar PDF');
    }
  };

  if (carregando) return <div className="text-center py-20">Carregando...</div>;

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-6">Minhas Reservas</h1>
      {reservas.length === 0 ? (
        <p>Nenhuma reserva encontrada.</p>
      ) : (
        <div className="grid gap-6">
          {reservas.map((r) => (
            <div key={r.id} className="bg-white p-4 rounded-2xl shadow-md flex flex-wrap justify-between items-center">
              <div>
                <p><strong>Mesa:</strong> {r.mesa.numero}</p>
                <p><strong>Data:</strong> {new Date(r.dataHora).toLocaleString('pt-PT')}</p>
                <p><strong>Pessoas:</strong> {r.quantidadePessoas}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    r.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                    r.status === 'CONFIRMADA' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>{r.status}</span>
                </p>
                <p><strong>Código:</strong> {r.codigoRecibo}</p>
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                {(r.status === 'PENDENTE' || r.status === 'CONFIRMADA') && (
                  <button
                    onClick={() => handleCancelar(r.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
                  >
                    Cancelar
                  </button>
                )}
                {r.status === 'CONFIRMADA' && (
                  <button
                    onClick={() => handleBaixarRecibo(r)}
                    className="bg-primaria text-white px-4 py-2 rounded-full hover:bg-secundaria"
                  >
                    Baixar Recibo
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}