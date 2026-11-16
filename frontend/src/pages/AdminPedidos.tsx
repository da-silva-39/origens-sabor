/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { nomeExibicao } from '../data/produtos';
import { toast } from 'react-hot-toast';
import { FiPackage } from 'react-icons/fi';

interface Agente {
  id: number;
  nome: string;
}

interface Pedido {
  id: number;
  cliente: { nome: string };
  agente: { id: number; nome: string } | null;
  endereco: string;
  bairro: string;
  total: number;
  status: string;
  dataPedido: string;
  itens?: { quantidade: number; produtoNome: string }[];
}

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: 'Pendente',
  PREPARANDO: 'Em preparação',
  SAIU_ENTREGA: 'Saiu para entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

const STATUS_COR: Record<string, string> = {
  PENDENTE: 'bg-dourado/15 text-[#8a6a34]',
  PREPARANDO: 'bg-blue-100 text-blue-700',
  SAIU_ENTREGA: 'bg-purple-100 text-purple-700',
  ENTREGUE: 'bg-oliva/15 text-oliva',
  CANCELADO: 'bg-red-100 text-red-700',
};

const STATUS_OPCOES = ['PENDENTE', 'PREPARANDO', 'SAIU_ENTREGA', 'ENTREGUE', 'CANCELADO'];

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [loading, setLoading] = useState(true);
  const [atribuindo, setAtribuindo] = useState<number | null>(null);
  const [filtro, setFiltro] = useState('TODOS');

  const carregarPedidos = useCallback(async () => {
    try {
      const res = await api.get<Pedido[]>('/pedidos/todos');
      setPedidos(res.data);
    } catch {
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<Agente[]>('/pedidos/agentes');
        setAgentes(res.data);
      } catch {
        console.error('Erro ao carregar agentes');
      }
      await carregarPedidos();
    };
    fetchData();
    const interval = setInterval(carregarPedidos, 15000);
    return () => clearInterval(interval);
  }, [carregarPedidos]);

  const atualizarStatus = async (id: number, status: string) => {
    try {
      await api.put(`/pedidos/${id}/status`, { status });
      toast.success('Estado atualizado');
      await carregarPedidos();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao atualizar estado');
    }
  };

  const atribuirAgente = async (id: number, agenteId: number) => {
    setAtribuindo(id);
    try {
      await api.put(`/pedidos/${id}/agente`, { agenteId });
      toast.success('Agente atribuído e notificado');
      await carregarPedidos();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao atribuir agente');
    } finally {
      setAtribuindo(null);
    }
  };

  const filtrados = filtro === 'TODOS' ? pedidos : pedidos.filter((p) => p.status === filtro);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaria" />
      </div>
    );
  }

  return (
    <section className="section">
      <div className="container-custom">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Administração</p>
            <h1 className="mt-2 font-display text-3xl text-secundaria sm:text-4xl">Pedidos</h1>
            <p className="mt-2 text-sm text-texto/60">
              {pedidos.length} pedidos · actualiza automaticamente a cada 15 segundos.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-texto/60">Estado:</span>
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="rounded-sm border border-texto/15 bg-white px-3 py-2 text-sm"
            >
              <option value="TODOS">Todos</option>
              {STATUS_OPCOES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filtrados.length === 0 ? (
          <div className="card mt-8 p-12 text-center">
            <FiPackage className="mx-auto text-4xl text-primaria" aria-hidden="true" />
            <p className="mt-4 font-display text-xl text-secundaria">Sem pedidos neste estado</p>
            <p className="mt-1 text-sm text-texto/60">Os novos pedidos aparecem aqui.</p>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-sm border border-texto/10 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-secundaria text-creme">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Entrega</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Agente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-texto/10">
                {filtrados.map((p) => {
                  const finalizado = p.status === 'ENTREGUE' || p.status === 'CANCELADO';
                  return (
                    <tr key={p.id} className="align-top hover:bg-areia/30">
                      <td className="px-4 py-4 text-texto/45">
                        {p.id}
                        <div className="text-[11px] text-texto/40">
                          {new Date(p.dataPedido).toLocaleString('pt-PT', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium">{p.cliente.nome}</div>
                        {p.itens && p.itens.length > 0 && (
                          <div className="mt-1 max-w-[16rem] text-xs text-texto/50">
                            {p.itens
                              .map((item) => `${item.quantidade}x ${nomeExibicao(item.produtoNome)}`)
                              .join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div>{p.endereco}</div>
                        <div className="text-xs text-texto/50">{p.bairro}</div>
                      </td>
                      <td className="px-4 py-4 font-medium">{p.total.toFixed(2)} MT</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <span
                            className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                              STATUS_COR[p.status] || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {STATUS_LABEL[p.status] || p.status}
                          </span>
                          <select
                            value={p.status}
                            onChange={(e) => atualizarStatus(p.id, e.target.value)}
                            disabled={finalizado}
                            aria-label={`Estado do pedido ${p.id}`}
                            className="rounded-sm border border-texto/15 bg-white px-2 py-1 text-xs disabled:opacity-50"
                          >
                            {STATUS_OPCOES.map((status) => (
                              <option key={status} value={status}>
                                {STATUS_LABEL[status]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          onChange={(e) => atribuirAgente(p.id, Number(e.target.value))}
                          value={p.agente?.id || ''}
                          disabled={atribuindo === p.id || finalizado}
                          aria-label={`Agente do pedido ${p.id}`}
                          className="w-40 rounded-sm border border-texto/15 bg-white px-2 py-1.5 text-xs disabled:opacity-50"
                        >
                          <option value="">Sem agente</option>
                          {agentes.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.nome}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
