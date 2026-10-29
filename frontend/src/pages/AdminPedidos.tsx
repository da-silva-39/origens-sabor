/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

interface Agente {
  id: number;
  nome: string;
}

interface Pedido {
  id: number;
  cliente: { nome: string };
  agente: { id: number; nome: string } | null;
  endereco: string;
  total: number;
  status: string;
  dataPedido: string;
}

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [loading, setLoading] = useState(true);
  const [atribuindo, setAtribuindo] = useState<number | null>(null);

  const carregarPedidos = async () => {
    try {
      const res = await api.get('/pedidos/todos');
      setPedidos(res.data);
    } catch (error) {
      toast.error('Erro ao carregar pedidos');
    }
  };

  const carregarAgentes = async () => {
    try {
      const res = await api.get('/pedidos/agentes');
      setAgentes(res.data);
    } catch (error) {
      console.error('Erro ao carregar agentes', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([carregarPedidos(), carregarAgentes()]);
      setLoading(false);
    };
    fetchData();
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
    setAtribuindo(id);
    try {
      await api.put(`/pedidos/${id}/agente`, { agenteId });
      toast.success(`Agente atribuído! Notificação enviada.`);
      carregarPedidos();
    } catch (error) {
      toast.error('Erro ao atribuir agente');
    } finally {
      setAtribuindo(null);
    }
  };

  // Função para cores dos status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'PREPARANDO':
        return 'bg-blue-100 text-blue-800';
      case 'SAIU_ENTREGA':
        return 'bg-purple-100 text-purple-800';
      case 'ENTREGUE':
        return 'bg-green-100 text-green-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-20">Carregando...</div>;

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold text-secundaria mb-6">Pedidos</h1>
      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="min-w-full">
          <thead className="bg-secundaria text-white">
            <tr><th className="p-3">ID</th><th>Cliente</th><th>Agente</th><th>Endereço</th><th>Total</th><th>Status</th><th>Atribuir Agente</th></tr>
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
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(p.status)}`}>
                      {p.status}
                    </span>
                    <select
                      value={p.status}
                      onChange={e => atualizarStatus(p.id, e.target.value)}
                      className="border rounded-full px-2 py-1 text-sm"
                    >
                      <option value="PENDENTE">Pendente</option>
                      <option value="PREPARANDO">Preparando</option>
                      <option value="SAIU_ENTREGA">Saiu entrega</option>
                      <option value="ENTREGUE">Entregue</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                  </div>
                </td>
                <td className="p-3">
                  <select
                    onChange={e => atribuirAgente(p.id, Number(e.target.value))}
                    value={p.agente?.id || ''}
                    disabled={atribuindo === p.id}
                    className="border rounded-full px-2 py-1"
                  >
                    <option value="">Selecione</option>
                    {agentes.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.nome}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}