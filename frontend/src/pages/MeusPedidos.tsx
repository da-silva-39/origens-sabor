/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { nomeExibicao } from '../data/produtos';
import { imagemDoProduto } from '../data/imagens';
import { toast } from 'react-hot-toast';
import { pdf } from '@react-pdf/renderer';
import { ReciboPedidoPDF } from '../components/ReciboPedidoPDF';
import ContaHeader from '../components/ContaHeader';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  FiAlertCircle,
  FiArrowRight,
  FiChevronDown,
  FiDollarSign,
  FiDownload,
  FiImage,
  FiMapPin,
  FiPackage,
  FiRefreshCw,
  FiShoppingBag,
} from 'react-icons/fi';

interface ItemPedido {
  id: number;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

interface Pedido {
  id: number;
  dataPedido: string;
  total: number;
  status: string;
  endereco: string;
  bairro: string;
  subtotal: number;
  frete: number;
  itens: ItemPedido[];
}

const FILTROS = [
  { valor: '', rotulo: 'Todos' },
  { valor: 'PENDENTE', rotulo: 'Pendente' },
  { valor: 'PREPARANDO', rotulo: 'Em preparação' },
  { valor: 'SAIU_ENTREGA', rotulo: 'A caminho' },
  { valor: 'ENTREGUE', rotulo: 'Entregue' },
  { valor: 'CANCELADO', rotulo: 'Cancelado' },
];

const STATUS_CONFIG: Record<
  string,
  { rotulo: string; chip: string; ponto: string; passo: number }
> = {
  PENDENTE: {
    rotulo: 'Pendente',
    chip: 'bg-dourado/15 text-[#8a6a34]',
    ponto: 'bg-dourado',
    passo: 0,
  },
  PREPARANDO: {
    rotulo: 'Em preparação',
    chip: 'bg-primaria/10 text-primaria',
    ponto: 'bg-primaria',
    passo: 1,
  },
  SAIU_ENTREGA: {
    rotulo: 'A caminho',
    chip: 'bg-oliva/15 text-oliva',
    ponto: 'bg-oliva',
    passo: 2,
  },
  ENTREGUE: {
    rotulo: 'Entregue',
    chip: 'bg-secundaria/10 text-secundaria',
    ponto: 'bg-secundaria',
    passo: 3,
  },
  CANCELADO: {
    rotulo: 'Cancelado',
    chip: 'bg-red-50 text-red-700',
    ponto: 'bg-red-600',
    passo: -1,
  },
};

const ETAPAS = [
  { rotulo: 'Recebido', passo: 0 },
  { rotulo: 'Preparação', passo: 1 },
  { rotulo: 'A caminho', passo: 2 },
  { rotulo: 'Entregue', passo: 3 },
];

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
    year: 'numeric',
  }).format(new Date(valor));
}

function formatarDataHora(valor: string) {
  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(valor));
}

export default function MeusPedidos() {
  useDocumentTitle('As minhas encomendas — Origens do Sabor');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchPedidos = useCallback(async () => {
    try {
      const res = await api.get<Pedido[]>('/pedidos/cliente');
      setPedidos(res.data);
      setErro('');
    } catch {
      setErro('Não foi possível carregar as encomendas.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 10000);
    return () => clearInterval(interval);
  }, [fetchPedidos]);

  const handleBaixarRecibo = async (pedido: Pedido) => {
    try {
      const cliente = JSON.parse(localStorage.getItem('user') || '{}');
      const blob = await pdf(<ReciboPedidoPDF pedido={pedido} cliente={cliente} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pedido_${pedido.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Erro ao gerar PDF');
    }
  };

  const pedidosFiltrados = useMemo(
    () => (filtroStatus ? pedidos.filter((pedido) => pedido.status === filtroStatus) : pedidos),
    [pedidos, filtroStatus]
  );

  const estatisticas = useMemo(() => {
    const emCurso = pedidos.filter((pedido) =>
      ['PENDENTE', 'PREPARANDO', 'SAIU_ENTREGA'].includes(pedido.status)
    ).length;
    const totalGasto = pedidos
      .filter((pedido) => pedido.status !== 'CANCELADO')
      .reduce((acc, pedido) => acc + pedido.total, 0);

    return { total: pedidos.length, emCurso, totalGasto };
  }, [pedidos]);

  const contagens = useMemo(() => {
    const mapa: Record<string, number> = { '': pedidos.length };
    for (const pedido of pedidos) {
      mapa[pedido.status] = (mapa[pedido.status] || 0) + 1;
    }
    return mapa;
  }, [pedidos]);

  return (
    <div className="bg-fundo">
      <ContaHeader
        eyebrow="A sua conta"
        titulo="As minhas encomendas"
        descricao="Acompanhe cada encomenda em tempo real, consulte os artigos e descarregue o recibo do seu pedido."
        acao={
          <Link to="/cardapio" className="btn-light">
            <FiShoppingBag aria-hidden="true" /> Encomendar
          </Link>
        }
      />

      <div className="container-custom py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="border border-carvao/10 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center bg-secundaria/10 text-secundaria">
                <FiPackage aria-hidden="true" />
              </span>
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-carvao/50">
                Encomendas
              </span>
            </div>
            <p className="mt-4 font-display text-3xl text-secundaria">
              {carregando ? '…' : estatisticas.total}
            </p>
            <p className="mt-1 text-xs text-carvao/50">Total de pedidos realizados</p>
          </div>

          <div className="border border-carvao/10 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center bg-primaria/10 text-primaria">
                <FiRefreshCw aria-hidden="true" />
              </span>
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-carvao/50">
                Em curso
              </span>
            </div>
            <p className="mt-4 font-display text-3xl text-secundaria">
              {carregando ? '…' : estatisticas.emCurso}
            </p>
            <p className="mt-1 text-xs text-carvao/50">Pedidos em preparação ou entrega</p>
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
              {carregando ? '…' : formatarPreco(estatisticas.totalGasto)}
            </p>
            <p className="mt-1 text-xs text-carvao/50">Pedidos cancelados não incluídos</p>
          </div>
        </div>

        {erro && (
          <div className="mt-6 flex flex-col gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2">
              <FiAlertCircle aria-hidden="true" /> {erro}
            </span>
            <button
              type="button"
              onClick={() => {
                setCarregando(true);
                fetchPedidos();
              }}
              className="inline-flex items-center gap-1 font-semibold hover:underline"
            >
              Tentar novamente <FiRefreshCw aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-2">
          {FILTROS.map((filtro) => {
            const ativo = filtroStatus === filtro.valor;
            const quantidade = contagens[filtro.valor] || 0;
            return (
              <button
                key={filtro.valor || 'todos'}
                type="button"
                onClick={() => setFiltroStatus(filtro.valor)}
                aria-pressed={ativo}
                className={`inline-flex items-center gap-2 border px-3.5 py-2 text-xs font-semibold transition-colors ${
                  ativo
                    ? 'border-secundaria bg-secundaria text-creme'
                    : 'border-carvao/15 bg-white text-carvao/65 hover:border-carvao/35'
                }`}
              >
                {filtro.rotulo}
                <span
                  className={`inline-flex min-w-5 items-center justify-center px-1 text-[0.6rem] ${
                    ativo ? 'bg-creme/15 text-creme' : 'bg-areia/60 text-carvao/55'
                  }`}
                >
                  {quantidade}
                </span>
              </button>
            );
          })}
        </div>

        {carregando ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, indice) => (
              <div key={indice} className="animate-pulse border border-carvao/10 bg-white p-6">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 bg-areia/60" />
                  <div className="space-y-2">
                    <div className="h-3 w-36 bg-areia/70" />
                    <div className="h-2.5 w-24 bg-areia/50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="mt-6 border border-carvao/10 bg-white p-10 text-center sm:p-14">
            <span className="mx-auto flex h-16 w-16 items-center justify-center bg-areia/50 text-terracota">
              <FiShoppingBag aria-hidden="true" className="h-7 w-7" />
            </span>
            <p className="mt-5 font-display text-2xl text-secundaria">
              {pedidos.length === 0
                ? 'Ainda não fez nenhuma encomenda'
                : 'Nenhuma encomenda neste estado'}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-carvao/55">
              {pedidos.length === 0
                ? 'Comece pelo menu: escolha os seus pratos, adicione ao carrinho e finalize o pedido.'
                : 'Experimente outro filtro para ver as restantes encomendas.'}
            </p>
            {pedidos.length === 0 ? (
              <Link to="/cardapio" className="btn-primary mt-6">
                Ver o menu <FiArrowRight aria-hidden="true" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setFiltroStatus('')}
                className="btn-secondary mt-6"
              >
                Mostrar todas
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {pedidosFiltrados.map((pedido) => {
              const estado = STATUS_CONFIG[pedido.status] || {
                rotulo: pedido.status,
                chip: 'bg-carvao/5 text-carvao/70',
                ponto: 'bg-carvao/40',
                passo: -1,
              };
              const aberto = expandedId === pedido.id;
              const artigos = pedido.itens.reduce((acc, item) => acc + item.quantidade, 0);

              return (
                <article key={pedido.id} className="overflow-hidden border border-carvao/10 bg-white">
                  <button
                    type="button"
                    onClick={() => setExpandedId(aberto ? null : pedido.id)}
                    aria-expanded={aberto}
                    aria-controls={`detalhes-pedido-${pedido.id}`}
                    className="w-full p-5 text-left transition-colors hover:bg-areia/10 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-carvao/10 bg-areia/30 text-secundaria">
                          <FiPackage aria-hidden="true" />
                        </span>
                        <div>
                          <h2 className="font-display text-lg text-secundaria">
                            Encomenda #{pedido.id}
                          </h2>
                          <p className="mt-0.5 text-xs text-carvao/50">
                            {formatarData(pedido.dataPedido)} · {artigos}{' '}
                            {artigos === 1 ? 'artigo' : 'artigos'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:justify-end">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider ${estado.chip}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${estado.ponto}`} />
                          {estado.rotulo}
                        </span>
                        <span className="font-display text-lg text-secundaria">
                          {formatarPreco(pedido.total)}
                        </span>
                        <FiChevronDown
                          aria-hidden="true"
                          className={`shrink-0 text-carvao/30 transition-transform ${
                            aberto ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {pedido.status !== 'CANCELADO' && (
                      <div className="mt-4 grid grid-cols-4 gap-2 border-t border-carvao/5 pt-4">
                        {ETAPAS.map((etapa) => {
                          const concluida = etapa.passo <= estado.passo;
                          return (
                            <div key={etapa.rotulo}>
                              <div
                                className={`h-1 ${
                                  concluida ? 'bg-terracota' : 'bg-carvao/10'
                                }`}
                              />
                              <p
                                className={`mt-2 text-[0.6rem] font-semibold uppercase tracking-[0.12em] ${
                                  concluida ? 'text-terracota' : 'text-carvao/30'
                                }`}
                              >
                                {etapa.rotulo}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {pedido.status === 'CANCELADO' && (
                      <p className="mt-4 border-t border-carvao/5 pt-3 text-xs font-medium text-red-600">
                        Esta encomenda foi cancelada.
                      </p>
                    )}
                  </button>

                  {aberto && (
                    <div
                      id={`detalhes-pedido-${pedido.id}`}
                      className="border-t border-carvao/10 bg-areia/10 p-5 sm:p-6"
                    >
                      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <div>
                          <p className="eyebrow">Artigos</p>
                          <div className="mt-3 divide-y divide-carvao/5 border-y border-carvao/5">
                            {pedido.itens.map((item) => {
                              const imagem = imagemDoProduto(item.produtoNome, null);
                              return (
                                <div key={item.id} className="flex items-center gap-3 py-3">
                                  {imagem ? (
                                    <img
                                      src={imagem}
                                      alt=""
                                      className="h-11 w-11 shrink-0 object-cover"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-areia/50 text-carvao/30">
                                      <FiImage aria-hidden="true" />
                                    </span>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-carvao">
                                      {nomeExibicao(item.produtoNome)}
                                    </p>
                                    <p className="mt-0.5 text-xs text-carvao/45">
                                      {item.quantidade} × {formatarPreco(item.precoUnitario)}
                                    </p>
                                  </div>
                                  <span className="shrink-0 text-sm font-semibold text-secundaria">
                                    {formatarPreco(item.subtotal)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <p className="eyebrow">Entrega</p>
                          <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-carvao/65">
                            <FiMapPin
                              aria-hidden="true"
                              className="mt-0.5 shrink-0 text-terracota"
                            />
                            <span>
                              {pedido.endereco}
                              <span className="block text-xs text-carvao/45">{pedido.bairro}</span>
                            </span>
                          </p>
                          <p className="mt-2 text-xs text-carvao/45">
                            Pedido efetuado a {formatarDataHora(pedido.dataPedido)}
                          </p>

                          <dl className="mt-4 space-y-2 border-t border-carvao/10 pt-4 text-sm">
                            <div className="flex justify-between gap-4 text-carvao/60">
                              <dt>Subtotal</dt>
                              <dd>{formatarPreco(pedido.subtotal)}</dd>
                            </div>
                            <div className="flex justify-between gap-4 text-carvao/60">
                              <dt>Entrega</dt>
                              <dd>{formatarPreco(pedido.frete)}</dd>
                            </div>
                            <div className="flex justify-between gap-4 border-t border-carvao/10 pt-2 font-semibold text-secundaria">
                              <dt>Total</dt>
                              <dd>{formatarPreco(pedido.total)}</dd>
                            </div>
                          </dl>

                          <button
                            type="button"
                            onClick={() => handleBaixarRecibo(pedido)}
                            className="btn-secondary btn-sm mt-5 w-full"
                          >
                            <FiDownload aria-hidden="true" /> Descarregar recibo
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4 border border-carvao/10 bg-areia/30 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-carvao/70">
            Alguma dúvida sobre a sua encomenda? A equipa pode ajudar.
          </p>
          <Link
            to="/contacto"
            className="inline-flex items-center gap-1 text-sm font-semibold text-terracota hover:text-secundaria"
          >
            Contactar o restaurante <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
