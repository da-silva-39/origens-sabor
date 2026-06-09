/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Pedido {
  id: number;
  clienteNome: string;
  endereco: string;
  total: number;
  status: string;
}

export default function AgenteDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'AGENTE') {
      const fetchPedidos = async () => {
        try {
          const res = await api.get('/pedidos/agente');
          setPedidos(res.data);
        } catch (error) {
          console.error('Erro ao carregar pedidos', error);
        } finally {
          setCarregando(false);
        }
      };
      fetchPedidos();
    } else {
      setCarregando(false);
    }
  }, [isAuthenticated, user]);

  const marcarEntregue = async (id: number) => {
    try {
      await api.put(`/pedidos/${id}/entregue`);
      setPedidos(pedidos.map(p => p.id === id ? { ...p, status: 'ENTREGUE' } : p));
    } catch (error) {
      console.error('Erro ao marcar como entregue', error);
      alert('Não foi possível marcar a entrega.');
    }
  };

  if (loading || carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaria"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'AGENTE') return null;

  return (
    <div className="bg-fundo min-h-screen py-8">
      <div className="container-custom">
        {/* Cabeçalho */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-secundaria">
            Painel do Entregador
          </h1>
          <p className="text-gray-600 mt-2">Bem‑vindo, {user?.nome}! Aqui estão os pedidos atribuídos a si.</p>
        </div>

        {/* Pedidos */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-secundaria mb-4">📋 Pedidos para entrega</h2>
          {pedidos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum pedido atribuído no momento.</p>
          ) : (
            <div className="space-y-6">
              {pedidos.map(pedido => (
                <div key={pedido.id} className="border rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-lg">Pedido #{pedido.id}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          pedido.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                          pedido.status === 'PREPARANDO' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {pedido.status}
                        </span>
                      </div>
                      <p className="text-gray-700"><strong>Cliente:</strong> {pedido.clienteNome}</p>
                      <p className="text-gray-700"><strong>Endereço:</strong> {pedido.endereco}</p>
                      <p className="text-gray-700"><strong>Total:</strong> {pedido.total.toFixed(2)} MT</p>
                    </div>
                    {pedido.status !== 'ENTREGUE' && (
                      <button
                        onClick={() => marcarEntregue(pedido.id)}
                        className="bg-primaria text-white px-6 py-2 rounded-full hover:bg-secundaria transition whitespace-nowrap"
                      >
                        Marcar como entregue
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mapa placeholder (opcional) */}
        <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-secundaria mb-4">📍 Localização em tempo real</h2>
          <div className="bg-gray-200 h-64 rounded-2xl flex items-center justify-center text-gray-500">
            (Mapa integrado em breve)
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            A sua localização será atualizada automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
}