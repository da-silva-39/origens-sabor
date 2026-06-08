/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import Footer from '../components/Footer';
import Navbar from '../components/navbar';

interface Pedido {
  id: number;
  total: number;
  status: string;
  dataPedido: string;
}

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregandoPedidos, setCarregandoPedidos] = useState(true);
  const [estatisticas, setEstatisticas] = useState({ totalPedidos: 0, pedidosPendentes: 0, totalGasto: 0 });

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchPedidos = async () => {
        try {
          const response = await api.get('/pedidos/cliente');
          const lista = response.data;
          setPedidos(lista);
          const total = lista.length;
          const pendentes = lista.filter((p: Pedido) => p.status === 'PENDENTE').length;
          const gasto = lista.reduce((acc: number, p: Pedido) => acc + p.total, 0);
          setEstatisticas({ totalPedidos: total, pedidosPendentes: pendentes, totalGasto: gasto });
        } catch (error) {
          console.error('Erro ao carregar pedidos', error);
        } finally {
          setCarregandoPedidos(false);
        }
      };
      fetchPedidos();
    } else {
      setCarregandoPedidos(false);
    }
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaria mx-auto"></div>
          <p className="mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <Navbar />
    <div className="bg-fundo min-h-screen flex flex-col">
      {/* Navbar já está incluída no layout (App.tsx) ou pode ser adicionada aqui */}
      <div className="flex-grow py-8">
        <div className="container-custom">
          {/* Cabeçalho de boas‑vindas */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-secundaria">
              Olá, {user?.nome} 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Bem-vindo ao Origens do Sabor! Aqui pode gerir os seus pedidos, explorar o cardápio e muito mais.
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-md p-6 text-center transform hover:scale-105 transition">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-2xl font-bold text-primaria">{carregandoPedidos ? '...' : estatisticas.totalPedidos}</div>
              <div className="text-gray-600">Pedidos realizados</div>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 text-center transform hover:scale-105 transition">
              <div className="text-4xl mb-2">⏳</div>
              <div className="text-2xl font-bold text-primaria">{carregandoPedidos ? '...' : estatisticas.pedidosPendentes}</div>
              <div className="text-gray-600">Pedidos pendentes</div>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 text-center transform hover:scale-105 transition">
              <div className="text-4xl mb-2">💰</div>
              <div className="text-2xl font-bold text-primaria">{carregandoPedidos ? '...' : estatisticas.totalGasto.toFixed(2)} MT</div>
              <div className="text-gray-600">Total gasto</div>
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link to="/cardapio" className="bg-primaria text-white rounded-2xl p-6 text-center shadow-md hover:bg-secundaria transition transform hover:scale-105">
              <div className="text-5xl mb-2">🍽️</div>
              <div className="text-xl font-semibold">Explorar Cardápio</div>
              <p className="text-sm opacity-90 mt-1">Veja os nossos pratos e faça o seu pedido</p>
            </Link>
            <Link to="/carrinho" className="bg-secundaria text-white rounded-2xl p-6 text-center shadow-md hover:bg-primaria transition transform hover:scale-105">
              <div className="text-5xl mb-2">🛒</div>
              <div className="text-xl font-semibold">Meu Carrinho</div>
              <p className="text-sm opacity-90 mt-1">Revise os itens e finalize o pedido</p>
            </Link>
          </div>

          {/* Últimos pedidos */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-secundaria mb-4">📋 Últimos Pedidos</h2>
            {carregandoPedidos ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaria"></div>
              </div>
            ) : pedidos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Ainda não fez nenhum pedido. <Link to="/cardapio" className="text-primaria hover:underline">Peça agora!</Link>
              </p>
            ) : (
              <div className="space-y-4">
                {pedidos.slice(0, 5).map((pedido) => (
                  <div key={pedido.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-gray-800">Pedido #{pedido.id}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {new Date(pedido.dataPedido).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          pedido.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                          pedido.status === 'PREPARANDO' ? 'bg-blue-100 text-blue-800' :
                          pedido.status === 'ENTREGUE' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {pedido.status}
                        </span>
                        <span className="font-bold text-primaria">{pedido.total.toFixed(2)} MT</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="text-center mt-6">
              <Link to="/meus-pedidos" className="text-primaria hover:underline">Ver todos os pedidos →</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      
    </div>
    </>
  );
}