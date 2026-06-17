/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api'; // Importe a instância do axios

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'AGENTE') navigate('/agente/dashboard');
      else navigate('/dashboard');
    } catch (err) { setError('Credenciais inválidas'); }
  };


const handleGoogleLogin = () => {
  // Obtém a baseURL da instância do api (ex: https://origens-sabor-backend.onrender.com/api)
  // Removemos o '/api' do final para obter a raiz
  const backendUrl = api.defaults.baseURL.replace(/\/api$/, '');
  window.location.href = `${backendUrl}/api/auth/google`;
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-fundo py-12 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-secundaria mb-6">Entrar</h1>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-full px-4 py-2" required />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded-full px-4 py-2" required />
          <button type="submit" className="w-full bg-primaria text-white py-2 rounded-full hover:bg-secundaria transition">Entrar</button>
        </form>
        <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t"></div></div><div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-500">ou</span></div></div>
        <button 
  onClick={handleGoogleLogin} 
  className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-medium border border-gray-300 py-2.5 rounded-full shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition duration-200"
>
  {/* Ícone SVG Oficial do Google */}
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
  <span>Entrar com Google</span>
</button>

        <p className="text-center mt-6">Não tem conta? <Link to="/registro" className="text-primaria hover:underline">Criar conta</Link></p>
      </div>
    </div>
  );
}