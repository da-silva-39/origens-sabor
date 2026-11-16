/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ContaHeader from '../components/ContaHeader';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  FiCalendar,
  FiCamera,
  FiLock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiUser,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function Perfil() {
  useDocumentTitle('O meu perfil — Origens do Sabor');
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

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primaria" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const isOAuth = user?.isOAuth === true;
  const iniciais =
    user?.nome
      ?.split(' ')
      .filter(Boolean)
      .map((parte) => parte[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'OS';

  return (
    <div className="bg-fundo">
      <ContaHeader
        eyebrow="A sua conta"
        titulo="Os meus dados"
        descricao="Mantenha o seu perfil atualizado para receber as encomendas e reservas com os dados corretos."
      />

      <div className="container-custom max-w-5xl py-10">
        {mensagem && (
          <div className="mb-6 border border-oliva/30 bg-oliva/10 p-4 text-sm text-secundaria">
            {mensagem}
          </div>
        )}
        {erro && (
          <div className="mb-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          <div className="border border-carvao/10 bg-white p-6 text-center">
            <h2 className="flex items-center justify-center gap-2 font-display text-xl text-secundaria">
              <FiCamera aria-hidden="true" className="text-terracota" /> Fotografia
            </h2>

            <div className="mt-5 flex justify-center">
              {fotoPreview ? (
                <img
                  src={fotoPreview}
                  alt="Fotografia de perfil"
                  className="h-32 w-32 rounded-full border border-carvao/10 object-cover ring-4 ring-areia/60"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-areia/60 font-display text-4xl text-secundaria ring-4 ring-areia/40">
                  {iniciais}
                </div>
              )}
            </div>

            <form onSubmit={handleUploadFoto} className="mt-6 space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleFotoChange}
                aria-label="Escolher fotografia de perfil"
                className="w-full text-xs text-carvao/55 file:mr-3 file:border-0 file:bg-areia/60 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-secundaria hover:file:bg-areia"
              />
              {fotoFile && (
                <button
                  type="submit"
                  disabled={carregando}
                  className="btn-primary btn-sm w-full"
                >
                  {carregando ? 'A enviar...' : 'Guardar fotografia'}
                </button>
              )}
            </form>

            <p className="mt-4 text-xs leading-relaxed text-carvao/45">
              Use uma imagem nítida. Formatos JPG, PNG ou WebP.
            </p>
          </div>

          <div className="border border-carvao/10 bg-white p-6 sm:p-7">
            <h2 className="flex items-center gap-2 font-display text-xl text-secundaria">
              <FiUser aria-hidden="true" className="text-terracota" /> Dados pessoais
            </h2>
            <p className="mt-1 text-xs text-carvao/45">
              Estes dados são usados nas suas encomendas e reservas.
            </p>

            <form onSubmit={handleUpdateProfile} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="perfil-nome" className="label">
                    Nome completo
                  </label>
                  <div className="relative">
                    <FiUser
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-carvao/35"
                    />
                    <input
                      id="perfil-nome"
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="input pl-10"
                      placeholder="Nome completo"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="perfil-email" className="label">
                    E-mail
                  </label>
                  <div className="relative">
                    <FiMail
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-carvao/35"
                    />
                    <input
                      id="perfil-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input pl-10"
                      placeholder="E-mail"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="perfil-telefone" className="label">
                    Telefone
                  </label>
                  <div className="relative">
                    <FiPhone
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-carvao/35"
                    />
                    <input
                      id="perfil-telefone"
                      type="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="input pl-10"
                      placeholder="+258 ..."
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="perfil-endereco" className="label">
                    Endereço de entrega
                  </label>
                  <div className="relative">
                    <FiMapPin
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-carvao/35"
                    />
                    <input
                      id="perfil-endereco"
                      type="text"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      className="input pl-10"
                      placeholder="Rua, bairro, referência"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="perfil-nascimento" className="label">
                    Data de nascimento
                  </label>
                  <div className="relative">
                    <FiCalendar
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-carvao/35"
                    />
                    <input
                      id="perfil-nascimento"
                      type="date"
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={carregando} className="btn-primary">
                  {carregando ? 'A guardar...' : 'Guardar alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {!isOAuth && (
          <div className="mt-6 border border-carvao/10 bg-white p-6 sm:p-7">
            <h2 className="flex items-center gap-2 font-display text-xl text-secundaria">
              <FiLock aria-hidden="true" className="text-terracota" /> Segurança
            </h2>
            <p className="mt-1 text-xs text-carvao/45">
              Altere a palavra-passe da sua conta com regularidade.
            </p>

            <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="senha-atual" className="label">
                    Palavra-passe atual
                  </label>
                  <input
                    id="senha-atual"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="senha-nova" className="label">
                    Nova palavra-passe
                  </label>
                  <input
                    id="senha-nova"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="senha-confirmar" className="label">
                    Confirmar nova
                  </label>
                  <input
                    id="senha-confirmar"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={carregando} className="btn-secondary">
                  {carregando ? 'A alterar...' : 'Alterar palavra-passe'}
                </button>
              </div>
            </form>

            <p className="mt-4 text-xs text-carvao/45">
              Esta opção não está disponível para contas criadas com o Google.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
