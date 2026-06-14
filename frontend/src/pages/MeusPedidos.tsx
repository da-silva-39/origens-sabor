/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { pdf } from '@react-pdf/renderer';
import { ReciboPedidoPDF } from '../components/ReciboPedidoPDF';
import { FiDownload, FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface ItemPedido {
  id: number;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

interface Pedido {
  id: number;
  dataPedido: string;
  total: number;
  status: string;
  endereco: string;
  bairro: string;
  subtotal: number;
  frete: number;
  itens: ItemPedido[];
}

export default function MeusPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await api.get('/pedidos/cliente');
        setPedidos(res.data);
      } catch (error) {
        toast.error('Erro ao carregar pedidos');
      } finally {
        setCarregando(false);
      }
    };
    fetchPedidos();
  }, []);

  const handleBaixarRecibo = async (pedido: Pedido) => {
    try {
      const cliente = JSON.parse(localStorage.getItem('user') || '{}');
      const blob = await pdf(<ReciboPedidoPDF pedido={pedido} cliente={cliente} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pedido_${pedido.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Erro ao gerar PDF');
    }
  };

  const pedidosFiltrados = filtroStatus
    ? pedidos.filter(p => p.status === filtroStatus)
    : pedidos;

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (carregando) return <div className="text-center py-20">Carregando pedidos...</div>;

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-6">Meus Pedidos</h1>

      {/* Filtro por status */}
      <div className="mb-6 flex items-center gap-4">
        <label className="font-semibold">Filtrar por status:</label>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="border rounded-full px-4 py-1"
        >
          <option value="">Todos</option>
          <option value="PENDENTE">Pendente</option>
          <option value="PREPARANDO">Preparando</option>
          <option value="ENTREGUE">Entregue</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      {pedidosFiltrados.length === 0 ? (
        <p className="text-gray-500">Nenhum pedido encontrado.</p>
      ) : (
        <div className="space-y-4">
          {pedidosFiltrados.map((pedido) => (
            <div key={pedido.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
              {/* Cabeçalho do pedido (sempre visível) */}
              <div
                className="p-4 flex flex-wrap justify-between items-center cursor-pointer hover:bg-gray-50 transition"
                onClick={() => toggleExpand(pedido.id)}
              >
                <div className="flex gap-4 items-center">
                  <span className="font-bold text-primaria">#{pedido.id}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(pedido.dataPedido).toLocaleDateString('pt-PT')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    pedido.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                    pedido.status === 'PREPARANDO' ? 'bg-blue-100 text-blue-800' :
                    pedido.status === 'ENTREGUE' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {pedido.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-primaria">{pedido.total.toFixed(2)} MT</span>
                  {expandedId === pedido.id ? <FiChevronUp /> : <FiChevronDown />}
                </div>
              </div>

              {/* Detalhes expandidos */}
              {expandedId === pedido.id && (
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <p><strong>Endereço:</strong> {pedido.endereco} - {pedido.bairro}</p>
                  <p><strong>Subtotal:</strong> {pedido.subtotal.toFixed(2)} MT</p>
                  <p><strong>Frete:</strong> {pedido.frete.toFixed(2)} MT</p>
                  <p><strong>Total:</strong> {pedido.total.toFixed(2)} MT</p>

                  <h4 className="font-semibold mt-3 mb-2">Itens:</h4>
                  <div className="space-y-1">
                    {pedido.itens.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantidade}x {item.produtoNome}</span>
                        <span>{item.subtotal.toFixed(2)} MT</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleBaixarRecibo(pedido)}
                    className="mt-4 bg-primaria text-white px-4 py-2 rounded-full text-sm hover:bg-secundaria transition flex items-center gap-2"
                  >
                    <FiDownload /> Baixar Recibo PDF
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}