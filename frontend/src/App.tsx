import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;