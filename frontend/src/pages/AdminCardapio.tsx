/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagemUrl: string | null;
}

export default function AdminCardapio() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroMin, setFiltroMin] = useState('');
  const [filtroMax, setFiltroMax] = useState('');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAuthenticated) {
      const fetchProdutos = async () => {
        try {
          const res = await api.get<Produto[]>('/produtos');
          const data = res.data;
          setProdutos(data);
          const cats = [...new Set(data.map(p => p.categoria))];
          setCategorias(cats);
        } catch (error) {
          console.error('Erro ao carregar cardápio');
        } finally {
          setCarregandoProdutos(false);
        }
      };
      fetchProdutos();
    } else {
      setCarregandoProdutos(false);
    }
  }, [isAuthenticated, loading, navigate]);

  const produtosFiltrados = produtos.filter((p) => {
    if (filtroNome && !p.nome.toLowerCase().includes(filtroNome.toLowerCase())) return false;
    if (filtroCategoria && p.categoria !== filtroCategoria) return false;
    if (filtroMin && p.preco < parseFloat(filtroMin)) return false;
    if (filtroMax && p.preco > parseFloat(filtroMax)) return false;
    return true;
  });

  const limparFiltros = () => {
    setFiltroNome('');
    setFiltroCategoria('');
    setFiltroMin('');
    setFiltroMax('');
  };

  if (loading || (isAuthenticated && carregandoProdutos)) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaria"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="bg-fundo min-h-screen py-8">
      <div className="container-custom">
        <h1 className="text-3xl md:text-4xl font-bold text-secundaria mb-2 text-center">Cardápio (Visualização Administrativa)</h1>
        <p className="text-center text-gray-600 mb-8">Consulte o cardápio – sem adicionar ao carrinho.</p>

        {/* Barra de busca + botão filtros mobile */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar prato..."
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primaria"
            />
          </div>
          <button
            onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            className="md:hidden flex items-center justify-center gap-2 bg-white border rounded-full px-4 py-2 shadow-sm"
          >
            <FiFilter /> Filtros {filtrosAbertos ? <FiX /> : ''}
          </button>
        </div>

        {/* Painel de filtros */}
        <div className={`${filtrosAbertos ? 'block' : 'hidden md:block'} bg-white p-4 rounded-2xl shadow-md mb-8`}>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium mb-1">Categoria</label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full border rounded-full px-4 py-2"
              >
                <option value="">Todas</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-28">
              <label className="block text-sm font-medium mb-1">Preço min (MT)</label>
              <input
                type="number"
                value={filtroMin}
                onChange={(e) => setFiltroMin(e.target.value)}
                placeholder="0"
                className="w-full border rounded-full px-4 py-2"
              />
            </div>
            <div className="w-28">
              <label className="block text-sm font-medium mb-1">Preço max (MT)</label>
              <input
                type="number"
                value={filtroMax}
                onChange={(e) => setFiltroMax(e.target.value)}
                placeholder="9999"
                className="w-full border rounded-full px-4 py-2"
              />
            </div>
            <button
              onClick={limparFiltros}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-full transition flex items-center gap-1"
            >
              <FiX size={16} /> Limpar
            </button>
          </div>
        </div>

        {/* Grid de produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtosFiltrados.map((produto) => (
            <div
              key={produto.id}
              className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative h-56 overflow-hidden bg-gray-100">
                {produto.imagemUrl ? (
                  <img
                    src={produto.imagemUrl}
                    alt={produto.nome}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">🍽️</div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-secundaria mb-1">{produto.nome}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{produto.descricao || 'Sem descrição'}</p>
                <p className="text-xs text-primaria font-semibold mb-3">{produto.categoria}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primaria">{produto.preco.toFixed(2)} MT</span>
                  {/* Sem botão "Adicionar" */}
                </div>
              </div>
            </div>
          ))}
        </div>

        {produtosFiltrados.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">Nenhum produto encontrado. Tente outros filtros.</p>
            <button onClick={limparFiltros} className="mt-4 text-primaria hover:underline">
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}