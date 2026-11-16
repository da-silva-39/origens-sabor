/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import ContaHeader from '../components/ContaHeader';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  FiCalendar,
  FiChevronRight,
  FiDollarSign,
  FiGrid,
  FiPackage,
  FiShoppingBag,
  FiUser,
  FiUsers,
} from 'react-icons/fi';

interface Stats {
  totalUsuarios: number;
  totalProdutos: number;
  totalPedidos: number;
  receitaTotal: number;
}

const ATALHOS = [
  {
    to: '/admin/pedidos',
    icone: FiPackage,
    rotulo: 'Pedidos',
    descricao: 'Acompanhar e actualizar o estado das encomendas.',
    tile: 'bg-primaria/10 text-primaria',
  },
  {
    to: '/admin/reservas',
    icone: FiCalendar,
    rotulo: 'Reservas',
    descricao: 'Confirmar, cancelar e gerir pedidos de reserva.',
    tile: 'bg-oliva/15 text-oliva',
  },
  {
    to: '/admin/produtos',
    icone: FiShoppingBag,
    rotulo: 'Produtos',
    descricao: 'Adicionar, editar ou remover itens do menu.',
    tile: 'bg-dourado/15 text-[#8a6a34]',
  },
  {
    to: '/admin/usuarios',
    icone: FiUsers,
    rotulo: 'Utilizadores',
    descricao: 'Gerir clientes, agentes e administradores.',
    tile: 'bg-secundaria/10 text-secundaria',
  },
  {
    to: '/admin/mesas',
    icone: FiGrid,
    rotulo: 'Mesas',
    descricao: 'Gerir mesas e códigos QR do restaurante.',
    tile: 'bg-terracota/10 text-terracota',
  },
  {
    to: '/perfil',
    icone: FiUser,
    rotulo: 'O meu perfil',
    descricao: 'Os seus dados, contactos e palavra-passe.',
    tile: 'bg-carvao/5 text-carvao/60',
  },
];

export default function AdminDashboard() {
  useDocumentTitle('Painel administrativo — Origens do Sabor');
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
            api.get('/pedidos/todos'),
          ]);
          const usuarios = usuariosRes.data;
          const produtos = produtosRes.data;
          const pedidos = pedidosRes.data;
          const receita = pedidos
            .filter((pedido: { status?: string }) => pedido.status !== 'CANCELADO')
            .reduce(
              (acc: number, pedido: { total?: number | null }) => acc + (pedido.total ?? 0),
              0
            );
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
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primaria" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  return (
    <div className="bg-fundo">
      <ContaHeader
        eyebrow="Administração"
        titulo="Painel administrativo"
        descricao={`Bem-vindo, ${user?.nome}! Aqui encontra os atalhos para gerir a loja inteira.`}
        voltarPara="/"
        voltarRotulo="Voltar ao início"
      />

      <div className="container-custom py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-carvao/10 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center bg-secundaria/10 text-secundaria">
                <FiUsers aria-hidden="true" />
              </span>
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-carvao/50">
                Utilizadores
              </span>
            </div>
            <p className="mt-4 font-display text-3xl text-secundaria">{stats.totalUsuarios}</p>
            <p className="mt-1 text-xs text-carvao/50">Contas registadas no sistema</p>
          </div>

          <div className="border border-carvao/10 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center bg-dourado/15 text-[#8a6a34]">
                <FiShoppingBag aria-hidden="true" />
              </span>
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-carvao/50">
                Produtos
              </span>
            </div>
            <p className="mt-4 font-display text-3xl text-secundaria">{stats.totalProdutos}</p>
            <p className="mt-1 text-xs text-carvao/50">Itens registados no menu</p>
          </div>

          <div className="border border-carvao/10 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center bg-primaria/10 text-primaria">
                <FiPackage aria-hidden="true" />
              </span>
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-carvao/50">
                Pedidos
              </span>
            </div>
            <p className="mt-4 font-display text-3xl text-secundaria">{stats.totalPedidos}</p>
            <p className="mt-1 text-xs text-carvao/50">Encomendas registadas</p>
          </div>

          <div className="border border-carvao/10 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center bg-oliva/15 text-oliva">
                <FiDollarSign aria-hidden="true" />
              </span>
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-carvao/50">
                Receita
              </span>
            </div>
            <p className="mt-4 font-display text-2xl text-secundaria sm:text-3xl">
              {new Intl.NumberFormat('pt-MZ', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(stats.receitaTotal)}{' '}
              MT
            </p>
            <p className="mt-1 text-xs text-carvao/50">Pedidos cancelados não incluídos</p>
          </div>
        </div>

        <div className="mt-10 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Gestão</p>
            <h2 className="mt-2 font-display text-2xl text-secundaria sm:text-3xl">
              O que deseja gerir?
            </h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ATALHOS.map((atalho) => (
            <Link
              key={atalho.to}
              to={atalho.to}
              className="group flex items-start justify-between gap-4 border border-carvao/10 bg-white p-5 transition-colors hover:border-terracota/40 hover:bg-areia/20"
            >
              <div className="min-w-0">
                <span
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center ${atalho.tile}`}
                >
                  <atalho.icone aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg text-secundaria">{atalho.rotulo}</h3>
                <p className="mt-1 text-xs leading-relaxed text-carvao/55">
                  {atalho.descricao}
                </p>
              </div>
              <FiChevronRight
                aria-hidden="true"
                className="mt-2 shrink-0 text-carvao/25 transition-all group-hover:translate-x-0.5 group-hover:text-terracota"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
