/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Mesa {
  id: number;
  numero: number;
  estado: string;
}

export default function ReservarMesa() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [mesaId, setMesaId] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [quantidadePessoas, setQuantidadePessoas] = useState(2);
  const [observacoes, setObservacoes] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const res = await api.get('/mesas'); // certifique-se que existe rota /api/mesas
        setMesas(res.data);
      } catch (error) {
        toast.error('Erro ao carregar mesas');
      }
    };
    fetchMesas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesaId) return toast.error('Selecione uma mesa');
    if (!dataHora) return toast.error('Selecione data e hora');
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
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Reservar Mesa</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md space-y-4">
        <div>
          <label className="block font-medium mb-1">Mesa</label>
          <select
            value={mesaId}
            onChange={(e) => setMesaId(e.target.value)}
            className="w-full border rounded-full px-4 py-2"
            required
          >
            <option value="">Selecione uma mesa</option>
            {mesas.map((m) => (
              <option key={m.id} value={m.id}>Mesa {m.numero}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Data e Hora</label>
          <input
            type="datetime-local"
            value={dataHora}
            onChange={(e) => setDataHora(e.target.value)}
            className="w-full border rounded-full px-4 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Número de pessoas</label>
          <input
            type="number"
            value={quantidadePessoas}
            onChange={(e) => setQuantidadePessoas(Number(e.target.value))}
            className="w-full border rounded-full px-4 py-2"
            min={1}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Observações (opcional)</label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="w-full border rounded-2xl px-4 py-2"
            rows={3}
          />
        </div>
        <button
          type="submit"
          disabled={carregando}
          className="bg-primaria text-white py-2 px-6 rounded-full hover:bg-secundaria transition"
        >
          {carregando ? 'Processando...' : 'Solicitar Reserva'}
        </button>
      </form>
    </div>
  );
}