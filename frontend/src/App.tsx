import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import RotaProtegida from './components/RotaProtegida';
import Home from './pages/Home';

const Login = lazy(() => import('./pages/Login'));
const Registro = lazy(() => import('./pages/Registro'));
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AgenteDashboard = lazy(() => import('./pages/AgenteDashboard'));
const AdminUsuarios = lazy(() => import('./pages/AdminUsuarios'));
const Perfil = lazy(() => import('./pages/Perfil'));
const AdminProdutos = lazy(() => import('./pages/AdminProdutos'));
const AdminPedidos = lazy(() => import('./pages/AdminPedidos'));
const Cardapio = lazy(() => import('./pages/Cardapio'));
const Carrinho = lazy(() => import('./pages/Carrinho'));
const Finalizar = lazy(() => import('./pages/Finalizar'));
const AdminMonitorarAgente = lazy(() => import('./pages/AdminMonitorarAgente'));
const ReservarMesa = lazy(() => import('./pages/ReservarMesa'));
const MinhasReservas = lazy(() => import('./pages/MinhasReservas'));
const AdminReservas = lazy(() => import('./pages/AdminReservas'));
const Contacto = lazy(() => import('./pages/Contacto'));
const Manual = lazy(() => import('./pages/Manual'));
const ValidarReserva = lazy(() => import('./pages/ValidarReserva'));
const MeusPedidos = lazy(() => import('./pages/MeusPedidos'));
const AdminMesas = lazy(() => import('./pages/AdminMesas'));
const Termos = lazy(() => import('./pages/Termos'));
const PaginaNaoEncontrada = lazy(() => import('./pages/PaginaNaoEncontrada'));

function PageLoader() {
  return (
    <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaria"></div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />
        <main id="conteudo-principal" className="min-h-screen">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />
              <Route path="/dashboard" element={<RotaProtegida><Dashboard /></RotaProtegida>} />
              <Route path="/admin/dashboard" element={<RotaProtegida roles={['ADMIN']}><AdminDashboard /></RotaProtegida>} />
              <Route path="/agente/dashboard" element={<RotaProtegida roles={['AGENTE', 'ADMIN']}><AgenteDashboard /></RotaProtegida>} />
              <Route path="/admin/usuarios" element={<RotaProtegida roles={['ADMIN']}><AdminUsuarios /></RotaProtegida>} />
              <Route path="/perfil" element={<RotaProtegida><Perfil /></RotaProtegida>} />
              <Route path="/admin/produtos" element={<RotaProtegida roles={['ADMIN']}><AdminProdutos /></RotaProtegida>} />
              <Route path="/admin/pedidos" element={<RotaProtegida roles={['ADMIN']}><AdminPedidos /></RotaProtegida>} />
              <Route path="/cardapio" element={<Cardapio />} />
              <Route path="/carrinho" element={<Carrinho />} />
              <Route path="/finalizar" element={<RotaProtegida><Finalizar /></RotaProtegida>} />
              <Route path="/admin/monitorar-agente/:id" element={<RotaProtegida roles={['ADMIN']}><AdminMonitorarAgente /></RotaProtegida>} />
              <Route path="/reservar-mesa" element={<ReservarMesa />} />
              <Route path="/minhas-reservas" element={<RotaProtegida><MinhasReservas /></RotaProtegida>} />
              <Route path="/admin/reservas" element={<RotaProtegida roles={['ADMIN']}><AdminReservas /></RotaProtegida>} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/manual" element={<Manual />} />
              <Route path="/reservas/validar/:id" element={<ValidarReserva />} />
              <Route path="/meus-pedidos" element={<RotaProtegida><MeusPedidos /></RotaProtegida>} />
              <Route path="/admin/mesas" element={<RotaProtegida roles={['ADMIN']}><AdminMesas /></RotaProtegida>} />
              <Route path="/termos" element={<Termos />} />
              <Route path="/privacidade" element={<Navigate to="/termos" replace />} />
              <Route path="*" element={<PaginaNaoEncontrada />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
