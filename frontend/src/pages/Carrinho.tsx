/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCartStore } from '../hooks/useCartStore';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';

export default function Carrinho() {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCartStore();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaria"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <FiShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700">Seu carrinho está vazio</h2>
        <p className="text-gray-500 mt-2">Adicione produtos pelo cardápio.</p>
        <Link to="/cardapio" className="inline-block mt-6 bg-primaria text-white px-6 py-2 rounded-full hover:bg-secundaria transition">
          Explorar Cardápio
        </Link>
      </div>
    );
  }

  const total = getTotalPrice();
  const totalItens = getTotalItems();

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold text-secundaria mb-6">Meu Carrinho</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de itens */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-md p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="flex items-center gap-4 flex-1">
                {item.imagemUrl ? (
                  <img src={item.imagemUrl} alt={item.nome} className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-2xl">🍽️</div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-800">{item.nome}</h3>
                  <p className="text-primaria font-bold">{item.preco.toFixed(2)} MT</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  value={item.quantidade}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                  className="w-20 border rounded-full text-center py-1"
                />
                <span className="font-semibold w-24 text-right">
                  {(item.preco * item.quantidade).toFixed(2)} MT
                </span>
                <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 transition">
                  <FiTrash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo do pedido */}
        <div className="bg-white rounded-2xl shadow-md p-6 h-fit">
          <h2 className="text-xl font-bold text-secundaria mb-4">Resumo</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal ({totalItens} itens)</span>
              <span>{total.toFixed(2)} MT</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Frete</span>
              <span>A calcular</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primaria">{total.toFixed(2)} MT</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/finalizar')}
            className="w-full bg-primaria text-white py-2 rounded-full mt-6 hover:bg-secundaria transition"
          >
            Finalizar Pedido
          </button>
          <Link to="/cardapio" className="block text-center mt-4 text-primaria hover:underline">
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}