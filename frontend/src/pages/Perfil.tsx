/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { FiCamera, FiSave, FiLock, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

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
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (user) {
      setNome(user.nome || '');
      setEmail(user.email || '');
      setTelefone(user.telefone || '');
      setEndereco((user as any).endereco || '');
      setDataNascimento((user as any).dataNascimento || '');
      const foto = (user as any).fotoUrl;
      if (foto) setFotoPreview(foto);
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
    setCarregando(true);
    try {
      await api.put('/usuarios/perfil', { nome, email, telefone, endereco, dataNascimento });
      setMensagem('Perfil atualizado com sucesso!');
      const updatedUser = { ...user, nome, email, telefone, endereco, dataNascimento };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      setErro(err.response?.data?.error || 'Erro ao atualizar perfil');
    } finally {
      setCarregando(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErro('As novas senhas não coincidem');
      return;
    }
    setCarregando(true);
    try {
      await api.put('/usuarios/alterar-senha', { senhaAtual: currentPassword, novaSenha: newPassword });
      setMensagem('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErro(err.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setCarregando(false);
    }
  };

  const handleUploadFoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fotoFile) return;
    const formData = new FormData();
    formData.append('foto', fotoFile);
    setCarregando(true);
    try {
      const response = await api.post('/usuarios/upload-foto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMensagem('Foto atualizada!');
      setFotoFile(null);
      const updatedUser = { ...user, fotoUrl: response.data.fotoUrl };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setFotoPreview(response.data.fotoUrl);
      toast.success('Foto de perfil atualizada!');
    } catch (err: any) {
      setErro(err.response?.data?.error || 'Erro ao enviar foto');
    } finally {
      setCarregando(false);
    }
  };

  if (loading) return <div className="text-center py-20">Carregando...</div>;
  if (!isAuthenticated) return null;

  const isOAuth = user?.isOAuth === true;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-secundaria mb-8 flex items-center gap-2">
        <FiUser /> Meu Perfil
      </h1>

      {mensagem && <div className="bg-green-100 text-green-700 p-3 rounded-xl mb-4">{mensagem}</div>}
      {erro && <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4">{erro}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Foto de perfil */}
        <div className="bg-white p-6 rounded-2xl shadow-md text-center">
          <h2 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2"><FiCamera /> Foto</h2>
          <div className="flex justify-center mb-4">
            {fotoPreview ? (
              <img src={fotoPreview} alt="Perfil" className="w-32 h-32 rounded-full object-cover border-4 border-primaria shadow-md" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl">
                {user?.nome?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <form onSubmit={handleUploadFoto} className="space-y-4">
            <input type="file" accept="image/*" onChange={handleFotoChange} className="w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-primaria file:text-white hover:file:bg-secundaria" />
            {fotoFile && (
              <button type="submit" disabled={carregando} className="bg-primaria text-white px-4 py-2 rounded-full w-full hover:bg-secundaria transition">
                {carregando ? 'A enviar...' : 'Enviar Foto'}
              </button>
            )}
          </form>
        </div>

        {/* Dados pessoais */}
        <div className="bg-white p-6 rounded-2xl shadow-md md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FiUser /> Dados Pessoais</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex items-center gap-2 border rounded-full px-4 py-2">
              <FiUser className="text-gray-400" />
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="w-full outline-none" placeholder="Nome completo" required />
            </div>
            <div className="flex items-center gap-2 border rounded-full px-4 py-2">
              <FiMail className="text-gray-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full outline-none" placeholder="E-mail" required />
            </div>
            <div className="flex items-center gap-2 border rounded-full px-4 py-2">
              <FiPhone className="text-gray-400" />
              <input type="tel" value={telefone} onChange={e => setTelefone(e.target.value)} className="w-full outline-none" placeholder="Telefone" />
            </div>
            <div className="flex items-center gap-2 border rounded-full px-4 py-2">
              <FiMapPin className="text-gray-400" />
              <input type="text" value={endereco} onChange={e => setEndereco(e.target.value)} className="w-full outline-none" placeholder="Endereço" />
            </div>
            <div className="flex items-center gap-2 border rounded-full px-4 py-2">
              <FiCalendar className="text-gray-400" />
              <input type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} className="w-full outline-none" />
            </div>
            <button type="submit" disabled={carregando} className="bg-primaria text-white px-6 py-2 rounded-full hover:bg-secundaria transition w-full md:w-auto">
              {carregando ? 'A guardar...' : 'Guardar alterações'}
            </button>
          </form>
        </div>
      </div>

      {/* Alterar senha (apenas para contas não OAuth) */}
      {!isOAuth && (
        <div className="bg-white p-6 rounded-2xl shadow-md mt-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FiLock /> Alterar Senha</h2>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div className="flex items-center gap-2 border rounded-full px-4 py-2">
              <FiLock className="text-gray-400" />
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full outline-none" placeholder="Senha atual" required />
            </div>
            <div className="flex items-center gap-2 border rounded-full px-4 py-2">
              <FiLock className="text-gray-400" />
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full outline-none" placeholder="Nova senha" required />
            </div>
            <div className="flex items-center gap-2 border rounded-full px-4 py-2">
              <FiLock className="text-gray-400" />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full outline-none" placeholder="Confirmar nova senha" required />
            </div>
            <button type="submit" disabled={carregando} className="bg-primaria text-white px-6 py-2 rounded-full hover:bg-secundaria transition">
              {carregando ? 'A alterar...' : 'Alterar Senha'}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-4">Nota: Esta opção não está disponível para contas criadas via Google.</p>
        </div>
      )}
    </div>
  );
}