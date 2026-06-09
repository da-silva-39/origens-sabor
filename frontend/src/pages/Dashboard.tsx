/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';

import { FiPackage, FiClock, FiDollarSign, FiShoppingCart, FiCoffee, FiArrowRight } from 'react-icons/fi';
import { HiOutlineEmojiHappy } from 'react-icons/hi';

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
      <div className="flex justify-center items-center h-screen bg-fundo">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaria mx-auto"></div>
          <p className="mt-4 text-gray-600">A carregar o seu espaço...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Obter iniciais do nome para avatar
  const iniciais = user?.nome?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <>
      <div className="bg-gradient-to-br from-fundo via-white to-fundo min-h-screen">
        <div className="container-custom py-8 md:py-12">
          {/* Cabeçalho com avatar e boas‑vindas */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-primaria to-secundaria rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                  {iniciais}
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-secundaria">
                    Olá, {user?.nome} 👋
                  </h1>
                  <p className="text-gray-500 mt-1">
                    Que bom ter‑lo de volta! Pronto para fazer o seu pedido?
                  </p>
                </div>
              </div>
              {user?.fotoUrl && (
                <img
                  src={user.fotoUrl}
                  alt="Perfil"
                  className="w-14 h-14 rounded-full object-cover border-2 border-primaria"
                />
              )}
            </div>
          </div>

          {/* Estatísticas com ícones e animações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-md p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-primaria/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primaria/20 transition">
                <FiPackage className="text-3xl text-primaria" />
              </div>
              <div className="text-3xl font-bold text-primaria">{carregandoPedidos ? '…' : estatisticas.totalPedidos}</div>
              <div className="text-gray-600 mt-1">Pedidos realizados</div>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition">
                <FiClock className="text-3xl text-amber-600" />
              </div>
              <div className="text-3xl font-bold text-amber-600">{carregandoPedidos ? '…' : estatisticas.pedidosPendentes}</div>
              <div className="text-gray-600 mt-1">Pedidos pendentes</div>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition">
                <FiDollarSign className="text-3xl text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600">{carregandoPedidos ? '…' : estatisticas.totalGasto.toFixed(2)} MT</div>
              <div className="text-gray-600 mt-1">Total gasto</div>
            </div>
          </div>

          {/* Ações rápidas com ícones e descrições mais cativantes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link
              to="/cardapio"
              className="group relative overflow-hidden bg-gradient-to-r from-primaria to-orange-600 text-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-3 animate-bounce-subtle">🍽️</div>
                <div className="text-xl font-semibold">Explorar Cardápio</div>
                <p className="text-sm opacity-90 mt-2">Descubra novos sabores e faça o seu pedido</p>
                <FiArrowRight className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition" />
              </div>
            </Link>
            <Link
              to="/carrinho"
              className="group relative overflow-hidden bg-gradient-to-r from-secundaria to-amber-800 text-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-3 animate-pulse">🛒</div>
                <div className="text-xl font-semibold">Meu Carrinho</div>
                <p className="text-sm opacity-90 mt-2">Revise os itens e finalize o pedido</p>
                <FiArrowRight className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition" />
              </div>
            </Link>
          </div>

          {/* Últimos pedidos - design mais clean */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-secundaria flex items-center gap-2">
                <FiShoppingCart className="text-primaria" /> Últimos Pedidos
              </h2>
              <Link to="/meus-pedidos" className="text-primaria hover:underline text-sm flex items-center gap-1">
                Ver todos <FiArrowRight size={14} />
              </Link>
            </div>
            {carregandoPedidos ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaria"></div>
              </div>
            ) : pedidos.length === 0 ? (
              <div className="text-center py-12">
                <HiOutlineEmojiHappy className="text-5xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  Ainda não fez nenhum pedido. <Link to="/cardapio" className="text-primaria font-semibold hover:underline">Peça agora!</Link>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pedidos.slice(0, 5).map((pedido, idx) => (
                  <div
                    key={pedido.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 last:border-0 gap-3 hover:bg-gray-50 p-3 rounded-xl transition"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">Pedido #{pedido.id}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(pedido.dataPedido).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          pedido.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                          pedido.status === 'PREPARANDO' ? 'bg-blue-100 text-blue-800' :
                          pedido.status === 'ENTREGUE' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {pedido.status === 'PENDENTE' && '⏳ Pendente'}
                        {pedido.status === 'PREPARANDO' && '👨‍🍳 Preparando'}
                        {pedido.status === 'ENTREGUE' && '✅ Entregue'}
                        {!['PENDENTE', 'PREPARANDO', 'ENTREGUE'].includes(pedido.status) && pedido.status}
                      </span>
                      <span className="font-bold text-primaria text-lg">{pedido.total.toFixed(2)} MT</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dica extra - selo de qualidade */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm text-sm text-gray-600">
              <FiCoffee className="text-primaria" />
              <span>Precisa de ajuda? Contacte‑nos pelo WhatsApp</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}