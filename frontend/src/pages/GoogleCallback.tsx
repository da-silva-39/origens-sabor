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
      // O userParam foi codificado com encodeURIComponent, precisa de decode
      const decodedUser = decodeURIComponent(userParam);
      localStorage.setItem('user', decodedUser);
      try {
        const user = JSON.parse(decodedUser);
        // Redireciona baseado na role
        if (user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (user.role === 'AGENTE') {
          navigate('/agente/dashboard');
        } else {
          navigate('/dashboard');
        }
      } catch (e) {
        console.error('Erro ao parsear user:', e);
        navigate('/login');
      }
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