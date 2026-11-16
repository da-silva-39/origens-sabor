/* eslint-disable react-hooks/set-state-in-effect */
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useCartStore } from '../hooks/useCartStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { RESTAURANTE } from '../data/restaurante';
import {
  FiArrowRight,
  FiCalendar,
  FiChevronRight,
  FiClock,
  FiDollarSign,
  FiHelpCircle,
  FiPackage,
  FiShoppingBag,
  FiUser,
} from 'react-icons/fi';

interface ItemPedido {
  quantidade: number;
}

interface Pedido {
  id: number;
  total: number;
  status: string;
  dataPedido: string;
  itens?: ItemPedido[];
}

const ESTADO_PEDIDO: Record<string, { rotulo: string; classe: string; ponto: string }> = {
  PENDENTE: {
    rotulo: 'Pendente',
    classe: 'bg-dourado/15 text-[#8a6a34]',
    ponto: 'bg-dourado',
  },
  PREPARANDO: {
    rotulo: 'Em preparação',
    classe: 'bg-primaria/10 text-primaria',
    ponto: 'bg-primaria',
  },
  SAIU_ENTREGA: {
    rotulo: 'A caminho',
    classe: 'bg-oliva/15 text-oliva',
    ponto: 'bg-oliva',
  },
  ENTREGUE: {
    rotulo: 'Entregue',
    classe: 'bg-secundaria/10 text-secundaria',
    ponto: 'bg-secundaria',
  },
  CANCELADO: {
    rotulo: 'Cancelado',
    classe: 'bg-red-50 text-red-700',
    ponto: 'bg-red-600',
  },
};

function formatarPreco(valor: number) {
  return `${new Intl.NumberFormat('pt-MZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor)} MT`;
}

function formatarData(valor: string) {
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(valor));
}

export default function Dashboard() {
  useDocumentTitle('O meu painel — Origens do Sabor');
  const { user, isAuthenticated, loading } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregandoPedidos, setCarregandoPedidos] = useState(true);
  const totalItens = useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.quantidade, 0)
  );

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setCarregandoPedidos(false);
      return;
    }

    let ativo = true;
    api
      .get<Pedido[]>('/pedidos/cliente')
      .then((response) => {
        if (ativo) setPedidos(response.data);
      })
      .catch((error) => {
        console.error('Erro ao carregar pedidos', error);
      })
      .finally(() => {
        if (ativo) setCarregandoPedidos(false);
      });

    return () => {
      ativo = false;
    };
  }, [isAuthenticated, user]);

  const estatisticas = useMemo(() => {
    const emCurso = pedidos.filter((pedido) =>
      ['PENDENTE', 'PREPARANDO', 'SAIU_ENTREGA'].includes(pedido.status)
    ).length;
    const totalGasto = pedidos
      .filter((pedido) => pedido.status !== 'CANCELADO')
      .reduce((acc, pedido) => acc + pedido.total, 0);

    return {
      totalPedidos: pedidos.length,
      emCurso,
      totalGasto,
    };
  }, [pedidos]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primaria" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const primeiroNome = user?.nome?.split(' ')[0] || 'cliente';
  const iniciais =
    user?.nome
      ?.split(' ')
      .filter(Boolean)
      .map((parte) => parte[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'OS';

  return (
    <div className="bg-fundo">
      <section className="relative overflow-hidden bg-secundaria text-creme">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(193,154,91,0.22),transparent_45%)]" />
        <div className="container-custom relative py-10 sm:py-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              {user?.fotoUrl ? (
                <img
                  src={user.fotoUrl}
                  alt=""
                  className="h-20 w-20 rounded-full border border-dourado/40 object-cover ring-4 ring-creme/10"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dourado/40 bg-creme/10 font-display text-2xl text-creme ring-4 ring-creme/10">
                  {iniciais}
                </div>
              )}
              <div>
                <p className="eyebrow text-dourado">A sua conta</p>
                <h1 className="mt-2 font-display text-3xl text-creme sm:text-4xl">
                  Olá, {primeiroNome}
                </h1>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-creme/70">
                  Aqui encontra as suas encomendas, reservas e atalhos para tudo o
                  que precisa no Origens do Sabor.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/perfil"
                className="btn border border-creme/25 text-creme hover:border-creme hover:bg-creme/10"
              >
                <FiUser aria-hidden="true" /> O meu perfil
              </Link>
              <Link to="/cardapio" className="btn-light">
                Encomendar <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom py-10 sm:py-14">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="border border-carvao/10 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center bg-primaria/10 text-primaria">
                <FiPackage aria-hidden="true" />
              </span>
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-carvao/50">
                Encomendas
              </span>
            </div>
            <p className="mt-4 font-display text-3xl text-secundaria">
              {carregandoPedidos ? '…' : estatisticas.totalPedidos}
            </p>
            <p className="mt-1 text-xs text-carvao/50">Total de pedidos realizados</p>
          </div>

          <div className="border border-carvao/10 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center bg-dourado/15 text-[#8a6a34]">
                <FiClock aria-hidden="true" />
              </span>
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-carvao/50">
                Em curso
              </span>
            </div>
            <p className="mt-4 font-display text-3xl text-secundaria">
              {carregandoPedidos ? '…' : estatisticas.emCurso}
            </p>
            <p className="mt-1 text-xs text-carvao/50">Pedidos a serem preparados ou entregues</p>
          </div>

          <div className="border border-carvao/10 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center bg-oliva/15 text-oliva">
                <FiDollarSign aria-hidden="true" />
              </span>
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-carvao/50">
                Total gasto
              </span>
            </div>
            <p className="mt-4 font-display text-3xl text-secundaria">
              {carregandoPedidos ? '…' : formatarPreco(estatisticas.totalGasto)}
            </p>
            <p className="mt-1 text-xs text-carvao/50">Pedidos cancelados não incluídos</p>
          </div>
        </div>

        <div className="mt-10 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Atalhos</p>
            <h2 className="mt-2 font-display text-2xl text-secundaria sm:text-3xl">
              O que deseja fazer?
            </h2>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <Link
            to="/cardapio"
            className="group relative flex min-h-[19rem] flex-col justify-end overflow-hidden border border-carvao/10 bg-secundaria p-7 text-creme"
          >
            <img
              src="/prato apresentacao.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-45 transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secundaria via-secundaria/80 to-secundaria/25" />
            <div className="relative">
              <span className="inline-flex h-11 w-11 items-center justify-center border border-dourado/40 text-dourado">
                <FiShoppingBag aria-hidden="true" className="h-5 w-5" />
              </span>
              <p className="eyebrow mt-5 text-dourado">Encomendas</p>
              <h3 className="mt-2 font-display text-2xl text-creme sm:text-3xl">
                Comece pelo menu
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-creme/70">
                Escolha os seus pratos, adicione ao carrinho e receba em casa ou
                levante no restaurante.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-creme">
                Ver o menu
                <FiArrowRight
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </div>
          </Link>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <Link
              to="/meus-pedidos"
              className="group flex items-start justify-between gap-4 border border-carvao/10 bg-white p-6 transition-colors hover:border-terracota/40 hover:bg-areia/20"
            >
              <div>
                <span className="inline-flex h-10 w-10 items-center justify-center bg-primaria/10 text-primaria">
                  <FiPackage aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-xl text-secundaria">
                  Acompanhar encomendas
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-carvao/55">
                  Consulte o estado de cada pedido e descarregue o recibo.
                </p>
              </div>
              <FiArrowRight
                aria-hidden="true"
                className="mt-1 shrink-0 text-carvao/30 transition-all group-hover:translate-x-1 group-hover:text-terracota"
              />
            </Link>

            <Link
              to="/carrinho"
              className="group flex items-start justify-between gap-4 border border-carvao/10 bg-white p-6 transition-colors hover:border-terracota/40 hover:bg-areia/20"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center bg-secundaria/10 text-secundaria">
                    <FiShoppingBag aria-hidden="true" />
                  </span>
                  {totalItens > 0 && (
                    <span className="inline-flex min-w-6 items-center justify-center bg-terracota px-2 py-0.5 text-[0.65rem] font-bold text-white">
                      {totalItens} {totalItens === 1 ? 'artigo' : 'artigos'}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 font-display text-xl text-secundaria">O meu carrinho</h3>
                <p className="mt-1 text-sm leading-relaxed text-carvao/55">
                  {totalItens > 0
                    ? 'Revise os artigos escolhidos e finalize o pedido.'
                    : 'O carrinho está vazio. Escolha algo do menu para começar.'}
                </p>
              </div>
              <FiArrowRight
                aria-hidden="true"
                className="mt-1 shrink-0 text-carvao/30 transition-all group-hover:translate-x-1 group-hover:text-terracota"
              />
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Link
            to="/reservar-mesa"
            className="group flex items-start gap-4 border border-carvao/10 bg-white p-5 transition-colors hover:border-terracota/40 hover:bg-areia/20"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center bg-terracota/10 text-terracota">
              <FiCalendar aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-lg text-secundaria">Reservar mesa</span>
              <span className="mt-1 block text-xs leading-relaxed text-carvao/55">
                Garanta o seu lugar para almoço ou jantar.
              </span>
            </span>
            <FiChevronRight
              aria-hidden="true"
              className="ml-auto mt-2 shrink-0 text-carvao/25 transition-transform group-hover:translate-x-0.5"
            />
          </Link>

          <Link
            to="/minhas-reservas"
            className="group flex items-start gap-4 border border-carvao/10 bg-white p-5 transition-colors hover:border-terracota/40 hover:bg-areia/20"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center bg-dourado/15 text-[#8a6a34]">
              <FiClock aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-lg text-secundaria">Minhas reservas</span>
              <span className="mt-1 block text-xs leading-relaxed text-carvao/55">
                Veja os detalhes, estado e recibos das reservas.
              </span>
            </span>
            <FiChevronRight
              aria-hidden="true"
              className="ml-auto mt-2 shrink-0 text-carvao/25 transition-transform group-hover:translate-x-0.5"
            />
          </Link>

          <Link
            to="/perfil"
            className="group flex items-start gap-4 border border-carvao/10 bg-white p-5 transition-colors hover:border-terracota/40 hover:bg-areia/20"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center bg-secundaria/10 text-secundaria">
              <FiUser aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-lg text-secundaria">Os meus dados</span>
              <span className="mt-1 block text-xs leading-relaxed text-carvao/55">
                Atualize o perfil, contactos e palavra-passe.
              </span>
            </span>
            <FiChevronRight
              aria-hidden="true"
              className="ml-auto mt-2 shrink-0 text-carvao/25 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <section className="mt-10 border border-carvao/10 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-carvao/10 p-5 sm:px-6">
            <div>
              <p className="eyebrow">Atividade</p>
              <h2 className="mt-1 font-display text-xl text-secundaria sm:text-2xl">
                Encomendas recentes
              </h2>
            </div>
            <Link
              to="/meus-pedidos"
              className="inline-flex items-center gap-1 text-xs font-semibold text-terracota hover:text-secundaria"
            >
              Ver todas <FiArrowRight aria-hidden="true" />
            </Link>
          </div>

          {carregandoPedidos ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 3 }).map((_, indice) => (
                <div key={indice} className="h-14 animate-pulse bg-areia/50" />
              ))}
            </div>
          ) : pedidos.length === 0 ? (
            <div className="p-10 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center bg-areia/60 text-terracota">
                <FiPackage aria-hidden="true" className="h-6 w-6" />
              </span>
              <p className="mt-4 font-display text-xl text-secundaria">
                Ainda não fez nenhuma encomenda
              </p>
              <p className="mt-1 text-sm text-carvao/55">
                Comece pelo menu e receba o seu pedido em casa.
              </p>
              <Link to="/cardapio" className="btn-primary mt-5">
                Ver o menu <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-carvao/5">
              {pedidos.slice(0, 4).map((pedido) => {
                const estado = ESTADO_PEDIDO[pedido.status] || {
                  rotulo: pedido.status,
                  classe: 'bg-carvao/5 text-carvao/70',
                  ponto: 'bg-carvao/40',
                };
                const artigos = pedido.itens?.reduce(
                  (acc, item) => acc + item.quantidade,
                  0
                );

                return (
                  <Link
                    key={pedido.id}
                    to="/meus-pedidos"
                    className="flex flex-col gap-3 p-5 transition-colors hover:bg-areia/15 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center border border-carvao/10 bg-areia/30 text-secundaria">
                        <FiPackage aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-carvao">
                          Encomenda #{pedido.id}
                        </p>
                        <p className="mt-0.5 text-xs text-carvao/50">
                          {formatarData(pedido.dataPedido)}
                          {artigos ? ` · ${artigos} ${artigos === 1 ? 'artigo' : 'artigos'}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:justify-end">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider ${estado.classe}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${estado.ponto}`} />
                        {estado.rotulo}
                      </span>
                      <span className="font-display text-base text-secundaria">
                        {formatarPreco(pedido.total)}
                      </span>
                      <FiChevronRight aria-hidden="true" className="text-carvao/25" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <div className="mt-6 flex flex-col gap-4 border border-carvao/10 bg-areia/30 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <FiHelpCircle aria-hidden="true" className="text-xl text-terracota" />
            <p className="text-sm text-carvao/70">
              Precisa de ajuda com uma encomenda ou reserva?
            </p>
          </div>
          <a
            href={RESTAURANTE.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-terracota hover:text-secundaria"
          >
            Falar connosco <FiArrowRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
