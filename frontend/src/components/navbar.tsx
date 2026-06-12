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

  return (
    <nav className="bg-primaria text-white sticky top-0 z-50 shadow-md">
      <div className="container-custom flex justify-between items-center py-4">
        <Link to="/" className="text-2xl font-bold hover:opacity-90 transition">
          Origens do Sabor
        </Link>

        {/* Links para desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/" className={linkDesktop}>Início</Link>

          {isAuthenticated ? (
            <>
              <Link to="/cardapio" className={linkDesktop}>Cardápio</Link>
              <Link to="/carrinho" className={linkDesktop}>Carrinho</Link>
              
              {/* Links de reservas para todos os utilizadores autenticados */}
              <Link to="/reservar-mesa" className={linkDesktop}>Reservar Mesa</Link>
              <Link to="/minhas-reservas" className={linkDesktop}>Minhas Reservas</Link>

              {user?.role === 'ADMIN' && (
                <>
                  <Link to="/admin/dashboard" className={linkDesktop}>Admin</Link>
                  <Link to="/admin/reservas" className={linkDesktop}>Gerir Reservas</Link>
                </>
              )}
              {user?.role === 'AGENTE' && (
                <Link to="/agente/dashboard" className={linkDesktop}>Dashboard</Link>
              )}
              {user?.role === 'CLIENTE' && (
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
          {isAuthenticated ? (
            <>
              <Link to="/cardapio" onClick={fecharMenu} className={linkMobile}>Cardápio</Link>
              <Link to="/carrinho" onClick={fecharMenu} className={linkMobile}>Carrinho</Link>
              
              {/* Links de reservas no mobile */}
              <Link to="/reservar-mesa" onClick={fecharMenu} className={linkMobile}>Reservar Mesa</Link>
              <Link to="/minhas-reservas" onClick={fecharMenu} className={linkMobile}>Minhas Reservas</Link>

              {user?.role === 'ADMIN' && (
                <>
                  <Link to="/admin/dashboard" onClick={fecharMenu} className={linkMobile}>Admin</Link>
                  <Link to="/admin/reservas" onClick={fecharMenu} className={linkMobile}>Gerir Reservas</Link>
                </>
              )}
              {user?.role === 'AGENTE' && (
                <Link to="/agente/dashboard" onClick={fecharMenu} className={linkMobile}>Dashboard</Link>
              )}
              {user?.role === 'CLIENTE' && (
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