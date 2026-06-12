/* eslint-disable react-hooks/set-state-in-effect */
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
  observacoes?: string;
  cliente: { nome: string; email: string; telefone?: string };
  mesa: { numero: number };
}

export default function AdminReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);

  const fetchReservas = async () => {
    try {
      const res = await api.get('/reservas/admin/todas');
      setReservas(res.data);
    } catch (error) {
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
    } catch (error) {
      toast.error('Erro ao confirmar');
    }
  };

  const handleCancelar = async (id: number) => {
    if (!confirm('Cancelar esta reserva?')) return;
    try {
      await api.patch(`/reservas/admin/${id}/cancelar`);
      toast.success('Reserva cancelada');
      fetchReservas();
    } catch (error) {
      toast.error('Erro ao cancelar');
    }
  };

  const handleBaixarRecibo = async (reserva: Reserva) => {
    try {
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
      <h1 className="text-3xl font-bold mb-6">Gestão de Reservas</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-2xl shadow">
          <thead className="bg-secundaria text-white">
            <tr>
              <th className="p-3">ID</th><th>Cliente</th><th>Mesa</th><th>Data/Hora</th><th>Pessoas</th><th>Status</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-3">{r.id}</td>
                <td>{r.cliente.nome}</td>
                <td>Mesa {r.mesa.numero}</td>
                <td>{new Date(r.dataHora).toLocaleString('pt-PT')}</td>
                <td>{r.quantidadePessoas}</td>
                <td>{r.status}</td>
                <td className="space-x-2">
                  {r.status === 'PENDENTE' && (
                    <button onClick={() => handleConfirmar(r.id)} className="bg-green-600 text-white px-3 py-1 rounded-full text-sm hover:bg-green-700">Confirmar</button>
                  )}
                  {(r.status === 'PENDENTE' || r.status === 'CONFIRMADA') && (
                    <button onClick={() => handleCancelar(r.id)} className="bg-red-600 text-white px-3 py-1 rounded-full text-sm hover:bg-red-700">Cancelar</button>
                  )}
                  <button onClick={() => handleBaixarRecibo(r)} className="bg-primaria text-white px-3 py-1 rounded-full text-sm hover:bg-secundaria">Recibo</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}