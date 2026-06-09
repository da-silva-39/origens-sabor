/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

interface Pedido {
  id: number;
  cliente: { nome: string };
  agente: { nome: string } | null;
  endereco: string;
  total: number;
  status: string;
  dataPedido: string;
}

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarPedidos = async () => {
    try {
      const res = await api.get('/pedidos/todos');
      setPedidos(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  const atualizarStatus = async (id: number, status: string) => {
    try {
      await api.put(`/pedidos/${id}/status`, { status });
      toast.success('Status atualizado!');
      carregarPedidos();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const atribuirAgente = async (id: number, agenteId: number) => {
    try {
      await api.put(`/pedidos/${id}/agente`, { agenteId });
      toast.success('Agente atribuído!');
      carregarPedidos();
    } catch (error) {
      toast.error('Erro ao atribuir agente');
    }
  };

  if (loading) return <div className="text-center py-20">Carregando...</div>;

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold text-secundaria mb-6">Pedidos</h1>
      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="min-w-full">
          <thead className="bg-secundaria text-white">
            <tr><th className="p-3">ID</th><th>Cliente</th><th>Agente</th><th>Endereço</th><th>Total</th><th>Status</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {pedidos.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{p.id}</td>
                <td className="p-3">{p.cliente.nome}</td>
                <td className="p-3">{p.agente?.nome || 'Não atribuído'}</td>
                <td className="p-3">{p.endereco}</td>
                <td className="p-3">{p.total.toFixed(2)} MT</td>
                <td className="p-3">
                  <select value={p.status} onChange={e => atualizarStatus(p.id, e.target.value)} className="border rounded-full px-2 py-1">
                    <option value="PENDENTE">Pendente</option>
                    <option value="PREPARANDO">Preparando</option>
                    <option value="SAIU_ENTREGA">Saiu entrega</option>
                    <option value="ENTREGUE">Entregue</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </td>
                <td className="p-3">
                  <button onClick={() => atribuirAgente(p.id, 1)} className="bg-primaria text-white px-2 py-1 rounded">Atribuir Agente</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}