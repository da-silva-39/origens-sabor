/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);

  const toggleMenu = () => setMenuAberto(!menuAberto);
  const fecharMenu = () => setMenuAberto(false);

  const linkBase = "px-4 py-2 rounded-full transition-all duration-300 hover:scale-105";
  const linkDesktop = `${linkBase} hover:bg-white/20`;
  const linkMobile = `${linkBase} hover:bg-white/20 w-full text-center`;
  const btnLoginDesktop = "px-6 py-2 rounded-full bg-white text-primaria font-semibold hover:bg-secundaria hover:text-white transition duration-300";
  const btnLoginMobile = `${btnLoginDesktop} w-full text-center`;

  // Só mostrar links de cliente (carrinho, reservas) se for CLIENTE
  const isCliente = user?.role === 'CLIENTE';
  const isAdmin = user?.role === 'ADMIN';
  const isAgente = user?.role === 'AGENTE';

  return (
    <nav className="bg-primaria text-white sticky top-0 z-50 shadow-md">
      <div className="container-custom flex justify-between items-center py-4">
        <Link to="/" className="text-2xl font-bold hover:opacity-90 transition">
          Origens do Sabor
        </Link>

        {/* Links para desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/" className={linkDesktop}>Início</Link>

          {/* Contacto só para não autenticados e clientes (e agentes talvez) */}
          {(!isAuthenticated || isCliente || isAgente) && (
            <Link to="/contacto" className={linkDesktop}>Contactar</Link>
          )}

          {isAuthenticated ? (
            <>
              {/* Cardápio: para admin mostra versão sem carrinho */}
              <Link to={isAdmin ? "/admin/cardapio" : "/cardapio"} className={linkDesktop}>
                Cardápio
              </Link>

              {/* Links exclusivos para cliente */}
              {isCliente && (
                <>
                  <Link to="/carrinho" className={linkDesktop}>Carrinho</Link>
                  <Link to="/reservar-mesa" className={linkDesktop}>Reservar Mesa</Link>
                  <Link to="/minhas-reservas" className={linkDesktop}>Minhas Reservas</Link>
                </>
              )}

              {/* Admin links */}
              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" className={linkDesktop}>Admin</Link>
                  <Link to="/admin/reservas" className={linkDesktop}>Gerir Reservas</Link>
                  <Link to="/admin/mesas" className={linkDesktop}>Mesas</Link>
                </>
              )}

              {/* Agente links */}
              {isAgente && (
                <Link to="/agente/dashboard" className={linkDesktop}>Dashboard</Link>
              )}

              {/* Dashboard do cliente (se for cliente) */}
              {isCliente && (
                <Link to="/dashboard" className={linkDesktop}>Dashboard</Link>
              )}

              <Link to="/perfil" className={linkDesktop}>Perfil</Link>
              <button
                onClick={logout}
                className={`${linkDesktop} bg-white/10 hover:bg-white/30 text-white`}
              >
                Sair
              </button>
            </>
          ) : (
            <Link to="/login" className={btnLoginDesktop}>Entrar</Link>
          )}
        </div>

        {/* Botão do menu mobile */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-2xl focus:outline-none"
        >
          {menuAberto ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Menu mobile */}
      {menuAberto && (
        <div className="md:hidden bg-primaria py-4 px-6 flex flex-col gap-3 border-t border-white/20">
          <Link to="/" onClick={fecharMenu} className={linkMobile}>Início</Link>
          {(!isAuthenticated || isCliente || isAgente) && (
            <Link to="/contacto" onClick={fecharMenu} className={linkMobile}>Contactar</Link>
          )}
          {isAuthenticated ? (
            <>
              <Link to={isAdmin ? "/admin/cardapio" : "/cardapio"} onClick={fecharMenu} className={linkMobile}>
                Cardápio
              </Link>
              {isCliente && (
                <>
                  <Link to="/carrinho" onClick={fecharMenu} className={linkMobile}>Carrinho</Link>
                  <Link to="/reservar-mesa" onClick={fecharMenu} className={linkMobile}>Reservar Mesa</Link>
                  <Link to="/minhas-reservas" onClick={fecharMenu} className={linkMobile}>Minhas Reservas</Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" onClick={fecharMenu} className={linkMobile}>Admin</Link>
                  <Link to="/admin/reservas" onClick={fecharMenu} className={linkMobile}>Gerir Reservas</Link>
                  <Link to="/admin/mesas" onClick={fecharMenu} className={linkMobile}>Mesas</Link>
                </>
              )}
              {isAgente && (
                <Link to="/agente/dashboard" onClick={fecharMenu} className={linkMobile}>Dashboard</Link>
              )}
              {isCliente && (
                <Link to="/dashboard" onClick={fecharMenu} className={linkMobile}>Dashboard</Link>
              )}
              <Link to="/perfil" onClick={fecharMenu} className={linkMobile}>Perfil</Link>
              <button
                onClick={() => {
                  logout();
                  fecharMenu();
                }}
                className={`${linkMobile} bg-white/10 hover:bg-white/30 text-white text-left`}
              >
                Sair
              </button>
            </>
          ) : (
            <Link to="/login" onClick={fecharMenu} className={btnLoginMobile}>Entrar</Link>
          )}
        </div>
      )}
    </nav>
  );
}