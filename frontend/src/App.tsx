import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/navbar';   // ← minúsculo
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Registro from './pages/Registro';
import GoogleCallback from './pages/GoogleCallback';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AgenteDashboard from './pages/AgenteDashboard';
import AdminUsuarios from './pages/AdminUsuarios';
import Perfil from './pages/Perfil';
import AdminProdutos from './pages/AdminProdutos';
import AdminPedidos from './pages/AdminPedidos';
import Cardapio from './pages/Cardapio';
import Carrinho from './pages/Carrinho';
import Finalizar from './pages/Finalizar';
import AdminMonitorarAgente from './pages/AdminMonitorarAgente';
import ReservarMesa from './pages/ReservarMesa';
import MinhasReservas from './pages/MinhasReservas';
import AdminReservas from './pages/AdminReservas';
import Contacto from './pages/Contacto';
import Manual from './pages/Manual';



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="min-h-screen">
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
          </Routes>
        </main>
        <Footer />
        <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;