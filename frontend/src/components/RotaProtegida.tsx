import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

type Role = 'ADMIN' | 'CLIENTE' | 'AGENTE';

interface RotaProtegidaProps {
  children: ReactNode;
  roles?: Role[];
}

export default function RotaProtegida({ children, roles }: RotaProtegidaProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaria" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ de: location.pathname }} />;
  }

  if (roles && user && !roles.includes(user.role as Role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
