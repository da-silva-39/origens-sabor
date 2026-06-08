import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import Manual from './pages/Manual';
import GoogleCallback from './pages/GoogleCallback';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/manual" element={<Manual />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;