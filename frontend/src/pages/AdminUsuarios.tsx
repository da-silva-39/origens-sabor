/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { FiCheckCircle, FiMapPin, FiUserX } from 'react-icons/fi';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone?: string | null;
  role: string;
  ativo: boolean;
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  AGENTE: 'Agente',
  CLIENTE: 'Cliente',
};

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtroRole, setFiltroRole] = useState('TODOS');
  const [novo, setNovo] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    role: 'AGENTE',
  });
  const [criando, setCriando] = useState(false);

  const fetchUsuarios = async () => {
    try {
      const res = await api.get<Usuario[]>('/usuarios');
      setUsuarios(res.data);
    } catch {
      toast.error('Erro ao carregar utilizadores');
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCriando(true);
    try {
      await api.post('/usuarios', novo);
      toast.success('Utilizador criado com sucesso');
      setNovo({ nome: '', email: '', telefone: '', senha: '', role: 'AGENTE' });
      await fetchUsuarios();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao criar utilizador');
    } finally {
      setCriando(false);
    }
  };

  const toggleAtivo = async (usuario: Usuario) => {
    const accao = usuario.ativo ? 'desativar' : 'ativar';
    if (!confirm(`Tem certeza que deseja ${accao} ${usuario.nome}?`)) return;
    try {
      await api.patch(`/usuarios/${usuario.id}/toggle`);
      toast.success(`Conta ${usuario.ativo ? 'desativada' : 'ativada'}`);
      await fetchUsuarios();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao atualizar utilizador');
    }
  };

  const filtrados =
    filtroRole === 'TODOS' ? usuarios : usuarios.filter((u) => u.role === filtroRole);

  return (
    <section className="section">
      <div className="container-custom">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Administração</p>
            <h1 className="mt-2 font-display text-3xl text-secundaria sm:text-4xl">
              Utilizadores
            </h1>
            <p className="mt-2 text-sm text-texto/60">
              {usuarios.length} contas registadas · gerir clientes, agentes e administradores.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-texto/60">Filtrar:</span>
            <select
              value={filtroRole}
              onChange={(e) => setFiltroRole(e.target.value)}
              className="rounded-sm border border-texto/15 bg-white px-3 py-2 text-sm"
            >
              <option value="TODOS">Todos</option>
              <option value="AGENTE">Agentes</option>
              <option value="CLIENTE">Clientes</option>
              <option value="ADMIN">Administradores</option>
            </select>
          </label>
        </div>

        <form
          onSubmit={handleCreate}
          className="card mt-8 grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3"
        >
          <div>
            <label className="label" htmlFor="novo-nome">Nome</label>
            <input
              id="novo-nome"
              className="input"
              placeholder="Nome completo"
              value={novo.nome}
              onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
              required
              minLength={2}
              maxLength={80}
            />
          </div>
          <div>
            <label className="label" htmlFor="novo-email">E-mail</label>
            <input
              id="novo-email"
              type="email"
              className="input"
              placeholder="email@exemplo.com"
              value={novo.email}
              onChange={(e) => setNovo({ ...novo, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="novo-telefone">Telefone</label>
            <input
              id="novo-telefone"
              type="tel"
              className="input"
              placeholder="+258 84 000 0000"
              value={novo.telefone}
              onChange={(e) => setNovo({ ...novo, telefone: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="novo-senha">Palavra-passe</label>
            <input
              id="novo-senha"
              type="password"
              className="input"
              placeholder="Mínimo 8 caracteres"
              value={novo.senha}
              onChange={(e) => setNovo({ ...novo, senha: e.target.value })}
              required
              minLength={8}
              maxLength={128}
            />
          </div>
          <div>
            <label className="label" htmlFor="novo-role">Tipo de conta</label>
            <select
              id="novo-role"
              className="input"
              value={novo.role}
              onChange={(e) => setNovo({ ...novo, role: e.target.value })}
            >
              <option value="AGENTE">Agente</option>
              <option value="CLIENTE">Cliente</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full" disabled={criando}>
              {criando ? 'A criar...' : 'Criar utilizador'}
            </button>
          </div>
        </form>

        <div className="mt-8 overflow-x-auto rounded-sm border border-texto/10 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-secundaria text-creme">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-texto/10">
              {filtrados.map((u) => (
                <tr key={u.id} className="hover:bg-areia/30">
                  <td className="px-4 py-3 text-texto/45">{u.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.nome}</div>
                    {u.telefone && <div className="text-xs text-texto/50">{u.telefone}</div>}
                  </td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-areia px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-texto/65">
                      {ROLE_LABEL[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                        u.ativo ? 'bg-oliva/15 text-oliva' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggleAtivo(u)}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                          u.ativo
                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {u.ativo ? <FiUserX size={14} /> : <FiCheckCircle size={14} />}
                        {u.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                      {u.role === 'AGENTE' && (
                        <Link
                          to={`/admin/monitorar-agente/${u.id}`}
                          className="inline-flex items-center gap-1 rounded-full bg-secundaria/10 px-3 py-1.5 text-xs font-medium text-secundaria transition hover:bg-secundaria/15"
                        >
                          <FiMapPin size={14} /> Monitorar
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtrados.length === 0 && (
            <p className="p-8 text-center text-sm text-texto/55">
              Nenhum utilizador corresponde a este filtro.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
