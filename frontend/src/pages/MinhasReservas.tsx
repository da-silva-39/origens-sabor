/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { pdf } from '@react-pdf/renderer';
import { ReciboReservaPDF } from '../components/ReciboReservaPDF';

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

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const res = await api.get('/reservas/minhas');
        setReservas(res.data);
      } catch (error) {
        toast.error('Erro ao carregar reservas');
      } finally {
        setCarregando(false);
      }
    };
    fetchReservas();
  }, []);

  const handleCancelar = async (id: number) => {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) return;
    try {
      await api.delete(`/reservas/${id}`);
      toast.success('Reserva cancelada');
      setReservas(reservas.filter(r => r.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao cancelar');
    }
  };

  const handleBaixarRecibo = async (reserva: Reserva) => {
    try {
      // Buscar dados completos (já temos)
      const blob = await pdf(<ReciboReservaPDF reserva={reserva} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo_reserva_${reserva.codigoRecibo}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
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
              <div className="flex gap-2">
                {r.status === 'PENDENTE' || r.status === 'CONFIRMADA' ? (
                  <button
                    onClick={() => handleCancelar(r.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
                  >
                    Cancelar
                  </button>
                ) : null}
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