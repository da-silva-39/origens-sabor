/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from 'react';
import api from '../services/api';

interface Usuario { id: number; nome: string; email: string; role: string; ativo: boolean; }

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
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
      setMsg('Agente criado!');
      fetchUsuarios();
      setNovo({ nome: '', email: '', telefone: '', senha: '', role: 'AGENTE' });
    } catch (err) { setMsg('Erro'); }
  };

  const toggleAtivo = async (id: number) => {
    await api.patch(`/usuarios/${id}/toggle`);
    fetchUsuarios();
  };

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
          <option value="AGENTE">Agente</option><option value="CLIENTE">Cliente</option>
        </select>
        <button type="submit" className="bg-primaria text-white rounded-full py-2">Criar Utilizador</button>
      </form>
      <table className="min-w-full bg-white rounded-2xl shadow">
        <thead className="bg-secundaria text-white"><tr><th className="p-3">ID</th><th>Nome</th><th>Email</th><th>Role</th><th>Ativo</th><th>Ações</th></tr></thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id} className="border-b"><td className="p-3">{u.id}</td><td>{u.nome}</td><td>{u.email}</td><td>{u.role}</td><td>{u.ativo ? 'Sim' : 'Não'}</td><td><button onClick={() => toggleAtivo(u.id)} className="text-primaria">Toggle ativo</button></td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}