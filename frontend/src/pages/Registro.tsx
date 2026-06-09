/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Registro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(nome, email, telefone, senha);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'AGENTE') navigate('/agente/dashboard');
      else navigate('/dashboard');
    } catch (err) { setError('Erro ao registar'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-fundo py-12 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-secundaria mb-6">Criar Conta</h1>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} className="w-full border rounded-full px-4 py-2" required />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-full px-4 py-2" required />
          <input type="tel" placeholder="Telefone" value={telefone} onChange={e => setTelefone(e.target.value)} className="w-full border rounded-full px-4 py-2" />
          <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} className="w-full border rounded-full px-4 py-2" required />
          <button type="submit" className="w-full bg-primaria text-white py-2 rounded-full">Registar</button>
        </form>
        <p className="text-center mt-6">Já tem conta? <Link to="/login" className="text-primaria hover:underline">Entrar</Link></p>
      </div>
    </div>
  );
}