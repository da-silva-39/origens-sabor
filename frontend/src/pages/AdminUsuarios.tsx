/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FiCheckCircle, FiMapPin, FiTrash2 } from 'react-icons/fi';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: string;
  ativo: boolean;
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtroRole, setFiltroRole] = useState<string>('TODOS');
  const [novo, setNovo] = useState({ nome: '', email: '', telefone: '', senha: '', role: 'AGENTE' });
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchUsuarios(); }, []);

  const fetchUsuarios = async () => {
    const res = await api.get('/usuarios');
    setUsuarios(res.data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/usuarios', novo);
      setMsg('Utilizador criado com sucesso!');
      fetchUsuarios();
      setNovo({ nome: '', email: '', telefone: '', senha: '', role: 'AGENTE' });
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('Erro ao criar utilizador');
    }
  };

  const toggleAtivo = async (id: number) => {
    await api.patch(`/usuarios/${id}/toggle`);
    fetchUsuarios();
  };

  const usuariosFiltrados = filtroRole === 'TODOS'
    ? usuarios
    : usuarios.filter(u => u.role === filtroRole);

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-4">Utilizadores</h1>
      {msg && <div className="bg-green-100 p-2 rounded mb-4">{msg}</div>}

      <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input placeholder="Nome" value={novo.nome} onChange={e => setNovo({ ...novo, nome: e.target.value })} className="border rounded-full px-4 py-2" required />
        <input placeholder="Email" value={novo.email} onChange={e => setNovo({ ...novo, email: e.target.value })} className="border rounded-full px-4 py-2" required />
        <input placeholder="Telefone" value={novo.telefone} onChange={e => setNovo({ ...novo, telefone: e.target.value })} className="border rounded-full px-4 py-2" />
        <input type="password" placeholder="Senha" value={novo.senha} onChange={e => setNovo({ ...novo, senha: e.target.value })} className="border rounded-full px-4 py-2" required />
        <select value={novo.role} onChange={e => setNovo({ ...novo, role: e.target.value })} className="border rounded-full px-4 py-2">
          <option value="AGENTE">Agente</option>
          <option value="CLIENTE">Cliente</option>
          <option value="ADMIN">Administrador</option>
        </select>
        <button type="submit" className="bg-primaria text-white rounded-full py-2">Criar Utilizador</button>
      </form>

      <div className="mb-4 flex items-center gap-2">
        <span className="font-semibold">Filtrar por tipo:</span>
        <select value={filtroRole} onChange={e => setFiltroRole(e.target.value)} className="border rounded-full px-4 py-1">
          <option value="TODOS">Todos</option>
          <option value="AGENTE">Agentes</option>
          <option value="CLIENTE">Clientes</option>
          <option value="ADMIN">Administradores</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-2xl shadow">
          <thead className="bg-secundaria text-white">
            <tr>
              <th className="p-3">ID</th><th>Nome</th><th>Email</th><th>Role</th><th>Ativo</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map(u => (
              <tr key={u.id} className="border-b">
                <td className="p-3">{u.id}</td>
                <td>{u.nome}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.ativo ? 'Sim' : 'Não'}</td>
                <td className="space-x-2">
                   <button
    onClick={() => toggleAtivo(u.id)}
    className={`
      flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors duration-200
      ${u.ativo
        ? 'bg-red-50 text-red-700 hover:bg-red-100'
        : 'bg-green-50 text-green-700 hover:bg-green-100'
      }
    `}
  >
    {u.ativo ? (
      <>
        <FiTrash2 size={16} /> Desativar
      </>
    ) : (
      <>
        <FiCheckCircle size={16} /> Ativar
      </>
    )}
  </button>

  {u.role === 'AGENTE' && (
    <Link
      to={`/admin/monitorar-agente/${u.id}`}
      className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-3 py-1.5 rounded-lg transition-colors duration-200"
    >
      <FiMapPin size={16} /> Monitorar
    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}