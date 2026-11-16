/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { nomeExibicao } from '../data/produtos';
import { toast } from 'react-hot-toast';
import ContaHeader from '../components/ContaHeader';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  FiCheckCircle,
  FiMapPin,
  FiPackage,
  FiNavigation,
  FiAlertTriangle,
  FiUser,
  FiWifi,
  FiMap,
} from 'react-icons/fi';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Ícones do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Pedido {
  id: number;
  clienteNome: string;
  endereco: string;
  total: number;
  status: string;
  itens: { produtoNome: string; quantidade: number }[];
  bairro: string;
}

async function obterEnderecoPorCoordenadas(lat: number, lng: number): Promise<string> {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat, lon: lng, format: 'json', 'accept-language': 'pt', addressdetails: 1 },
      headers: { 'User-Agent': 'OrigensSabor/1.0 (admin@origenssabor.com)' },
    });
    const data = response.data;
    if (data && data.display_name) {
      const addr = data.address;
      const partes = [];
      if (addr.road) partes.push(addr.road);
      if (addr.suburb || addr.neighbourhood) partes.push(addr.suburb || addr.neighbourhood);
      if (addr.city || addr.town) partes.push(addr.city || addr.town);
      if (partes.length === 0) return data.display_name.split(',')[0];
      return partes.join(', ');
    }
    return 'Localização aproximada';
  } catch (error) {
    console.error('Erro no reverse geocoding:', error);
    return 'Não foi possível obter o endereço';
  }
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function AgenteDashboard() {
  useDocumentTitle('Painel do entregador — Origens do Sabor');
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregandoPedidos, setCarregandoPedidos] = useState(true);

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);
  const [enderecoAtual, setEnderecoAtual] = useState<string>('');
  const [carregandoEndereco, setCarregandoEndereco] = useState(false);
  const lastCoordsRef = useRef<{ lat: number; lng: number; endereco: string } | null>(null);
  const notificacaoPedidosRef = useRef(false);

  // Geolocalização
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocalização não é suportada pelo seu navegador.');
      setGeoLoading(false);
      return;
    }
    const success = (pos: GeolocationPosition) => {
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setGeoError(null);
      setGeoLoading(false);
    };
    const errorCb = (err: GeolocationPositionError) => {
      let msg = 'Erro ao obter localização.';
      if (err.code === 1) msg = 'Permissão negada. Active a localização no seu navegador.';
      else if (err.code === 2) msg = 'Posição indisponível.';
      else if (err.code === 3) msg = 'Tempo limite excedido.';
      setGeoError(msg);
      setGeoLoading(false);
    };
    navigator.geolocation.getCurrentPosition(success, errorCb, { enableHighAccuracy: true, timeout: 10000 });
    const watchId = navigator.geolocation.watchPosition(success, errorCb, { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 });
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Reverse geocoding
  useEffect(() => {
    if (!location) return;
    if (lastCoordsRef.current) {
      const { lat, lng } = lastCoordsRef.current;
      const distancia = Math.sqrt(Math.pow(location.lat - lat, 2) + Math.pow(location.lng - lng, 2)) * 111000;
      if (distancia < 50 && lastCoordsRef.current.endereco) {
        setEnderecoAtual(lastCoordsRef.current.endereco);
        return;
      }
    }
    const fetchEndereco = async () => {
      setCarregandoEndereco(true);
      const endereco = await obterEnderecoPorCoordenadas(location.lat, location.lng);
      setEnderecoAtual(endereco);
      lastCoordsRef.current = { lat: location.lat, lng: location.lng, endereco };
      setCarregandoEndereco(false);
    };
    fetchEndereco();
    const interval = setInterval(() => { if (location) fetchEndereco(); }, 15000);
    return () => clearInterval(interval);
  }, [location]);

  // Buscar pedidos do agente
  useEffect(() => {
    if (isAuthenticated && user?.role === 'AGENTE') {
      const fetchPedidos = async () => {
        try {
          const res = await api.get('/pedidos/agente');
          setPedidos(res.data);
          if (res.data.length > 0 && !notificacaoPedidosRef.current) {
            notificacaoPedidosRef.current = true;
            toast.success(`Tem ${res.data.length} pedido(s) para entregar.`);
          }
        } catch (error) { console.error(error); }
        finally { setCarregandoPedidos(false); }
      };
      fetchPedidos();
      const interval = setInterval(fetchPedidos, 30000);
      return () => clearInterval(interval);
    } else setCarregandoPedidos(false);
  }, [isAuthenticated, user]);

  // ENVIAR LOCALIZAÇÃO PARA O SERVIDOR (MONITORAMENTO ADMIN)
  useEffect(() => {
    if (!location || !user || user.role !== 'AGENTE') return;

    const enviarLocalizacao = async () => {
      try {
        await api.post('/usuarios/agente/localizacao', {
          latitude: location.lat,
          longitude: location.lng,
          endereco: enderecoAtual || null,
        });
      } catch (err) {
        console.error('Erro ao enviar localização:', err);
      }
    };

    enviarLocalizacao();
    const interval = setInterval(enviarLocalizacao, 15000);
    return () => clearInterval(interval);
  }, [location, enderecoAtual, user]);

  const marcarEntregue = async (id: number) => {
    try {
      await api.put(`/pedidos/${id}/entregue`);
      toast.success(`Pedido #${id} marcado como entregue!`);
      setPedidos(pedidos.filter(p => p.id !== id));
    } catch (error) { toast.error('Erro ao marcar como entregue'); }
  };

  if (authLoading || carregandoPedidos) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primaria" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'AGENTE') return null;

  const PRIORIDADE_STATUS: Record<string, string> = {
    PENDENTE: 'bg-dourado/15 text-[#8a6a34]',
    PREPARANDO: 'bg-primaria/10 text-primaria',
    SAIU_ENTREGA: 'bg-oliva/15 text-oliva',
    ENTREGUE: 'bg-secundaria/10 text-secundaria',
    CANCELADO: 'bg-red-50 text-red-700',
  };

  return (
    <div className="bg-fundo">
      <ContaHeader
        eyebrow="Loja · Entregas"
        titulo="Painel do entregador"
        descricao={`Bem-vindo, ${user?.nome}. Aqui vê a sua localização em tempo real e os pedidos que lhe foram atribuídos.`}
        voltarPara="/"
        voltarRotulo="Voltar ao início"
        acao={
          <span className="inline-flex items-center gap-2 border border-creme/25 px-4 py-2 text-xs font-semibold text-creme">
            <span className="h-2 w-2 rounded-full bg-oliva" />
            {pedidos.length} {pedidos.length === 1 ? 'pedido atribuído' : 'pedidos atribuídos'}
          </span>
        }
      />

      <div className="container-custom max-w-5xl space-y-6 py-10">
        <div className="border border-carvao/10 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center bg-primaria/10 text-primaria">
                <FiNavigation className="text-xl" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-xl text-secundaria">Onde estou agora</h2>
                <p className="mt-0.5 text-xs text-carvao/50">
                  Atualização dinâmica a cada 15 segundos ou ao movimentar-se.
                </p>
              </div>
            </div>
            {location && (
              <span className="inline-flex items-center gap-1.5 bg-oliva/10 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-oliva">
                <FiWifi aria-hidden="true" /> Partilhada em tempo real
              </span>
            )}
          </div>

          <div className="mt-4 border-t border-carvao/5 pt-4">
            {geoLoading && (
              <p className="text-sm text-carvao/55">A obter localização...</p>
            )}
            {geoError && (
              <p className="flex items-center gap-2 text-sm font-medium text-red-600">
                <FiAlertTriangle aria-hidden="true" /> {geoError}
              </p>
            )}
            {location && (
              <p className="text-base font-medium leading-snug text-carvao">
                {carregandoEndereco ? 'A identificar local...' : enderecoAtual}
              </p>
            )}
          </div>
        </div>

        <div className="border border-carvao/10 bg-white p-6">
          <h2 className="flex items-center gap-2 font-display text-xl text-secundaria">
            <FiMap aria-hidden="true" className="text-terracota" /> Mapa da minha localização
          </h2>
          <div className="mt-4 h-[400px] overflow-hidden border border-carvao/10">
            {location ? (
              <MapContainer
                center={[location.lat, location.lng]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[location.lat, location.lng]}>
                  <Popup>
                    Você está aqui! <br /> {enderecoAtual}
                  </Popup>
                </Marker>
                <ChangeView center={[location.lat, location.lng]} />
              </MapContainer>
            ) : (
              <div className="flex h-full items-center justify-center bg-areia/30 text-sm text-carvao/50">
                {geoError ? 'Localização indisponível' : 'A carregar mapa...'}
              </div>
            )}
          </div>
          <p className="mt-3 text-center text-xs text-carvao/45">
            Localização atualizada automaticamente.
          </p>
        </div>

        {pedidos.length === 0 ? (
          <div className="border border-carvao/10 bg-white p-12 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center bg-areia/50 text-terracota">
              <FiPackage className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="mt-5 font-display text-2xl text-secundaria">Nenhum pedido atribuído</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-carvao/55">
              Quando a loja lhe atribuir uma entrega, ela aparece aqui com todos os
              detalhes.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {pedidos.map((pedido) => (
              <article
                key={pedido.id}
                className="overflow-hidden border border-carvao/10 bg-white"
              >
                <div className="flex items-center justify-between gap-3 border-b border-carvao/10 p-5">
                  <h3 className="font-display text-xl text-secundaria">
                    Encomenda #{pedido.id}
                  </h3>
                  <span
                    className={`inline-flex px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider ${
                      PRIORIDADE_STATUS[pedido.status] || 'bg-carvao/5 text-carvao/65'
                    }`}
                  >
                    {pedido.status}
                  </span>
                </div>

                <div className="space-y-3 p-5 text-sm text-carvao/75">
                  <p className="flex items-center gap-2">
                    <FiUser aria-hidden="true" className="shrink-0 text-terracota" />
                    <span>
                      <span className="font-semibold text-carvao">{pedido.clienteNome}</span>
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <FiMapPin aria-hidden="true" className="mt-0.5 shrink-0 text-terracota" />
                    <span>
                      {pedido.endereco}
                      <span className="block text-xs text-carvao/45">{pedido.bairro}</span>
                    </span>
                  </p>

                  <ul className="divide-y divide-carvao/5 border-y border-carvao/5 py-2">
                    {pedido.itens.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between py-1.5 text-xs">
                        <span>
                          {item.quantidade} × {nomeExibicao(item.produtoNome)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-carvao/50">
                      Total
                    </span>
                    <span className="font-display text-lg text-secundaria">
                      {pedido.total.toFixed(2)} MT
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => marcarEntregue(pedido.id)}
                    className="btn-primary btn-sm w-full"
                  >
                    <FiCheckCircle aria-hidden="true" /> Marcar como entregue
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
