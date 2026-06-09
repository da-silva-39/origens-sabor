import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primaria text-white sticky top-0 z-50 shadow-md">
      <div className="container-custom flex justify-between items-center py-4 flex-wrap gap-4">
        <Link to="/" className="text-2xl font-bold">Origens do Sabor</Link>
        <div className="flex items-center gap-4 flex-wrap">
          <Link to="/" className="hover:opacity-90">Home</Link>
          {isAuthenticated && (
            <>
              {user?.role === 'ADMIN' && <Link to="/admin/dashboard" className="hover:opacity-90">Admin</Link>}
              {user?.role === 'AGENTE' && <Link to="/agente/dashboard" className="hover:opacity-90">Dashboard</Link>}
              {user?.role === 'CLIENTE' && <Link to="/dashboard" className="hover:opacity-90">Dashboard</Link>}
              <Link to="/perfil" className="hover:opacity-90">Perfil</Link>
              <button onClick={handleLogout} className="bg-white text-primaria px-4 py-2 rounded-full hover:bg-secundaria hover:text-white transition">
                Sair
              </button>
            </>
          )}
          {!isAuthenticated && <Link to="/login" className="bg-white text-primaria px-6 py-2 rounded-full">Entrar</Link>}
        </div>
      </div>
    </nav>
  );
}