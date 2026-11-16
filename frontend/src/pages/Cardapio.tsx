import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FiSearch,
  FiShoppingBag,
  FiImage,
  FiArrowRight,
  FiX,
} from "react-icons/fi";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useCartStore } from "../hooks/useCartStore";
import { imagemDoProduto } from "../data/imagens";
import { descricaoExibicao, nomeExibicao, rotuloCategoria } from "../data/produtos";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

interface Produto {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  categoria: string;
  imagemUrl: string | null;
  disponivel?: boolean;
  destaque?: boolean;
}

const ORDEM_CATEGORIAS = [
  "Entradas",
  "Peixes",
  "Massas & Pratos",
  "Hamburguer",
  "Cafe e Cha",
];

function formatarPreco(valor: number) {
  return `${new Intl.NumberFormat("pt-MZ", {
    minimumFractionDigits: Number.isInteger(valor) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(valor)} MT`;
}

export default function Cardapio() {
  useDocumentTitle("Menu — Origens do Sabor");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todas");

  const carregarProdutos = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const res = await api.get<Produto[]>("/produtos");
      setProdutos(res.data);
    } catch {
      setErro("Não foi possível carregar o menu. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarProdutos();
  }, [carregarProdutos]);

  const categorias = useMemo(() => {
    const presentes = new Set(produtos.map((p) => p.categoria));
    const ordenadas = [...presentes].sort((a, b) => {
      const posA = ORDEM_CATEGORIAS.indexOf(a);
      const posB = ORDEM_CATEGORIAS.indexOf(b);
      if (posA !== -1 || posB !== -1) {
        return (posA === -1 ? 99 : posA) - (posB === -1 ? 99 : posB);
      }
      return a.localeCompare(b, "pt");
    });
    return ["Todas", ...ordenadas];
  }, [produtos]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return produtos.filter((produto) => {
      if (categoria !== "Todas" && produto.categoria !== categoria) return false;
      if (!termo) return true;
      return (
        nomeExibicao(produto.nome).toLowerCase().includes(termo) ||
        (descricaoExibicao(produto.descricao) || "").toLowerCase().includes(termo)
      );
    });
  }, [produtos, busca, categoria]);

  const grupos = useMemo(() => {
    return filtrados.reduce<Record<string, Produto[]>>((acc, produto) => {
      acc[produto.categoria] = acc[produto.categoria] || [];
      acc[produto.categoria].push(produto);
      return acc;
    }, {});
  }, [filtrados]);

  const categoriasVisiveis = useMemo(() => {
    const ordem = categoria === "Todas" ? categorias.slice(1) : [categoria];
    return ordem.filter((nome) => grupos[nome]?.length);
  }, [categoria, categorias, grupos]);

  const adicionarAoCarrinho = (produto: Produto) => {
    if (produto.disponivel === false) return;
    if (!isAuthenticated) {
      toast("Crie uma conta para encomendar.", { icon: "ℹ️" });
      navigate("/login");
      return;
    }
    addItem({
      id: produto.id,
      nome: nomeExibicao(produto.nome),
      preco: produto.preco,
      quantidade: 1,
      imagemUrl: imagemDoProduto(produto.nome, produto.imagemUrl) || undefined,
    });
    toast.success(`${nomeExibicao(produto.nome)} adicionado ao carrinho`);
  };

  return (
    <div>
      <section className="border-b border-carvao/10 bg-white/60">
        <div className="container-custom py-12 sm:py-16">
          <p className="eyebrow">Menu</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">
            O que temos hoje
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-carvao/65 sm:text-base">
            Entradas, peixe, massas, hambúrgueres e café. Os pratos e preços são
            atualizados pela equipa do restaurante. Para encomendas, adicione ao
            carrinho e finalize com a sua conta.
          </p>
        </div>
      </section>

      <div className="sticky top-[4.6rem] z-30 border-b border-carvao/10 bg-fundo/95 backdrop-blur">
        <div className="container-custom flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categorias.map((nome) => (
              <button
                key={rotuloCategoria(nome)}
                type="button"
                onClick={() => setCategoria(nome)}
                className={`shrink-0 border px-4 py-2 text-xs font-semibold transition-colors ${
                  categoria === nome
                    ? "border-secundaria bg-secundaria text-creme"
                    : "border-carvao/15 text-carvao/70 hover:border-carvao/35"
                }`}
                aria-pressed={categoria === nome}
              >
                {rotuloCategoria(nome)}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <FiSearch
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-carvao/40"
            />
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar prato..."
              aria-label="Buscar prato"
              className="input py-2.5 pl-9 pr-9"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca("")}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-carvao/40 hover:text-carvao"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-12 sm:py-16">
        {carregando ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 6 }).map((_, indice) => (
              <div key={indice} className="animate-pulse border border-carvao/10 bg-white">
                <div className="aspect-[4/3] bg-areia/60" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-2/3 bg-areia/70" />
                  <div className="h-3 w-full bg-areia/50" />
                  <div className="h-3 w-1/3 bg-areia/50" />
                </div>
              </div>
            ))}
          </div>
        ) : erro ? (
          <div className="border border-carvao/15 bg-white p-10 text-center">
            <p className="text-sm text-carvao/70">{erro}</p>
            <button type="button" onClick={carregarProdutos} className="btn-primary mt-5">
              Tentar novamente
            </button>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="border border-carvao/15 bg-white p-10 text-center">
            <p className="font-display text-2xl text-secundaria">
              Nenhum prato encontrado
            </p>
            <p className="mt-2 text-sm text-carvao/60">
              Tente outra categoria ou limpe a pesquisa.
            </p>
            <button
              type="button"
              onClick={() => {
                setBusca("");
                setCategoria("Todas");
              }}
              className="btn-secondary mt-5"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {categoriasVisiveis.map((nomeCategoria) => (
              <section key={nomeCategoria} aria-labelledby={`categoria-${nomeCategoria}`}>
                <div className="flex items-baseline justify-between gap-4 border-b border-carvao/15 pb-3">
                  <h2
                    id={`categoria-${nomeCategoria}`}
                    className="font-display text-2xl text-secundaria sm:text-3xl"
                  >
                    {rotuloCategoria(nomeCategoria)}
                  </h2>
                  <span className="text-xs uppercase tracking-[0.16em] text-carvao/40">
                    {grupos[nomeCategoria].length} pratos
                  </span>
                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {grupos[nomeCategoria].map((produto) => {
                    const imagem = imagemDoProduto(produto.nome, produto.imagemUrl);
                    const esgotado = produto.disponivel === false;
                    return (
                      <article
                        key={produto.id}
                        className="group flex flex-col border border-carvao/10 bg-white transition-shadow hover:shadow-suave"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-areia/40">
                          {imagem ? (
                            <img
                              src={imagem}
                              alt={nomeExibicao(produto.nome)}
                              loading="lazy"
                              width={640}
                              height={480}
                              className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
                                esgotado ? "opacity-50 grayscale" : ""
                              }`}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-carvao/25">
                              <FiImage className="h-9 w-9" aria-hidden="true" />
                            </div>
                          )}
                          {produto.destaque && !esgotado && (
                            <span className="absolute left-3 top-3 bg-fundo/95 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-terracota">
                              Sugestão da casa
                            </span>
                          )}
                          {esgotado && (
                            <span className="absolute left-3 top-3 bg-carvao/80 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-creme">
                              Esgotado
                            </span>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col p-5">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-display text-xl leading-snug text-secundaria">
                              {nomeExibicao(produto.nome)}
                            </h3>
                            <span className="shrink-0 font-display text-lg text-terracota">
                              {formatarPreco(produto.preco)}
                            </span>
                          </div>
                          <p className="mt-2 flex-1 text-sm leading-relaxed text-carvao/60">
                            {descricaoExibicao(produto.descricao) || "Consulte a equipa para mais detalhes."}
                          </p>
                          <button
                            type="button"
                            onClick={() => adicionarAoCarrinho(produto)}
                            disabled={esgotado}
                            className="mt-5 inline-flex items-center justify-center gap-2 border border-secundaria/20 px-4 py-2.5 text-xs font-semibold text-secundaria transition-colors hover:border-secundaria hover:bg-secundaria hover:text-creme disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-secundaria/20 disabled:hover:bg-transparent disabled:hover:text-secundaria"
                          >
                            <FiShoppingBag aria-hidden="true" />
                            {esgotado ? "Indisponível" : "Adicionar ao carrinho"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}

            <div className="flex flex-col items-start justify-between gap-4 border-t border-carvao/15 pt-8 sm:flex-row sm:items-center">
              <p className="text-sm text-carvao/60">
                Precisa de ajuda a escolher ou quer encomendar para um grupo?
              </p>
              <a
                href="https://wa.me/258860151122?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20sobre%20o%20menu."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-terracota hover:text-secundaria"
              >
                Falar connosco <FiArrowRight aria-hidden="true" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
