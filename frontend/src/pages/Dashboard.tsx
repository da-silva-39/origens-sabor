import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return (
    <div className="container-custom py-16 text-center">
      <h1 className="text-3xl font-bold text-secundaria">Bem-vindo, {user?.nome}!</h1>
      <p className="mt-4">Esta é a sua área restrita. Em breve terá acesso ao cardápio, pedidos e mais.</p>
    </div>
  );
}