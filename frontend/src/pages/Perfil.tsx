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
  const [endereco, setEndereco] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (user) {
      setNome(user.nome || '');
      setEmail(user.email || '');
      setTelefone(user.telefone || '');
      setEndereco((user as any).endereco || '');
      setDataNascimento((user as any).dataNascimento || '');
      if ((user as any).fotoUrl) setFotoPreview((user as any).fotoUrl);
    }
  }, [user]);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setFotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setMensagem('');
    try {
      await api.put('/usuarios/perfil', { nome, email, telefone, endereco, dataNascimento });
      setMensagem('Perfil actualizado com sucesso!');
      const updatedUser = { ...user, nome, email, telefone, endereco, dataNascimento };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.location.reload();
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
      await api.put('/usuarios/alterar-senha', { senhaAtual: currentPassword, novaSenha: newPassword });
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
    if (!fotoFile) return;
    const formData = new FormData();
    formData.append('foto', fotoFile);
    try {
      const response = await api.post('/usuarios/upload-foto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMensagem('Foto actualizada!');
      setFotoFile(null);
      const updatedUser = { ...user, fotoUrl: response.data.fotoUrl };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setFotoPreview(response.data.fotoUrl);
    } catch (err: any) {
      setErro(err.response?.data?.error || 'Erro ao enviar foto');
    }
  };

  if (loading) return <div className="text-center py-20">Carregando...</div>;
  if (!isAuthenticated) return null;

  const isOAuth = user?.isOAuth === true;

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
              <div>
                <label className="block text-sm font-medium">Endereço</label>
                <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} className="w-full border rounded-full px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Data de Nascimento</label>
                <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="w-full border rounded-full px-4 py-2" />
              </div>
              <button type="submit" className="bg-primaria text-white px-6 py-2 rounded-full hover:bg-secundaria transition">Actualizar Perfil</button>
            </form>
          </div>

          {/* Alterar senha (apenas para contas não‑OAuth) */}
          {!isOAuth && (
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
          )}

          {/* Foto de perfil com preview */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Foto de Perfil</h2>
            <div className="flex flex-col items-center mb-4">
              {fotoPreview ? (
                <img src={fotoPreview} alt="Preview" className="w-32 h-32 rounded-full object-cover border-4 border-primaria" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">Sem foto</div>
              )}
            </div>
            <form onSubmit={handleUploadFoto} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Escolher imagem</label>
                <input type="file" accept="image/*" onChange={handleFotoChange} className="w-full border rounded-full px-4 py-2" />
              </div>
              {fotoFile && (
                <button type="submit" className="bg-primaria text-white px-6 py-2 rounded-full hover:bg-secundaria transition">Enviar Foto</button>
              )}
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}