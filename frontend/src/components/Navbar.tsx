import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-primaria text-white sticky top-0 z-50 shadow-md">
      <div className="container-custom flex justify-between items-center py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍽️</span>
          <span className="text-2xl font-bold">Origens do Sabor</span>
        </div>
        <Link
          to="/login"
          className="bg-white text-primaria px-6 py-2 rounded-full font-semibold hover:bg-secundaria hover:text-white transition"
        >
          Entrar
        </Link>
      </div>
    </nav>
  );
}