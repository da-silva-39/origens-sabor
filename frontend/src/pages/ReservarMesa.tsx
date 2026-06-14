/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiUsers, FiMapPin, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

interface Mesa {
  id: number;
  numero: number;
  estado: string; // "LIVRE" ou "OCUPADA"
}

export default function ReservarMesa() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [mesaId, setMesaId] = useState<number | ''>('');
  const [dataHora, setDataHora] = useState('');
  const [quantidadePessoas, setQuantidadePessoas] = useState(2);
  const [observacoes, setObservacoes] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [carregandoMesas, setCarregandoMesas] = useState(true);
  const [disponivel, setDisponivel] = useState<boolean | null>(null);
  const [verificando, setVerificando] = useState(false);

  // Carregar mesas disponíveis
  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const res = await api.get('/mesas');
        setMesas(res.data);
      } catch (error) {
        toast.error('Erro ao carregar mesas');
      } finally {
        setCarregandoMesas(false);
      }
    };
    fetchMesas();
  }, []);

  // Verificar disponibilidade da mesa para a data/hora selecionada
  useEffect(() => {
    const checkDisponibilidade = async () => {
      if (!mesaId || !dataHora) {
        setDisponivel(null);
        return;
      }
      setVerificando(true);
      try {
        const res = await api.get(`/reservas/disponibilidade?mesaId=${mesaId}&dataHora=${dataHora}`);
        setDisponivel(res.data.disponivel);
      } catch (error) {
        setDisponivel(null);
      } finally {
        setVerificando(false);
      }
    };

    const timer = setTimeout(checkDisponibilidade, 500); // debounce
    return () => clearTimeout(timer);
  }, [mesaId, dataHora]);

  const selecionarMesa = (id: number) => {
    setMesaId(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesaId) return toast.error('Selecione uma mesa');
    if (!dataHora) return toast.error('Selecione data e hora');
    if (disponivel === false) return toast.error('Esta mesa já não está disponível para o horário selecionado.');

    setCarregando(true);
    try {
      await api.post('/reservas', {
        mesaId: Number(mesaId),
        dataHora,
        quantidadePessoas,
        observacoes,
      });
      toast.success('Reserva solicitada com sucesso! Aguarde confirmação.');
      navigate('/minhas-reservas');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao criar reserva');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-fundo py-12">
      <div className="container-custom px-4 max-w-6xl mx-auto">
        {/* Título e instruções */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-secundaria mb-4">Reserve a sua Mesa</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Garanta um lugar no Origens do Sabor para momentos especiais. Escolha a mesa, a data e a hora,
            e envie a sua solicitação. A reserva será confirmada pela nossa equipa.
          </p>
        </div>

        {/* Passo a passo */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-10">
          <h2 className="text-2xl font-semibold text-secundaria mb-4 flex items-center gap-2">
            <FiCheckCircle className="text-primaria" /> Como fazer a sua reserva
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primaria/10 rounded-full flex items-center justify-center text-primaria font-bold">1</div>
              <div>
                <h3 className="font-semibold">Escolha a mesa</h3>
                <p className="text-sm text-gray-600">Clique sobre uma das mesas disponíveis na lista abaixo.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primaria/10 rounded-full flex items-center justify-center text-primaria font-bold">2</div>
              <div>
                <h3 className="font-semibold">Defina data e hora</h3>
                <p className="text-sm text-gray-600">Escolha o dia e horário pretendido (mínimo 1 hora de antecedência).</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primaria/10 rounded-full flex items-center justify-center text-primaria font-bold">3</div>
              <div>
                <h3 className="font-semibold">Envie a solicitação</h3>
                <p className="text-sm text-gray-600">Aguarde a confirmação e faça o download do recibo.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de mesas (cards) */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-secundaria mb-4 flex items-center gap-2">
            <FiMapPin className="text-primaria" /> Mesas disponíveis
          </h2>
          {carregandoMesas ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaria"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {mesas.map((mesa) => {
                const isOcupada = mesa.estado === 'OCUPADA';
                const isSelecionada = mesaId === mesa.id;
                return (
                  <div
                    key={mesa.id}
                    onClick={() => !isOcupada && selecionarMesa(mesa.id)}
                    className={`
                      cursor-pointer rounded-xl p-4 text-center transition-all duration-200 border-2
                      ${isOcupada ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300' : ''}
                      ${isSelecionada && !isOcupada ? 'border-primaria bg-primaria/10 shadow-md' : 'border-gray-200 bg-white hover:border-primaria/50'}
                    `}
                  >
                    <div className="text-2xl font-bold text-secundaria">Mesa {mesa.numero}</div>
                    <div className="text-xs mt-1 flex items-center justify-center gap-1">
                      {isOcupada ? (
                        <><FiAlertCircle className="text-red-500" /> Ocupada</>
                      ) : (
                        <><FiCheckCircle className="text-green-500" /> Disponível</>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3 text-center">
            * Clique numa mesa disponível para a selecionar. A disponibilidade pode variar em tempo real.
          </p>
        </div>

        {/* Formulário de reserva */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-secundaria mb-6 flex items-center gap-2">
            <FiCalendar className="text-primaria" /> Dados da reserva
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Mesa selecionada</label>
              <select
                value={mesaId}
                onChange={(e) => setMesaId(Number(e.target.value))}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primaria"
                required
              >
                <option value="">Selecione uma mesa</option>
                {mesas.map((m) => (
                  <option key={m.id} value={m.id} disabled={m.estado === 'OCUPADA'}>
                    Mesa {m.numero} {m.estado === 'OCUPADA' ? '(ocupada)' : '(disponível)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Data e Hora</label>
              <input
                type="datetime-local"
                value={dataHora}
                onChange={(e) => setDataHora(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primaria"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Horário mínimo de reserva: 1 hora a partir do momento atual.</p>
            </div>

            {/* Indicador de disponibilidade em tempo real */}
            {mesaId && dataHora && (
              <div className="mt-2">
                {verificando ? (
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    <FiInfo className="animate-pulse" /> A verificar disponibilidade...
                  </p>
                ) : disponivel === true ? (
                  <p className="text-green-600 text-sm flex items-center gap-1">
                    <FiCheckCircle /> Mesa disponível para este horário.
                  </p>
                ) : disponivel === false ? (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <FiAlertCircle /> Esta mesa já está reservada para este horário.
                  </p>
                ) : null}
              </div>
            )}

            <div>
              <label className="block font-medium text-gray-700 mb-1">Número de pessoas</label>
              <div className="flex items-center gap-2">
                <FiUsers className="text-gray-400" />
                <input
                  type="number"
                  value={quantidadePessoas}
                  onChange={(e) => setQuantidadePessoas(Number(e.target.value))}
                  min={1}
                  max={20}
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primaria"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Observações (opcional)</label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primaria"
                placeholder="Ex: pedido especial, cadeira de bebé, etc."
              />
            </div>

            <button
              type="submit"
              disabled={carregando || disponivel === false}
              className="w-full bg-primaria hover:bg-secundaria text-white font-semibold py-3 rounded-xl transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {carregando ? 'A processar...' : 'Solicitar Reserva'}
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-4">
            Ao solicitar, a reserva ficará pendente. Após confirmação da equipa, receberá um recibo em PDF.
          </p>
        </div>
      </div>
    </div>
  );
}