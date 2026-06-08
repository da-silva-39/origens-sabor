/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';

export default function Perfil() {
  const { user, isAuthenticated, loading } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (user) {
      setNome(user.nome || '');
      setEmail(user.email || '');
      setTelefone(user.telefone || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setMensagem('');
    try {
      await api.put('/usuarios/perfil', { nome, email, telefone });
      setMensagem('Perfil actualizado com sucesso!');
      // Atualizar user no localStorage
      const updatedUser = { ...user, nome, email, telefone };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.location.reload(); // recarrega para refletir (ou actualize o contexto)
    } catch (err: any) {
      setErro(err.response?.data?.error || 'Erro ao actualizar perfil');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErro('As novas senhas não coincidem');
      return;
    }
    try {
      await api.put('/usuarios/alterar-senha', {
        senhaAtual: currentPassword,
        novaSenha: newPassword,
      });
      setMensagem('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErro(err.response?.data?.error || 'Erro ao alterar senha');
    }
  };

  const handleUploadFoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foto) return;
    const formData = new FormData();
    formData.append('foto', foto);
    try {
      await api.post('/usuarios/upload-foto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMensagem('Foto actualizada!');
      setFoto(null);
    } catch (err: any) {
      setErro(err.response?.data?.error || 'Erro ao enviar foto');
    }
  };

  if (loading) return <div className="text-center py-20">Carregando...</div>;
  if (!isAuthenticated) return null;

  return (
    <>
      <Navbar />
      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold text-secundaria mb-8">Meu Perfil</h1>
        {mensagem && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{mensagem}</div>}
        {erro && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{erro}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Dados pessoais */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Dados Pessoais</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Nome completo</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border rounded-full px-4 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium">E-mail</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-full px-4 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium">Telefone (WhatsApp)</label>
                <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full border rounded-full px-4 py-2" />
              </div>
              <button type="submit" className="bg-primaria text-white px-6 py-2 rounded-full hover:bg-secundaria transition">Actualizar Perfil</button>
            </form>
          </div>

          {/* Alterar senha */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Alterar Senha</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Senha actual</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full border rounded-full px-4 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium">Nova senha</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border rounded-full px-4 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium">Confirmar nova senha</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border rounded-full px-4 py-2" required />
              </div>
              <button type="submit" className="bg-primaria text-white px-6 py-2 rounded-full hover:bg-secundaria transition">Alterar Senha</button>
            </form>
          </div>

          {/* Upload de foto */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Foto de Perfil</h2>
            <form onSubmit={handleUploadFoto} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Escolher imagem</label>
                <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} className="w-full border rounded-full px-4 py-2" />
              </div>
              <button type="submit" className="bg-primaria text-white px-6 py-2 rounded-full hover:bg-secundaria transition">Enviar Foto</button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}