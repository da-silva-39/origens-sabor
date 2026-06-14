/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';

interface Stats {
  totalUsuarios: number;
  totalProdutos: number;
  totalPedidos: number;
  receitaTotal: number;
}

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalUsuarios: 0,
    totalProdutos: 0,
    totalPedidos: 0,
    receitaTotal: 0,
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      const fetchStats = async () => {
        try {
          const [usuariosRes, produtosRes, pedidosRes] = await Promise.all([
            api.get('/usuarios'),
            api.get('/produtos'),
            api.get('/pedidos/todos'), // endpoint admin
          ]);
          const usuarios = usuariosRes.data;
          const produtos = produtosRes.data;
          const pedidos = pedidosRes.data;
          const receita = pedidos.reduce((acc: number, p: any) => acc + (p.total || 0), 0);
          setStats({
            totalUsuarios: usuarios.length,
            totalProdutos: produtos.length,
            totalPedidos: pedidos.length,
            receitaTotal: receita,
          });
        } catch (error) {
          console.error('Erro ao carregar estatísticas', error);
          toast.error('Erro ao carregar dados do dashboard');
        } finally {
          setCarregando(false);
        }
      };
      fetchStats();
    } else {
      setCarregando(false);
    }
  }, [isAuthenticated, user]);

  if (loading || carregando) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaria"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  return (
    <div className="bg-fundo min-h-screen py-8">
      <div className="container-custom">
        {/* Cabeçalho */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-secundaria">
            Painel Administrativo
          </h1>
          <p className="text-gray-600 mt-2">
            Bem‑vindo, {user?.nome}! Aqui pode gerir todo o sistema.
          </p>
        </div>

        {/* Estatísticas reais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition">
            <div className="text-4xl mb-2">👥</div>
            <div className="text-2xl font-bold text-primaria">{stats.totalUsuarios}</div>
            <div className="text-gray-600">Utilizadores</div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition">
            <div className="text-4xl mb-2">🍽️</div>
            <div className="text-2xl font-bold text-primaria">{stats.totalProdutos}</div>
            <div className="text-gray-600">Produtos</div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition">
            <div className="text-4xl mb-2">📦</div>
            <div className="text-2xl font-bold text-primaria">{stats.totalPedidos}</div>
            <div className="text-gray-600">Pedidos</div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition">
            <div className="text-4xl mb-2">💰</div>
            <div className="text-2xl font-bold text-primaria">{stats.receitaTotal.toFixed(2)} MT</div>
            <div className="text-gray-600">Receita total</div>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Link
            to="/admin/usuarios"
            className="group bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="text-5xl mb-2">👥</div>
            <h2 className="text-xl font-semibold text-secundaria">Utilizadores</h2>
            <p className="text-gray-600 mt-1">Gerir clientes e agentes</p>
          </Link>
          <Link
            to="/admin/produtos"
            className="group bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="text-5xl mb-2">🍽️</div>
            <h2 className="text-xl font-semibold text-secundaria">Produtos</h2>
            <p className="text-gray-600 mt-1">Adicionar, editar ou remover itens</p>
          </Link>
          <Link
            to="/admin/pedidos"
            className="group bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="text-5xl mb-2">📦</div>
            <h2 className="text-xl font-semibold text-secundaria">Pedidos</h2>
            <p className="text-gray-600 mt-1">Acompanhar e actualizar status</p>
          </Link>
          {/* Novos cards */}
          <Link
            to="/admin/reservas"
            className="group bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="text-5xl mb-2">📅</div>
            <h2 className="text-xl font-semibold text-secundaria">Reservas</h2>
            <p className="text-gray-600 mt-1">Gerir pedidos de reserva de mesas</p>
          </Link>
          <Link
            to="/admin/mesas"
            className="group bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="text-5xl mb-2">🪑</div>
            <h2 className="text-xl font-semibold text-secundaria">Mesas</h2>
            <p className="text-gray-600 mt-1">CRUD de mesas e QR codes</p>
          </Link>
        </div>
      </div>
    </div>
  );
}