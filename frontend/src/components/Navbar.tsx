import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FiCalendar, FiMenu, FiX, FiShoppingBag, FiUser, FiPhone } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useCartStore } from '../hooks/useCartStore';
import { LINK_NAVEGACAO, RESTAURANTE } from '../data/restaurante';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `nav-link border-b-2 pb-1 ${
    isActive ? 'border-terracota text-terracota' : 'border-transparent'
  }`;

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [aberto, setAberto] = useState(false);
  const location = useLocation();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const totalItens = useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.quantidade, 0)
  );

  // Fecha o menu móvel quando a rota muda.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAberto(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!aberto) return;
    const fecharComEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAberto(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', fecharComEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', fecharComEscape);
      document.body.style.overflow = '';
    };
  }, [aberto]);

  const isCliente = user?.role === 'CLIENTE';
  const isAdmin = user?.role === 'ADMIN';
  const isAgente = user?.role === 'AGENTE';

  const painel =
    isAdmin ? '/admin/dashboard' : isAgente ? '/agente/dashboard' : '/dashboard';

  return (
    <>
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-secundaria focus:px-4 focus:py-2 focus:text-sm focus:text-creme"
      >
        Saltar para o conteúdo
      </a>

      <div className="bg-secundaria text-creme/75">
        <div className="container-custom flex items-center justify-between py-2 text-[0.7rem] tracking-wide">
          <p className="hidden sm:block">Chimoio · Moçambique</p>
          <p className="sm:hidden">Chimoio</p>
          <div className="flex items-center gap-5">
            <span className="hidden md:inline">Seg–Sáb 07:30–22:00 · Dom 09:00–22:00</span>
            <a
              href={RESTAURANTE.telefonePrincipalLink}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <FiPhone aria-hidden="true" className="h-3 w-3" />
              {RESTAURANTE.telefonePrincipal}
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-carvao/10 bg-fundo/95 backdrop-blur">
        <nav
          className="container-custom flex items-center justify-between gap-6 py-3.5"
          aria-label="Navegação principal"
        >
          <Link to="/" className="flex items-center gap-3" aria-label="Origens do Sabor — início">
            <img
              src="/logo.jpg"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover ring-1 ring-carvao/10"
            />
            <span className="leading-tight">
              <span className="block font-display text-xl text-secundaria">
                {RESTAURANTE.nome}
              </span>
              <span className="hidden text-[0.62rem] uppercase tracking-[0.24em] text-carvao/55 sm:block">
                {RESTAURANTE.descricao}
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {LINK_NAVEGACAO.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/'}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <>
                {isCliente && (
                  <>
                    <Link
                      to="/minhas-reservas"
                      className="nav-link inline-flex items-center gap-1.5"
                    >
                      <FiCalendar aria-hidden="true" className="h-4 w-4" /> Reservas
                    </Link>
                    <Link
                      to="/carrinho"
                      className="relative p-2 text-carvao/75 transition-colors hover:text-terracota"
                      aria-label={`Carrinho, ${totalItens} artigo(s)`}
                    >
                      <FiShoppingBag className="h-5 w-5" aria-hidden="true" />
                      {totalItens > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-terracota px-1 text-[0.6rem] font-bold text-white">
                          {totalItens}
                        </span>
                      )}
                    </Link>
                  </>
                )}
                <Link
                  to={painel}
                  className="inline-flex items-center gap-2 text-sm font-medium text-carvao/80 hover:text-terracota"
                >
                  <FiUser aria-hidden="true" className="h-4 w-4" />
                  <span className="max-w-[9rem] truncate">
                    {user?.nome?.split(' ')[0]}
                  </span>
                </Link>
                {isAdmin && (
                  <Link to="/admin/reservas" className="nav-link">
                    Reservas
                  </Link>
                )}
                {isAgente && (
                  <Link to="/agente/dashboard" className="nav-link">
                    Entregas
                  </Link>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="text-sm font-medium text-carvao/55 hover:text-terracota"
                >
                  Sair
                </button>
                <Link to="/reservar-mesa" className="btn-primary btn-sm">
                  Reservar
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Entrar
                </Link>
                <Link to="/reservar-mesa" className="btn-primary btn-sm">
                  Reservar mesa
                </Link>
              </>
            )}
          </div>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setAberto((valor) => !valor)}
            className="inline-flex items-center justify-center rounded-sm p-2 text-secundaria lg:hidden"
            aria-expanded={aberto}
            aria-controls="menu-mobile"
            aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
          >
            {aberto ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </nav>

        <div
          id="menu-mobile"
          className={`${aberto ? 'block' : 'hidden'} border-t border-carvao/10 bg-fundo lg:hidden`}
        >
          <div className="container-custom flex max-h-[calc(100vh-7rem)] flex-col gap-1 overflow-y-auto py-5">
            {LINK_NAVEGACAO.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `border-b border-carvao/5 py-3 font-display text-lg ${
                    isActive ? 'text-terracota' : 'text-secundaria'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="mt-4 flex flex-col gap-2 border-t border-carvao/10 pt-4">
              {isAuthenticated ? (
                <>
                  <Link to={painel} className="btn-secondary">
                    <FiUser aria-hidden="true" /> {user?.nome?.split(' ')[0]}
                  </Link>
                  {isCliente && (
                    <>
                      <Link to="/carrinho" className="btn-secondary">
                        <FiShoppingBag aria-hidden="true" /> Carrinho ({totalItens})
                      </Link>
                      <Link to="/minhas-reservas" className="btn-secondary">
                        As minhas reservas
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <Link to="/admin/reservas" className="btn-secondary">
                        Gerir reservas
                      </Link>
                      <Link to="/admin/mesas" className="btn-secondary">
                        Mesas
                      </Link>
                    </>
                  )}
                  <button type="button" onClick={logout} className="btn-ghost">
                    Terminar sessão
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn-secondary">
                  Entrar na minha conta
                </Link>
              )}
              <Link to="/reservar-mesa" className="btn-primary mt-1">
                Reservar mesa
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
