/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCartStore } from '../hooks/useCartStore';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { FiTruck, FiClock, FiUser, FiPhone, FiMail, FiMapPin, FiShoppingCart } from 'react-icons/fi';
import { pdf } from '@react-pdf/renderer';
import { ReciboPedidoPDF } from '../components/ReciboPedidoPDF';

interface Bairro {
  bairro: string;
  valor: number;
  tempoEstimado: string;
}

// ==================== FUNÇÕES DE VALIDAÇÃO ====================
function validarEmail(email: string): boolean {
  const re = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  return re.test(email);
}

function validarTelefoneMocambique(telefone: string): boolean {
  const limpo = telefone.replace(/\s/g, '');
  const regexCompleto = /^\+258[8][2-7]\d{7}$/;
  const regexLocal = /^[8][2-7]\d{7}$/;
  if (regexCompleto.test(limpo)) return true;
  if (regexLocal.test(limpo)) return true;
  return false;
}

function formatarTelefone(telefone: string): string {
  let limpo = telefone.replace(/\s/g, '');
  if (limpo.startsWith('+258')) return limpo;
  if (limpo.match(/^[8][2-7]\d{7}$/)) return '+258' + limpo;
  return telefone;
}

export default function Finalizar() {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [bairroSelecionado, setBairroSelecionado] = useState('');
  const [frete, setFrete] = useState(0);
  const [tempoEntrega, setTempoEntrega] = useState('');
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    telefone: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [carregandoBairros, setCarregandoBairros] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    const fetchBairros = async () => {
      try {
        setCarregandoBairros(true);
        const res = await api.get('/frete/bairros');
        setBairros(res.data);
      } catch (error) {
        console.error('Erro ao carregar bairros', error);
        toast.error('Não foi possível carregar os bairros para entrega');
      } finally {
        setCarregandoBairros(false);
      }
    };
    fetchBairros();
  }, []);

  useEffect(() => {
    if (user) {
      setForm(prev => ({ ...prev, nome: user.nome || '', email: user.email || '' }));
    }
  }, [user]);

  useEffect(() => {
    if (bairroSelecionado) {
      const bairro = bairros.find(b => b.bairro === bairroSelecionado);
      if (bairro) {
        setFrete(bairro.valor);
        setTempoEntrega(bairro.tempoEstimado);
      } else {
        setFrete(0);
        setTempoEntrega('');
      }
    } else {
      setFrete(0);
      setTempoEntrega('');
    }
  }, [bairroSelecionado, bairros]);

  const subtotal = getTotalPrice();
  const total = subtotal + frete;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'bairro') {
      setBairroSelecionado(value);
    } else {
      setForm({ ...form, [name]: value });
      if (name === 'email') setErrors(prev => ({ ...prev, email: '' }));
      if (name === 'telefone') setErrors(prev => ({ ...prev, telefone: '' }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') {
      if (!validarEmail(value)) {
        setErrors(prev => ({ ...prev, email: 'Digite um e‑mail válido (ex: nome@dominio.com)' }));
      }
    }
    if (name === 'telefone') {
      if (!validarTelefoneMocambique(value)) {
        setErrors(prev => ({ ...prev, telefone: 'Número inválido. Use +258 82XXXXXXX ou 82XXXXXXX (82,83,84,85,86,87)' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarEmail(form.email)) {
      setErrors(prev => ({ ...prev, email: 'E‑mail inválido' }));
      toast.error('E‑mail inválido');
      return;
    }
    if (!validarTelefoneMocambique(form.telefone)) {
      setErrors(prev => ({ ...prev, telefone: 'Número de telefone inválido' }));
      toast.error('Número de telefone inválido');
      return;
    }

    if (items.length === 0) {
      toast.error('O carrinho está vazio');
      navigate('/carrinho');
      return;
    }
    if (!bairroSelecionado) {
      toast.error('Selecione um bairro para entrega');
      return;
    }
    if (!form.nome || !form.email || !form.telefone || !form.endereco) {
      toast.error('Preencha todos os campos');
      return;
    }

    const telefoneFormatado = formatarTelefone(form.telefone);

    const pedidoData = {
      clienteNome: form.nome,
      clienteEmail: form.email,
      telefone: telefoneFormatado,
      endereco: form.endereco,
      bairro: bairroSelecionado,
      subtotal,
      frete,
      total,
      itens: items.map(item => ({
        produtoId: item.id,
        produtoNome: item.nome,
        precoUnitario: item.preco,
        quantidade: item.quantidade,
        subtotal: item.preco * item.quantidade,
      })),
    };

    setEnviando(true);
    try {
      const response = await api.post('/pedidos', pedidoData);
      const pedido = response.data;

      // Garantir que todos os campos necessários existem para o PDF
      const pedidoParaPDF = {
        id: pedido.id,
        dataPedido: pedido.dataPedido || new Date().toISOString(),
        total: pedido.total || total,
        subtotal: pedido.subtotal !== undefined ? pedido.subtotal : subtotal,
        frete: pedido.frete !== undefined ? pedido.frete : frete,
        itens: (pedido.itens && pedido.itens.length > 0) ? pedido.itens : pedidoData.itens,
        endereco: form.endereco,
        bairro: bairroSelecionado,
      };

      // Gerar PDF do pedido
      const blob = await pdf(
        <ReciboPedidoPDF
          pedido={pedidoParaPDF}
          cliente={{ nome: form.nome, email: form.email }}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pedido_${pedido.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Pedido realizado com sucesso!');
      clearCart();
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erro ao finalizar pedido:', error);
      toast.error(error.response?.data?.error || 'Erro ao finalizar pedido');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-96">Carregando...</div>;
  if (!isAuthenticated) return null;

  if (items.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <FiShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700">Carrinho vazio</h2>
        <p className="text-gray-500 mt-2">Adicione produtos ao carrinho antes de finalizar.</p>
        <button onClick={() => navigate('/cardapio')} className="mt-6 bg-primaria text-white px-6 py-2 rounded-full hover:bg-secundaria transition">
          Explorar Cardápio
        </button>
      </div>
    );
  }

  return (
    <div className="bg-fundo min-h-screen py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-secundaria mb-6">Finalizar Pedido</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-secundaria mb-4 flex items-center gap-2">
                <FiUser /> Dados de entrega
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 border rounded-full px-4 py-2">
                  <FiUser className="text-gray-400" />
                  <input
                    type="text"
                    name="nome"
                    value={form.nome}
                    onChange={handleChange}
                    placeholder="Nome completo"
                    className="w-full outline-none"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 border rounded-full px-4 py-2">
                    <FiMail className="text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="E-mail (para receber a confirmação)"
                      className="w-full outline-none"
                      required
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1 ml-4">{errors.email}</p>}
                </div>
                <div>
                  <div className="flex items-center gap-2 border rounded-full px-4 py-2">
                    <FiPhone className="text-gray-400" />
                    <input
                      type="tel"
                      name="telefone"
                      value={form.telefone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Telefone (ex: 82XXXXXXX ou +258 82XXXXXXX)"
                      className="w-full outline-none"
                      required
                    />
                  </div>
                  {errors.telefone && <p className="text-red-500 text-xs mt-1 ml-4">{errors.telefone}</p>}
                </div>
                <div className="flex items-center gap-2 border rounded-full px-4 py-2">
                  <FiMapPin className="text-gray-400" />
                  <input
                    type="text"
                    name="endereco"
                    value={form.endereco}
                    onChange={handleChange}
                    placeholder="Endereço completo (rua, número, referência)"
                    className="w-full outline-none"
                    required
                  />
                </div>
                <div className="flex items-center gap-2 border rounded-full px-4 py-2">
                  <FiTruck className="text-gray-400" />
                  <select
                    name="bairro"
                    value={bairroSelecionado}
                    onChange={handleChange}
                    className="w-full outline-none bg-transparent"
                    required
                    disabled={carregandoBairros}
                  >
                    <option value="">{carregandoBairros ? 'A carregar bairros...' : 'Selecione o bairro'}</option>
                    {bairros.map(b => (
                      <option key={b.bairro} value={b.bairro}>
                        {b.bairro}
                      </option>
                    ))}
                  </select>
                </div>
                {bairroSelecionado && (
                  <div className="bg-fundo p-3 rounded-xl flex flex-col sm:flex-row justify-between gap-2 text-sm">
                    <span className="flex items-center gap-1"><FiTruck /> Frete: {frete.toFixed(2)} MT</span>
                    <span className="flex items-center gap-1"><FiClock /> Entrega: {tempoEntrega}</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={enviando || carregandoBairros}
                  className="w-full bg-primaria text-white py-2 rounded-full hover:bg-secundaria transition disabled:opacity-50"
                >
                  {enviando ? 'A processar...' : 'Confirmar Pedido'}
                </button>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 h-fit sticky top-24">
            <h2 className="text-xl font-semibold text-secundaria mb-4">Resumo do pedido</h2>
            <div className="space-y-2 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantidade}x {item.nome}</span>
                  <span>{(item.preco * item.quantidade).toFixed(2)} MT</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} MT</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span>{frete.toFixed(2)} MT</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-primaria">{total.toFixed(2)} MT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}