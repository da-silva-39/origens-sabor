/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corrigir ícones do Leaflet (problema comum)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Localizacao {
  latitude: number;
  longitude: number;
  endereco: string | null;
  createdAt: string;
}

export default function AdminMonitorarAgente() {
  const { id } = useParams<{ id: string }>();
  const [localizacao, setLocalizacao] = useState<Localizacao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const fetchLocalizacao = async () => {
    try {
      const res = await api.get(`/usuarios/admin/agente/${id}/localizacao`);
      setLocalizacao(res.data);
      setErro('');
    } catch (err: any) {
      if (err.response?.status === 404) {
        setErro('Agente ainda não partilhou localização.');
      } else {
        setErro('Erro ao buscar localização do agente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    fetchLocalizacao();
    const interval = setInterval(fetchLocalizacao, 10000); // actualiza a cada 10s
    return () => clearInterval(interval);
  }, [id]);

  if (carregando) return <div className="p-8 text-center">A carregar localização...</div>;
  if (erro) return <div className="p-8 text-center text-red-600">{erro}</div>;
  if (!localizacao) return null;

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold mb-2">Monitoramento do Agente</h1>
      <p className="text-gray-600 mb-4">
        Última actualização: {new Date(localizacao.createdAt).toLocaleString()}
      </p>

      <div className="bg-white rounded-2xl shadow-md p-2 mb-4">
        <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
          <MapContainer
            center={[localizacao.latitude, localizacao.longitude]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[localizacao.latitude, localizacao.longitude]}>
              <Popup>
                <strong>Localização do agente</strong><br />
                {localizacao.endereco || 'Coordenadas disponíveis'}<br />
                {new Date(localizacao.createdAt).toLocaleTimeString()}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-xl">
        <p><strong>Coordenadas:</strong> {localizacao.latitude}, {localizacao.longitude}</p>
        <p><strong>Endereço aproximado:</strong> {localizacao.endereco || 'Não disponível'}</p>
      </div>
    </div>
  );
}