import { useEffect } from 'react';

export default function GoogleCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userParam = params.get('user');

    if (token && userParam) {
      localStorage.setItem('token', token);
      const decodedUser = decodeURIComponent(userParam);
      localStorage.setItem('user', decodedUser);
      try {
        const user = JSON.parse(decodedUser);
        const target = user.role === 'ADMIN'
          ? '/admin/dashboard'
          : user.role === 'AGENTE'
            ? '/agente/dashboard'
            : '/dashboard';
        // Recarrega a aplicação para o AuthContext ler a sessão do localStorage
        window.location.replace(target);
      } catch (e) {
        console.error('Erro ao parsear user:', e);
        window.location.replace('/login');
      }
    } else {
      window.location.replace('/login');
    }
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaria mx-auto"></div>
        <p className="mt-4">A processar login com Google...</p>
      </div>
    </div>
  );
}