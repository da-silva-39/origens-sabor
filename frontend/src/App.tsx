import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
        <Navbar />
        <main className="min-h-screen">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/agente/dashboard" element={<AgenteDashboard />} />
              <Route path="/admin/usuarios" element={<AdminUsuarios />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/admin/produtos" element={<AdminProdutos />} />
              <Route path="/admin/pedidos" element={<AdminPedidos />} />
              <Route path="/cardapio" element={<Cardapio />} />
              <Route path="/carrinho" element={<Carrinho />} />
              <Route path="/finalizar" element={<Finalizar />} />
              <Route path="/admin/monitorar-agente/:id" element={<AdminMonitorarAgente />} />
              <Route path="/reservar-mesa" element={<ReservarMesa />} />
              <Route path="/minhas-reservas" element={<MinhasReservas />} />
              <Route path="/admin/reservas" element={<AdminReservas />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/manual" element={<Manual />} />
              <Route path="/reservas/validar/:id" element={<ValidarReserva />} />
              <Route path="/meus-pedidos" element={<MeusPedidos />} />
              <Route path="/admin/mesas" element={<AdminMesas />} />
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
