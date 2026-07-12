/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Registro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [telefoneError, setTelefoneError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  // Valida número moçambicano (9 dígitos: 8, 2-7, + 7 dígitos)
  const validarTelefone = (numero: string): boolean => {
    const apenasDigitos = numero.replace(/\D/g, '');
    if (apenasDigitos.length !== 9) return false;
    const regex = /^8[2-7]\d{7}$/;
    return regex.test(apenasDigitos);
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '').slice(0, 9); // só dígitos, máx 9
    setTelefone(valor);
    if (valor.length > 0 && !validarTelefone(valor)) {
      setTelefoneError('Número inválido. Deve ter 9 dígitos, começar com 8 e o segundo dígito entre 2-7.');
    } else {
      setTelefoneError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (telefone && !validarTelefone(telefone)) {
      setError('Número de telefone inválido. Formato: 8[2-7] + 7 dígitos (ex: 82 1234567)');
      return;
    }
    try {
      // Envia o número completo com +258 para o backend
      const telefoneCompleto = telefone ? `+258${telefone}` : '';
      await register(nome, email, telefoneCompleto, senha);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'AGENTE') navigate('/agente/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError('Erro ao registar');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-fundo py-12 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-secundaria mb-6">Criar Conta</h1>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="w-full border rounded-full px-4 py-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border rounded-full px-4 py-2"
            required
          />
          <div>
            <div className="flex items-center border rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-primaria">
              <span className="bg-gray-100 px-3 py-2 text-gray-600 font-medium">+258</span>
              <input
                type="tel"
                placeholder="82 1234567"
                value={telefone}
                onChange={handleTelefoneChange}
                className={`w-full border-0 px-4 py-2 focus:outline-none ${telefoneError ? 'text-red-500' : ''}`}
                maxLength={9}
                inputMode="numeric"
              />
            </div>
            {telefoneError && (
              <p className="text-red-500 text-xs mt-1">{telefoneError}</p>
            )}
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              className="w-full border rounded-full px-4 py-2 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          <button type="submit" className="w-full bg-primaria text-white py-2 rounded-full hover:bg-secundaria transition">
            Registar
          </button>
        </form>
        <p className="text-center mt-6">
          Já tem conta? <Link to="/login" className="text-primaria hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}