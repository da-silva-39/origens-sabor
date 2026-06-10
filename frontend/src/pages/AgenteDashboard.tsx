/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { FiMapPin, FiPackage, FiNavigation } from 'react-icons/fi';
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
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregandoPedidos, setCarregandoPedidos] = useState(true);

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);
  const [enderecoAtual, setEnderecoAtual] = useState<string>('');
  const [carregandoEndereco, setCarregandoEndereco] = useState(false);
  const lastCoordsRef = useRef<{ lat: number; lng: number; endereco: string } | null>(null);

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
          if (res.data.length > 0 && pedidos.length === 0) toast.success(`Você tem ${res.data.length} pedido(s) para entregar!`);
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

  if (authLoading || carregandoPedidos) return <div className="text-center py-20">Carregando...</div>;
  if (!isAuthenticated || user?.role !== 'AGENTE') return null;

  return (
    <div className="bg-fundo min-h-screen py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-secundaria mb-2">Painel do Entregador</h1>
        <p className="text-gray-600 mb-6">Bem-vindo, {user?.nome}!</p>

        <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border-l-8 border-primaria">
          <div className="flex items-center gap-3 mb-2">
            <FiNavigation className="text-primaria text-2xl" />
            <h2 className="text-xl font-semibold text-gray-800">📍 Onde estou agora</h2>
          </div>
          {geoLoading && <p className="text-gray-500">A obter localização...</p>}
          {geoError && <p className="text-red-500">⚠️ {geoError}</p>}
          {location && (
            <>
              <p className="text-gray-700 text-lg font-medium">
                {carregandoEndereco ? 'A identificar local...' : enderecoAtual}
              </p>
              <p className="text-xs text-gray-400">Atualização dinâmica a cada 15s ou ao se movimentar.</p>
              <p className="text-xs text-green-600 mt-1">
                📡 Localização partilhada com o administrador em tempo real
              </p>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-2 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 px-3 pt-3">🗺️ Mapa da minha localização</h2>
          <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
            {location ? (
              <MapContainer center={[location.lat, location.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[location.lat, location.lng]}>
                  <Popup>Você está aqui! <br /> {enderecoAtual}</Popup>
                </Marker>
                <ChangeView center={[location.lat, location.lng]} />
              </MapContainer>
            ) : (
              <div className="flex justify-center items-center h-full bg-gray-100 text-gray-500">
                {geoError ? 'Localização indisponível' : 'A carregar mapa...'}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 text-center pt-2">Localização atualizada automaticamente.</p>
        </div>

        {pedidos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum pedido atribuído no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pedidos.map(pedido => (
              <div key={pedido.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="bg-primaria text-white px-4 py-2"><span className="font-bold">Pedido #{pedido.id}</span></div>
                <div className="p-4 space-y-3">
                  <p><strong>Cliente:</strong> {pedido.clienteNome}</p>
                  <p className="flex items-center gap-1"><FiMapPin /> <strong>Endereço:</strong> {pedido.endereco} - {pedido.bairro}</p>
                  <p><strong>Itens:</strong></p>
                  <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                    {pedido.itens.map((item, idx) => (<li key={idx}>{item.quantidade}x {item.produtoNome}</li>))}
                  </ul>
                  <p><strong>Total:</strong> {pedido.total.toFixed(2)} MT</p>
                  <div className="flex justify-between items-center pt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${pedido.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' : pedido.status === 'PREPARANDO' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {pedido.status}
                    </span>
                    <button onClick={() => marcarEntregue(pedido.id)} className="bg-primaria text-white px-4 py-2 rounded-full hover:bg-secundaria transition">Marcar como entregue</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}