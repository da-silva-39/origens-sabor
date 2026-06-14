/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { FiEdit, FiTrash2, FiPlus, FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface Mesa {
  id: number;
  numero: number;
  ocupada: boolean;
  qrCode?: string | null;
}

export default function AdminMesas() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Mesa | null>(null);
  const [formNumero, setFormNumero] = useState('');
  const [formOcupada, setFormOcupada] = useState(false);

  const fetchMesas = async () => {
    try {
      const res = await api.get('/admin/mesas');
      setMesas(res.data);
    } catch (error) {
      toast.error('Erro ao carregar mesas');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    fetchMesas();
  }, []);

  const abrirModal = (mesa?: Mesa) => {
    if (mesa) {
      setEditando(mesa);
      setFormNumero(mesa.numero.toString());
      setFormOcupada(mesa.ocupada);
    } else {
      setEditando(null);
      setFormNumero('');
      setFormOcupada(false);
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEditando(null);
    setFormNumero('');
    setFormOcupada(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numero = parseInt(formNumero);
    if (isNaN(numero) || numero <= 0) {
      toast.error('Número inválido');
      return;
    }

    try {
      if (editando) {
        await api.put(`/admin/mesas/${editando.id}`, { numero, ocupada: formOcupada });
        toast.success('Mesa atualizada');
      } else {
        await api.post('/admin/mesas', { numero, ocupada: formOcupada });
        toast.success('Mesa criada');
      }
      fetchMesas();
      fecharModal();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao guardar mesa');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja eliminar esta mesa?')) return;
    try {
      await api.delete(`/admin/mesas/${id}`);
      toast.success('Mesa eliminada');
      fetchMesas();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao eliminar mesa');
    }
  };

  const toggleOcupada = async (mesa: Mesa) => {
    try {
      await api.put(`/admin/mesas/${mesa.id}`, { numero: mesa.numero, ocupada: !mesa.ocupada });
      toast.success(`Mesa ${!mesa.ocupada ? 'ocupada' : 'liberta'}`);
      fetchMesas();
    } catch (err: any) {
      toast.error('Erro ao alterar estado');
    }
  };

  if (carregando) return <div className="text-center py-20">Carregando mesas...</div>;

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-secundaria">Gestão de Mesas</h1>
        <button
          onClick={() => abrirModal()}
          className="bg-primaria text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-secundaria transition"
        >
          <FiPlus /> Nova Mesa
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-2xl shadow">
          <thead className="bg-secundaria text-white">
            <tr>
              <th className="p-3">ID</th>
              <th>Número da Mesa</th>
              <th>Estado</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {mesas.map((mesa) => (
              <tr key={mesa.id} className="border-b">
                <td className="p-3">{mesa.id}</td>
                <td className="font-semibold">Mesa {mesa.numero}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      mesa.ocupada ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {mesa.ocupada ? 'Ocupada' : 'Livre'}
                  </span>
                </td>
                <td className="space-x-2">
                  <button
                    onClick={() => abrirModal(mesa)}
                    className="text-blue-600 hover:text-blue-800 transition"
                    title="Editar"
                  >
                    <FiEdit size={18} />
                  </button>
                  <button
                    onClick={() => toggleOcupada(mesa)}
                    className={`transition ${mesa.ocupada ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                    title={mesa.ocupada ? 'Marcar como livre' : 'Marcar como ocupada'}
                  >
                    {mesa.ocupada ? <FiCheckCircle size={18} /> : <FiXCircle size={18} />}
                  </button>
                  <button
                    onClick={() => handleDelete(mesa.id)}
                    className="text-red-600 hover:text-red-800 transition"
                    title="Eliminar"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {mesas.length === 0 && (
          <div className="text-center py-8 text-gray-500">Nenhuma mesa cadastrada.</div>
        )}
      </div>

      {/* Modal (formulário) */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{editando ? 'Editar Mesa' : 'Nova Mesa'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Número da Mesa</label>
                <input
                  type="number"
                  value={formNumero}
                  onChange={(e) => setFormNumero(e.target.value)}
                  className="w-full border rounded-xl px-4 py-2"
                  required
                  min="1"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ocupada"
                  checked={formOcupada}
                  onChange={(e) => setFormOcupada(e.target.checked)}
                  className="w-5 h-5"
                />
                <label htmlFor="ocupada" className="font-medium">Mesa ocupada</label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={fecharModal} className="px-4 py-2 rounded-full border hover:bg-gray-100 transition">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded-full bg-primaria text-white hover:bg-secundaria transition">
                  {editando ? 'Actualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}