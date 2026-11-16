import { useCallback, useEffect, useState } from "react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiInfo,
  FiMapPin,
  FiUsers,
  FiArrowRight,
} from "react-icons/fi";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { RESTAURANTE } from "../data/restaurante";

interface Mesa {
  id: number;
  numero: number;
  ocupada: boolean;
}

interface ReservaCriada {
  id: number;
  codigoRecibo: string;
  dataHora: string;
  quantidadePessoas: number;
  status: string;
  mesa: { numero: number };
}

function paraInputLocal(data: Date) {
  const offset = data.getTimezoneOffset() * 60_000;
  return new Date(data.getTime() - offset).toISOString().slice(0, 16);
}

export default function ReservarMesa() {
  useDocumentTitle("Reservar mesa — Origens do Sabor");
  const { user, isAuthenticated } = useAuth();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [mesaId, setMesaId] = useState<number | null>(null);
  const [dataHora, setDataHora] = useState("");
  const [quantidadePessoas, setQuantidadePessoas] = useState(2);
  const [observacoes, setObservacoes] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [carregandoMesas, setCarregandoMesas] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [disponivel, setDisponivel] = useState<boolean | null>(null);
  const [motivoIndisponivel, setMotivoIndisponivel] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [reservaCriada, setReservaCriada] = useState<ReservaCriada | null>(null);

  const [minDataHora] = useState(() =>
    paraInputLocal(new Date(Date.now() + 60 * 60_000))
  );
  const [maxDataHora] = useState(() =>
    paraInputLocal(new Date(Date.now() + 90 * 24 * 60 * 60_000))
  );

  const carregarMesas = useCallback(async () => {
    try {
      const res = await api.get<Mesa[]>("/mesas");
      setMesas(res.data);
    } catch {
      toast.error("Não foi possível carregar as mesas");
    } finally {
      setCarregandoMesas(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarMesas();
    const intervalo = setInterval(carregarMesas, 30_000);
    return () => clearInterval(intervalo);
  }, [carregarMesas]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (user?.nome && !nome) setNome(user.nome);
    if (user?.email && !email) setEmail(user.email);
    if (user?.telefone && !telefone) setTelefone(user.telefone);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [user, nome, email, telefone]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!mesaId || !dataHora) {
      setDisponivel(null);
      setMotivoIndisponivel("");
      return;
    }

    let ativo = true;
    setVerificando(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/reservas/disponibilidade", {
          params: { mesaId, dataHora },
        });
        if (!ativo) return;
        setDisponivel(Boolean(res.data.disponivel));
        setMotivoIndisponivel(res.data.motivo || "");
      } catch {
        if (!ativo) return;
        setDisponivel(null);
        setMotivoIndisponivel("");
      } finally {
        if (ativo) setVerificando(false);
      }
    }, 450);

    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [mesaId, dataHora]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!mesaId) return toast.error("Escolha uma mesa");
    if (!dataHora) return toast.error("Escolha o dia e a hora");
    if (disponivel === false) {
      return toast.error(motivoIndisponivel || "Mesa indisponível neste horário");
    }
    if (!isAuthenticated) {
      if (nome.trim().length < 2) return toast.error("Indique o seu nome");
      if (!telefone.trim()) return toast.error("Indique um telefone de contacto");
    }
    if (isAuthenticated && !user?.telefone && !telefone.trim()) {
      return toast.error("Indique um telefone de contacto para a reserva");
    }

    setCarregando(true);
    try {
      const { data } = await api.post("/reservas", {
        mesaId,
        dataHora,
        quantidadePessoas,
        observacoes,
        ...(isAuthenticated ? {} : { nome, email, telefone }),
        ...(isAuthenticated ? { telefone } : {}),
      });
      setReservaCriada(data.reserva);
      toast.success("Reserva solicitada. Aguarde a confirmação.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(
        axios.isAxiosError(err)
          ? err.response?.data?.error || "Não foi possível criar a reserva"
          : "Não foi possível criar a reserva"
      );
    } finally {
      setCarregando(false);
    }
  };

  const reiniciar = () => {
    setReservaCriada(null);
    setMesaId(null);
    setDataHora("");
    setObservacoes("");
    setQuantidadePessoas(2);
    setDisponivel(null);
  };

  if (reservaCriada) {
    return (
      <div className="section">
        <div className="container-custom max-w-2xl">
          <div className="border border-carvao/10 bg-white p-8 sm:p-10">
            <FiCheckCircle className="h-10 w-10 text-oliva" aria-hidden="true" />
            <p className="eyebrow mt-5">Reserva recebida</p>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl">
              Obrigado, {isAuthenticated ? user?.nome?.split(" ")[0] : nome.split(" ")[0]}.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-carvao/65">
              O seu pedido de reserva foi registado e está pendente de
              confirmação. A equipa do restaurante irá confirmar em breve.
            </p>

            <dl className="mt-8 grid gap-4 border-y border-carvao/10 py-6 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-carvao/45">Mesa</dt>
                <dd className="mt-1 font-display text-xl text-secundaria">
                  Mesa {reservaCriada.mesa.numero}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-carvao/45">Pessoas</dt>
                <dd className="mt-1 font-display text-xl text-secundaria">
                  {reservaCriada.quantidadePessoas}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-carvao/45">Data e hora</dt>
                <dd className="mt-1 font-display text-xl text-secundaria">
                  {new Date(reservaCriada.dataHora).toLocaleString("pt-PT", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-carvao/45">Código</dt>
                <dd className="mt-1 font-mono text-lg text-terracota">
                  {reservaCriada.codigoRecibo}
                </dd>
              </div>
            </dl>

            <p className="mt-5 text-xs leading-relaxed text-carvao/50">
              Guarde o código da reserva. A equipa irá contactá-lo pelo telefone
              indicado para confirmar.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {isAuthenticated ? (
                <Link to="/minhas-reservas" className="btn-primary">
                  Ver as minhas reservas <FiArrowRight aria-hidden="true" />
                </Link>
              ) : (
                <a
                  href={RESTAURANTE.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Falar com o restaurante <FiArrowRight aria-hidden="true" />
                </a>
              )}
              <button type="button" onClick={reiniciar} className="btn-secondary">
                Fazer outra reserva
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="border-b border-carvao/10 bg-white/60">
        <div className="container-custom py-12 sm:py-16">
          <p className="eyebrow">Reservas</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">Reserve a sua mesa</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-carvao/65 sm:text-base">
            Escolha a mesa, o dia e a hora. A reserva fica pendente até ser
            confirmada pela equipa. Para grupos grandes, fale connosco
            diretamente.
          </p>
        </div>
      </section>

      <div className="container-custom section grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl">1. Escolha a mesa</h2>
          <p className="mt-2 text-sm text-carvao/60">
            A indicação “ocupada agora” refere-se ao momento atual. A
            disponibilidade para o seu horário é verificada no passo seguinte.
          </p>

          {carregandoMesas ? (
            <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5" aria-busy="true">
              {Array.from({ length: 10 }).map((_, indice) => (
                <div key={indice} className="h-24 animate-pulse bg-areia/60" />
              ))}
            </div>
          ) : mesas.length === 0 ? (
            <div className="mt-6 border border-dashed border-carvao/20 p-6 text-sm text-carvao/60">
              Não foi possível apresentar as mesas. Ligue para{" "}
              <a href={RESTAURANTE.telefonePrincipalLink} className="font-semibold text-terracota">
                {RESTAURANTE.telefonePrincipal}
              </a>
              .
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {mesas.map((mesa) => {
                const selecionada = mesaId === mesa.id;
                return (
                  <button
                    key={mesa.id}
                    type="button"
                    onClick={() => setMesaId(mesa.id)}
                    aria-pressed={selecionada}
                    className={`border p-3 text-center transition-colors ${
                      selecionada
                        ? "border-secundaria bg-secundaria text-creme"
                        : "border-carvao/15 bg-white text-secundaria hover:border-secundaria/50"
                    }`}
                  >
                    <span className="block font-display text-xl">{mesa.numero}</span>
                    <span
                      className={`mt-1 block text-[0.62rem] uppercase tracking-[0.12em] ${
                        selecionada
                          ? "text-creme/65"
                          : mesa.ocupada
                            ? "text-terracota"
                            : "text-carvao/45"
                      }`}
                    >
                      {mesa.ocupada ? "Ocupada agora" : "Disponível"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-10 border border-carvao/10 bg-white p-5 text-sm text-carvao/65">
            <p className="flex items-center gap-2 font-semibold text-carvao">
              <FiClock className="text-terracota" aria-hidden="true" />
              Horário de reservas
            </p>
            <ul className="mt-3 space-y-1">
              {RESTAURANTE.horarios.map((horario) => (
                <li key={horario.dias}>
                  {horario.dias}: {horario.horas}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-carvao/50">
              Reservas com pelo menos 1 hora de antecedência e até 90 dias.
              A última entrada é 30 minutos antes do fecho.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="border border-carvao/10 bg-white p-6 sm:p-8">
          <h2 className="font-display text-2xl sm:text-3xl">2. Dados da reserva</h2>

          {!isAuthenticated && (
            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="nome" className="label">Nome *</label>
                <input
                  id="nome"
                  className="input"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="telefone" className="label">Telefone *</label>
                  <input
                    id="telefone"
                    className="input"
                    value={telefone}
                    onChange={(event) => setTelefone(event.target.value)}
                    placeholder="84 123 4567"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="label">E-mail</label>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>
              <p className="text-xs text-carvao/50">
                Não é necessário criar conta para reservar. Se já tem conta,{" "}
                <Link to="/login" className="font-semibold text-terracota hover:text-secundaria">
                  entre aqui
                </Link>
                .
              </p>
            </div>
          )}

          {isAuthenticated && (
            <p className="mt-4 border-l-2 border-dourado bg-fundo px-4 py-3 text-sm text-carvao/65">
              Reserva em nome de <strong>{user?.nome}</strong>
              {user?.telefone ? ` · ${user.telefone}` : ""}.
            </p>
          )}

          {isAuthenticated && !user?.telefone && (
            <div className="mt-4">
              <label htmlFor="telefone-conta" className="label">Telefone de contacto *</label>
              <input
                id="telefone-conta"
                className="input"
                value={telefone}
                onChange={(event) => setTelefone(event.target.value)}
                placeholder="84 123 4567"
                inputMode="tel"
                autoComplete="tel"
                required
              />
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="dataHora" className="label">
                <FiCalendar className="mr-1 inline" aria-hidden="true" /> Data e hora *
              </label>
              <input
                id="dataHora"
                type="datetime-local"
                className="input"
                value={dataHora}
                min={minDataHora}
                max={maxDataHora}
                onChange={(event) => setDataHora(event.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="pessoas" className="label">
                <FiUsers className="mr-1 inline" aria-hidden="true" /> Pessoas *
              </label>
              <input
                id="pessoas"
                type="number"
                className="input"
                min={1}
                max={20}
                value={quantidadePessoas}
                onChange={(event) => setQuantidadePessoas(Number(event.target.value))}
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="observacoes" className="label">Observações</label>
            <textarea
              id="observacoes"
              className="input min-h-24 resize-y"
              rows={3}
              maxLength={500}
              value={observacoes}
              onChange={(event) => setObservacoes(event.target.value)}
              placeholder="Ex.: cadeira de bebé, ocasião especial, alergénios."
            />
          </div>

          <div className="mt-4 min-h-6 text-sm" aria-live="polite">
            {mesaId && dataHora ? (
              verificando ? (
                <p className="flex items-center gap-2 text-carvao/50">
                  <FiInfo className="animate-pulse" aria-hidden="true" /> A verificar disponibilidade...
                </p>
              ) : disponivel === true ? (
                <p className="flex items-center gap-2 text-oliva">
                  <FiCheckCircle aria-hidden="true" /> Mesa disponível para este horário.
                </p>
              ) : disponivel === false ? (
                <p className="text-terracota">
                  {motivoIndisponivel || "Mesa indisponível neste horário."}
                </p>
              ) : (
                <p className="text-carvao/45">
                  Escolha uma mesa e um horário para verificar.
                </p>
              )
            ) : (
              <p className="text-carvao/45">
                Selecione a mesa e o horário para verificar a disponibilidade.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={carregando || !mesaId || disponivel === false}
            className="btn-primary mt-5 w-full"
          >
            {carregando ? "A enviar..." : "Solicitar reserva"}
          </button>

          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-carvao/50">
            <FiMapPin className="mt-0.5 shrink-0" aria-hidden="true" />
            {RESTAURANTE.endereco}
          </p>
        </form>
      </div>
    </div>
  );
}
