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
        <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-2 border py-2 rounded-full hover:bg-gray-50 transition">🔐 Entrar com Google</button>
        <p className="text-center mt-6">Não tem conta? <Link to="/registro" className="text-primaria hover:underline">Criar conta</Link></p>
      </div>
    </div>
  );
}