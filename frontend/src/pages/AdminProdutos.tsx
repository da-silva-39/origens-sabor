/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagemUrl: string | null;
}

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: '',
    imagem: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const carregarProdutos = async () => {
    try {
      const res = await api.get('/produtos');
      setProdutos(res.data);
    } catch (error) {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const abrirModal = (produto?: Produto) => {
    if (produto) {
      setEditando(produto);
      setForm({
        nome: produto.nome,
        descricao: produto.descricao || '',
        preco: produto.preco.toString(),
        categoria: produto.categoria,
        imagem: null,
      });
      setPreviewUrl(produto.imagemUrl);
    } else {
      setEditando(null);
      setForm({ nome: '', descricao: '', preco: '', categoria: '', imagem: null });
      setPreviewUrl(null);
    }
    setModalAberto(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, imagem: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nome', form.nome);
    formData.append('descricao', form.descricao);
    formData.append('preco', form.preco);
    formData.append('categoria', form.categoria);
    if (form.imagem) formData.append('imagem', form.imagem);

    try {
      if (editando) {
        await api.put(`/produtos/${editando.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Produto atualizado!');
      } else {
        await api.post('/produtos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Produto criado!');
      }
      setModalAberto(false);
      carregarProdutos();
    } catch (error) {
      toast.error('Erro ao salvar produto');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await api.delete(`/produtos/${id}`);
        toast.success('Produto excluído!');
        carregarProdutos();
      } catch (error) {
        toast.error('Erro ao excluir');
      }
    }
  };

  if (loading) return <div className="text-center py-20">Carregando...</div>;

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-secundaria">Produtos</h1>
        <button onClick={() => abrirModal()} className="bg-primaria text-white px-4 py-2 rounded-full">+ Novo Produto</button>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="min-w-full">
          <thead className="bg-secundaria text-white">
            <tr><th className="p-3 text-left">Imagem</th><th>Nome</th><th>Preço</th><th>Categoria</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  {p.imagemUrl ? <img src={p.imagemUrl} alt={p.nome} className="w-12 h-12 object-cover rounded" /> : '-'}
                </td>
                <td className="p-3">{p.nome}</td>
                <td className="p-3">{p.preco.toFixed(2)} MT</td>
                <td className="p-3">{p.categoria}</td>
                <td className="p-3 space-x-2">
                  <button onClick={() => abrirModal(p)} className="text-blue-600">Editar</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{editando ? 'Editar Produto' : 'Novo Produto'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome" className="w-full border rounded-full px-4 py-2" required />
              <textarea name="descricao" value={form.descricao} onChange={handleChange} placeholder="Descrição" rows={3} className="w-full border rounded-2xl px-4 py-2" />
              <input name="preco" type="number" step="0.01" value={form.preco} onChange={handleChange} placeholder="Preço (MT)" className="w-full border rounded-full px-4 py-2" required />
              <input name="categoria" value={form.categoria} onChange={handleChange} placeholder="Categoria" className="w-full border rounded-full px-4 py-2" required />
              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full" />
              {previewUrl && <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover rounded mx-auto mt-2" />}
              <div className="flex gap-2 pt-2">
                <button type="submit" className="bg-primaria text-white px-4 py-2 rounded-full flex-1">Salvar</button>
                <button type="button" onClick={() => setModalAberto(false)} className="bg-gray-300 px-4 py-2 rounded-full">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}