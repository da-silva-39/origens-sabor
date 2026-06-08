/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-primaria text-white sticky top-0 z-50 shadow-md">
      <div className="container-custom flex justify-between items-center py-4 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍽️</span>
          <Link to="/" className="text-2xl font-bold hover:opacity-90 transition">
            Origens do Sabor
          </Link>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <Link to="/cardapio" className="hover:opacity-90 transition">Cardápio</Link>
          <Link to="/carrinho" className="hover:opacity-90 transition">Carrinho</Link>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="hover:opacity-90 transition">Dashboard</Link>
              <Link to="/meus-pedidos" className="hover:opacity-90 transition">Meus Pedidos</Link>
              <Link to="/perfil" className="hover:opacity-90 transition">Perfil</Link>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="hover:opacity-90 transition">Admin</Link>
              )}
              <span className="text-sm">Olá, {user?.nome}</span>
              <button onClick={logout} className="bg-white text-primaria px-4 py-2 rounded-full hover:bg-secundaria hover:text-white transition">
                Sair
              </button>
            </>
          )}
          {!isAuthenticated && (
            <Link to="/login" className="bg-white text-primaria px-6 py-2 rounded-full font-semibold hover:bg-secundaria hover:text-white transition">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}