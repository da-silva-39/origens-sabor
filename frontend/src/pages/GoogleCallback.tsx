import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userParam = params.get('user');

    if (token && userParam) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', userParam);
      const user = JSON.parse(userParam);
      // Pequeno atraso para garantir que o localStorage foi escrito
      setTimeout(() => {
        if (user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (user.role === 'AGENTE') {
          navigate('/agente/dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 100);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaria mx-auto"></div>
        <p className="mt-4">A processar login com Google...</p>
      </div>
    </div>
  );
}