import { useEffect, useState } from "react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiMapPin,
  FiPhone,
  FiArrowUpRight,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import api from "../services/api";
import { RESTAURANTE } from "../data/restaurante";
import { GALERIA, HERO_SLIDES, imagemDoProduto } from "../data/imagens";
import { descricaoExibicao, nomeExibicao, rotuloCategoria } from "../data/produtos";

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

function formatarPreco(valor: number) {
  return `${new Intl.NumberFormat("pt-MZ", {
    minimumFractionDigits: Number.isInteger(valor) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(valor)} MT`;
}

function selecionarDestaques(produtos: Produto[]) {
  const disponiveis = produtos.filter((p) => p.disponivel !== false);
  const marcados = disponiveis.filter((p) => p.destaque);
  const escolhidos: Produto[] = [];
  const usados = new Set<string>();

  const adicionar = (produto?: Produto) => {
    if (!produto || escolhidos.length >= 4) return;
    const base = nomeExibicao(produto.nome).toUpperCase();
    if (usados.has(base)) return;
    usados.add(base);
    escolhidos.push(produto);
  };

  marcados.forEach(adicionar);

  const categoriasPrioritarias = ["Massas & Pratos", "Peixes", "Entradas", "Hamburguer"];

  categoriasPrioritarias.forEach((categoria) => {
    const lista = disponiveis.filter((p) => p.categoria === categoria);
    const comImagem = lista.find((p) => imagemDoProduto(p.nome, p.imagemUrl));
    adicionar(comImagem || lista[0]);
  });

  disponiveis.forEach(adicionar);

  return escolhidos.slice(0, 4);
}

export default function Home() {
  useDocumentTitle(
    "Origens do Sabor — Restaurante & Bar em Chimoio",
    "Cozinha moçambicana, pratos da casa, takeaway e reservas de mesa em Chimoio. Rua Cidade de Lichinga, em frente ao Tribunal Judicial."
  );
  const [destaques, setDestaques] = useState<Produto[]>([]);
  const [slideAtivo, setSlideAtivo] = useState(0);

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      setSlideAtivo((atual) => (atual + 1) % HERO_SLIDES.length);
    }, 3000);
    return () => window.clearTimeout(temporizador);
  }, [slideAtivo]);

  useEffect(() => {
    let ativo = true;
    api
      .get<Produto[]>("/produtos")
      .then((res) => {
        if (ativo) setDestaques(selecionarDestaques(res.data));
      })
      .catch(() => {
        if (ativo) setDestaques([]);
      });
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <div>
      <section
        className="relative isolate min-h-[78vh] overflow-hidden bg-secundaria sm:min-h-[86vh]"
        role="region"
        aria-roledescription="carrossel"
        aria-label="Fotografias do Origens do Sabor"
      >
        <div className="absolute inset-0">
          {HERO_SLIDES.map((slide, indice) => {
            const ativo = indice === slideAtivo;
            return (
              <div
                key={slide.src}
                aria-hidden={!ativo}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  ativo ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={slide.src}
                  alt={ativo ? slide.alt : ""}
                  className="h-full w-full object-cover"
                  width={1800}
                  height={1200}
                  loading={indice === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={indice === 0 ? "high" : "auto"}
                />
              </div>
            );
          })}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-secundaria/90 via-secundaria/60 to-secundaria/20" />
        <div className="container-custom relative flex min-h-[78vh] flex-col justify-center py-20 sm:min-h-[86vh]">
          <div className="max-w-2xl text-creme">
            <p className="eyebrow text-dourado">Chimoio · Moçambique</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.08] text-creme sm:text-6xl lg:text-7xl">
              O sabor de casa,
              <br />
              à mesa em Chimoio.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-creme/80 sm:text-lg">
              Cozinha moçambicana, pratos da casa e uma mesa à sua espera. Venha
              comer connosco, leve para casa ou reserve com antecedência.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/cardapio" className="btn-light">
                Ver o menu <FiArrowRight aria-hidden="true" />
              </Link>
              <Link
                to="/reservar-mesa"
                className="btn border border-creme/35 text-creme hover:border-creme hover:bg-creme hover:text-secundaria"
              >
                Reservar mesa
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 top-4 z-20 sm:top-6">
          <div className="container-custom flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() =>
                setSlideAtivo(
                  (atual) => (atual - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
                )
              }
              aria-label="Fotografia anterior"
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-creme/30 bg-secundaria/40 text-creme backdrop-blur transition-colors hover:border-creme hover:bg-creme hover:text-secundaria sm:inline-flex"
            >
              <FiChevronLeft aria-hidden="true" />
            </button>

            <div className="flex items-center gap-2" role="group" aria-label="Selecionar fotografia">
              {HERO_SLIDES.map((slide, indice) => (
                <button
                  key={slide.src}
                  type="button"
                  onClick={() => setSlideAtivo(indice)}
                  aria-label={`Fotografia ${indice + 1}: ${slide.alt}`}
                  aria-current={indice === slideAtivo ? "true" : undefined}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    indice === slideAtivo
                      ? "w-7 bg-dourado"
                      : "w-2.5 bg-creme/45 hover:bg-creme/80"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setSlideAtivo((atual) => (atual + 1) % HERO_SLIDES.length)
              }
              aria-label="Fotografia seguinte"
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-creme/30 bg-secundaria/40 text-creme backdrop-blur transition-colors hover:border-creme hover:bg-creme hover:text-secundaria sm:inline-flex"
            >
              <FiChevronRight aria-hidden="true" />
            </button>

          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 border-t border-creme/15 bg-secundaria/55 backdrop-blur-sm">
          <div className="container-custom grid gap-3 py-4 text-xs text-creme/75 sm:grid-cols-3 sm:text-sm">
            <span className="flex items-center gap-2">
              <FiClock aria-hidden="true" className="text-dourado" />
              Seg–Sáb 07:30–22:00 · Dom 09:00–22:00
            </span>
            <span className="flex items-center gap-2">
              <FiMapPin aria-hidden="true" className="text-dourado" />
              {RESTAURANTE.enderecoCurto}
            </span>
            <a
              href={RESTAURANTE.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition-colors hover:text-white"
            >
              <FaWhatsapp aria-hidden="true" className="text-dourado" />
              {RESTAURANTE.telefonePrincipal}
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-custom grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <div className="relative">
            <img
              src="/imagens-web/contacto.webp"
              alt="Ambiente do restaurante Origens do Sabor"
              width={1400}
              height={1000}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="absolute -bottom-8 -right-4 hidden w-52 border border-dourado/50 bg-fundo p-5 sm:block lg:-right-8">
              <p className="font-display text-2xl text-secundaria">Cozinha com raiz</p>
              <p className="mt-2 text-xs leading-relaxed text-carvao/65">
                Ingredientes frescos e pratos preparados na hora, todos os dias.
              </p>
            </div>
          </div>

          <div>
            <p className="eyebrow">A casa</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              Um restaurante de bairro com alma de casa.
            </h2>
            <div className="divider my-6" />
            <div className="prose-restaurante space-y-4">
              <p>
                Estamos no centro de Chimoio, na Rua Cidade de Lichinga, em
                frente ao Tribunal Judicial. Servimos pequeno-almoço, almoço,
                jantar e refeições para levar, num ambiente descontraído.
              </p>
              <p>
                Do frango grelhado à chamussa, do peixe da nossa costa aos pratos
                de massa da casa, a cozinha segue o ritmo do dia e o que há de
                melhor no mercado.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-sm">
              <span className="inline-flex items-center gap-2 text-carvao/70">
                <FiMapPin aria-hidden="true" className="text-terracota" />
                {RESTAURANTE.enderecoCurto}
              </span>
              <a
                href={RESTAURANTE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-terracota hover:text-secundaria"
              >
                Ver no mapa <FiArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white/70 py-16 sm:py-20 lg:py-24">
        <div className="container-custom grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <p className="eyebrow">Do menu</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">Pratos da casa</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-carvao/65">
              Uma pequena seleção do que está à mesa hoje. O menu completo é
              atualizado pela equipa do restaurante.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/cardapio" className="btn-primary">
                Menu completo <FiArrowRight aria-hidden="true" />
              </Link>
              <a
                href={RESTAURANTE.whatsappReservas}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Encomendar
              </a>
            </div>
          </div>

          <div>
            {destaques.length > 0 ? (
              <ul className="divide-y divide-carvao/10 border-y border-carvao/10">
                {destaques.map((produto) => (
                  <li key={produto.id} className="flex items-baseline gap-4 py-5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <h3 className="font-display text-xl text-secundaria">
                          {nomeExibicao(produto.nome)}
                        </h3>
                        <span className="text-[0.65rem] uppercase tracking-[0.16em] text-carvao/40">
                          {rotuloCategoria(produto.categoria)}
                        </span>
                      </div>
                      {produto.descricao && (
                        <p className="mt-1 text-sm leading-relaxed text-carvao/60">
                          {descricaoExibicao(produto.descricao)}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 font-display text-lg text-terracota">
                      {formatarPreco(produto.preco)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="border border-dashed border-carvao/20 p-8 text-sm text-carvao/60">
                O menu está a ser atualizado. Consulte a página do menu ou
                fale connosco pelo WhatsApp.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-custom">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Da nossa cozinha</p>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl">
                O que sai daqui todos os dias
              </h2>
            </div>
            <Link
              to="/cardapio"
              className="inline-flex items-center gap-1 text-sm font-semibold text-terracota hover:text-secundaria"
            >
              Ver tudo <FiArrowRight aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {GALERIA.map((foto, indice) => (
              <figure
                key={foto.src}
                className={`group relative overflow-hidden ${
                  indice === 0 ? "col-span-2 lg:col-span-1 lg:row-span-2" : ""
                }`}
              >
                <img
                  src={foto.src}
                  alt={foto.alt}
                  loading="lazy"
                  width={800}
                  height={800}
                  className={`w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
                    indice === 0 ? "aspect-square lg:aspect-[3/4]" : "aspect-square"
                  }`}
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-carvao/70 to-transparent p-3 text-xs font-medium text-creme sm:p-4 sm:text-sm">
                  {foto.legenda}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-secundaria py-16 text-creme sm:py-20">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-dourado/20"
        />
        <div className="container-custom relative grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="eyebrow text-dourado">Reservas</p>
            <h2 className="mt-3 font-display text-3xl text-creme sm:text-4xl">
              Guarde a sua mesa. Nós tratamos do resto.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-creme/70">
              Escolha o dia, a hora e o número de pessoas. A reserva fica
              pendente até ser confirmada pela equipa do restaurante.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link to="/reservar-mesa" className="btn-light">
              <FiCalendar aria-hidden="true" /> Reservar online
            </Link>
            <a
              href={RESTAURANTE.telefonePrincipalLink}
              className="btn border border-creme/30 text-creme hover:bg-creme hover:text-secundaria"
            >
              <FiPhone aria-hidden="true" /> Ligar
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-custom grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow">Visite-nos</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              Uma mesa no centro de Chimoio.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-carvao/65">
              Estamos abertos todos os dias. Para grupos ou ocasiões especiais,
              fale connosco com antecedência.
            </p>

            <dl className="mt-8 space-y-5 text-sm">
              <div className="flex gap-4">
                <FiMapPin aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-terracota" />
                <div>
                  <dt className="font-semibold text-carvao">Morada</dt>
                  <dd className="mt-1 text-carvao/65">{RESTAURANTE.endereco}</dd>
                </div>
              </div>
              <div className="flex gap-4">
                <FiClock aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-terracota" />
                <div>
                  <dt className="font-semibold text-carvao">Horário</dt>
                  {RESTAURANTE.horarios.map((horario) => (
                    <dd key={horario.dias} className="mt-1 text-carvao/65">
                      {horario.dias}: {horario.horas}
                    </dd>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <FiPhone aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-terracota" />
                <div>
                  <dt className="font-semibold text-carvao">Telefone e WhatsApp</dt>
                  <dd className="mt-1">
                    <a href={RESTAURANTE.telefonePrincipalLink} className="block text-carvao/65 hover:text-terracota">
                      {RESTAURANTE.telefonePrincipal}
                    </a>
                    <a href={RESTAURANTE.telefoneSecundarioLink} className="block text-carvao/65 hover:text-terracota">
                      {RESTAURANTE.telefoneSecundario}
                    </a>
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={RESTAURANTE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Abrir no Google Maps <FiArrowUpRight aria-hidden="true" />
              </a>
              <Link to="/contacto" className="btn-ghost">
                Todos os contactos
              </Link>
            </div>
          </div>

          <div className="relative">
            <img
              src="/imagens-web/prato-assinatura.webp"
              alt="Prato do Origens do Sabor apresentado à mesa"
              width={1200}
              height={900}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="absolute -left-4 -top-4 hidden h-24 w-24 border-l-2 border-t-2 border-dourado sm:block" />
          </div>
        </div>
      </section>
    </div>
  );
}
