import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();

  // Enquanto carrega, mostra um loader (evita redirecionamento precoce)
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaria mx-auto"></div>
          <p className="mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  // Após carregar, se não estiver autenticado, redireciona
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container-custom py-16 text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-secundaria mb-4">
        Bem-vindo, {user?.nome}!
      </h1>
      <p className="text-gray-700 text-lg">Esta é a sua área restrita.</p>
      <p className="text-gray-600 mt-4">
        Aqui poderá aceder ao cardápio completo, fazer pedidos, gerir o seu perfil e muito mais.
      </p>
      <div className="mt-8">
        <button
          onClick={() => (window.location.href = '/cardapio')}
          className="bg-primaria text-white px-6 py-2 rounded-full hover:bg-secundaria transition"
        >
          Explorar Cardápio
        </button>
      </div>
    </div>
  );
}