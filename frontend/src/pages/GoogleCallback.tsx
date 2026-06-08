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
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return <div className="text-center py-20">A processar login...</div>;
}