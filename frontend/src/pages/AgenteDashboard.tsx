/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { FiMapPin, FiPackage, FiClock } from 'react-icons/fi';

interface Pedido {
  id: number;
  clienteNome: string;
  endereco: string;
  total: number;
  status: string;
  itens: { produtoNome: string; quantidade: number }[];
  bairro: string;
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
          // Notificar o agente quando novos pedidos são atribuídos (exemplo simples)
          if (res.data.length > 0 && pedidos.length === 0) {
            toast.success(`Você tem ${res.data.length} pedido(s) para entregar!`);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setCarregando(false);
        }
      };
      fetchPedidos();
      const interval = setInterval(fetchPedidos, 30000); // atualiza a cada 30s
      return () => clearInterval(interval);
    } else {
      setCarregando(false);
    }
  }, [isAuthenticated, user]);

  const marcarEntregue = async (id: number) => {
    try {
      await api.put(`/pedidos/${id}/entregue`);
      toast.success(`Pedido #${id} marcado como entregue!`);
      setPedidos(pedidos.filter(p => p.id !== id));
    } catch (error) {
      toast.error('Erro ao marcar como entregue');
    }
  };

  if (loading || carregando) return <div className="text-center py-20">Carregando...</div>;
  if (!isAuthenticated || user?.role !== 'AGENTE') return null;

  return (
    <div className="bg-fundo min-h-screen py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-secundaria mb-4">Painel do Entregador</h1>
        <p className="text-gray-600 mb-8">Bem-vindo, {user?.nome}! Aqui estão os pedidos atribuídos a si.</p>

        {pedidos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum pedido atribuído no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pedidos.map(pedido => (
              <div key={pedido.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="bg-primaria text-white px-4 py-2">
                  <span className="font-bold">Pedido #{pedido.id}</span>
                </div>
                <div className="p-4 space-y-3">
                  <p><strong>Cliente:</strong> {pedido.clienteNome}</p>
                  <p className="flex items-center gap-1"><FiMapPin /> <strong>Endereço:</strong> {pedido.endereco} - {pedido.bairro}</p>
                  <p><strong>Itens:</strong></p>
                  <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                    {pedido.itens.map((item, idx) => (
                      <li key={idx}>{item.quantidade}x {item.produtoNome}</li>
                    ))}
                  </ul>
                  <p><strong>Total:</strong> {pedido.total.toFixed(2)} MT</p>
                  <div className="flex justify-between items-center pt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      pedido.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                      pedido.status === 'PREPARANDO' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {pedido.status}
                    </span>
                    <button
                      onClick={() => marcarEntregue(pedido.id)}
                      className="bg-primaria text-white px-4 py-2 rounded-full hover:bg-secundaria transition"
                    >
                      Marcar como entregue
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}