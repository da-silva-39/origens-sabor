/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiMessageSquare, 
  FiFacebook, FiInstagram, FiSmartphone, FiCalendar, FiShoppingBag 
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function Contacto() {
  const { isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: '',
  });
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.email || !formData.telefone || !formData.mensagem) {
      toast.error('Preencha todos os campos');
      return;
    }

    setEnviando(true);

    // Número do restaurante (WhatsApp) - começa com 86
    const phoneNumber = '258860151122';

    // Montar mensagem formatada
    const message = `*Nova mensagem do site - Origens do Sabor*%0A%0A
*Nome:* ${formData.nome}%0A
*E-mail:* ${formData.email}%0A
*Telefone:* ${formData.telefone}%0A
*Mensagem:* ${formData.mensagem}%0A%0A
Enviado através do formulário de contacto.`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    toast.success('A abrir WhatsApp... Envie a mensagem para concluir.');
    setFormData({ nome: '', email: '', telefone: '', mensagem: '' });
    setEnviando(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-fundo to-white py-12">
      <div className="container-custom px-4 max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-secundaria mb-4">Contacte-nos</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Estamos disponiveis para esclarecer dúvidas e receber sugestões. 
            Preencha o formulário e será redirecionado ao nosso WhatsApp – respondemos rapidamente!
          </p>
        </div>

        {/* Call to action para novos utilizadores */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-primaria/10 to-secundaria/10 rounded-2xl p-6 mb-12 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-secundaria mb-2">Crie uma conta para fazer o seu pedido</h2>
            <p className="text-gray-700 mb-4">
              Crie uma conta gratuitamente e tenha acesso a <strong>pedidos online, reserva de mesas, histórico de pedidos, recibos digitais</strong> e muito mais!
            </p>
            <Link 
              to="/registro" 
              className="inline-flex items-center gap-2 bg-primaria text-white px-6 py-2 rounded-full hover:bg-secundaria transition transform hover:scale-105"
            >
              <FiSmartphone /> Criar Conta Grátis
            </Link>
          </div>
        )}

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Coluna da esquerda: informações e mapa */}
          <div className="space-y-8">
            {/* Mapa e morada */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-secundaria mb-4 flex items-center gap-2">
                  <FiMapPin className="text-primaria" /> Onde Estamos
                </h2>
                <p className="text-gray-700 mb-4">
                  Rua Cidade de Lichinga, em frente ao Tribunal Judicial da cidade de Chimoio, Moçambique
                </p>
              </div>
              <div className="h-64 w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3255.964598476873!2d33.458832595283994!3d-19.10551060266401!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x192b3552f129dbbf%3A0x7339343c13544974!2sOrigens%20do%20sabor!5e1!3m2!1spt-PT!2smz!4v1779887217117!5m2!1spt-PT!2smz"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Mapa Origens do Sabor"
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>

            {/* Contactos directos */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
              <h2 className="text-2xl font-semibold text-secundaria mb-6 flex items-center gap-2">
                <FiPhone className="text-primaria" /> Contactos Directos
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <FiPhone className="text-primaria text-xl mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">Telefone(84) / WhatsApp(86)</p>
                    <p className="text-gray-600">+258 84 842 4621</p>
                    <p className="text-gray-600">+258 86 015 1122</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <FiMail className="text-primaria text-xl mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">E-mail</p>
                    <p className="text-gray-600">origensdosabor@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <FiClock className="text-primaria text-xl mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">Horário de Funcionamento</p>
                    <p className="text-gray-600">Segunda a Sábado: 07:30 – 22h</p>
                    <p className="text-gray-600">Domingo: 09h – 22h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Redes sociais */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
              <h2 className="text-2xl font-semibold text-secundaria mb-6 flex items-center gap-2">
                <FiMessageSquare className="text-primaria" /> Siga-nos nas Redes
              </h2>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://www.instagram.com/origens_do_sabor_restaurante_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90 transition"
                >
                  <FiInstagram size={20} /> Instagram
                </a>
                <a
                  href="https://web.facebook.com/p/Origens-do-sabor-61572114920143"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white bg-[#1877F2] hover:bg-[#0E5A9E] transition"
                >
                  <FiFacebook size={20} /> Facebook
                </a>
                <a
                  href="https://wa.me/258860151122"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white bg-[#25D366] hover:bg-[#128C7E] transition"
                >
                  <FaWhatsapp size={20} /> WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Coluna da direita: formulário */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <h2 className="text-2xl font-semibold text-secundaria mb-6 flex items-center gap-2">
              <FiSend className="text-primaria" /> Envie-nos uma Mensagem
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Nome completo *</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primaria focus:border-transparent"
                  placeholder="Seu nome"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">E-mail *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primaria focus:border-transparent"
                  placeholder="exemplo@dominio.com"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Telefone (com Whatsapp) *</label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primaria focus:border-transparent"
                  placeholder="+258 84 123 4567"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Mensagem *</label>
                <textarea
                  name="mensagem"
                  value={formData.mensagem}
                  onChange={handleChange}
                  rows={5}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primaria focus:border-transparent"
                  placeholder="Escreva aqui a sua mensagem..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-primaria hover:bg-secundaria text-white font-semibold py-3 rounded-xl transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              >
                <FaWhatsapp size={22} />
                {enviando ? 'A processar...' : 'Enviar via WhatsApp'}
              </button>
            </form>
            <p className="text-gray-500 text-xs text-center mt-4">
              Ao clicar, será aberto o WhatsApp com a mensagem pré‑preenchida. Basta enviar.
            </p>

            {/* Links rápidos para o sistema */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-secundaria mb-3 flex items-center gap-2">
                <FiSmartphone /> Descubra tudo o que pode fazer no nosso sistema
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/cardapio"
                  className="flex items-center gap-2 text-sm bg-primaria/10 text-primaria px-3 py-2 rounded-xl hover:bg-primaria/20 transition"
                >
                  <FiShoppingBag /> Ver Cardápio
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-sm bg-primaria/10 text-primaria px-3 py-2 rounded-xl hover:bg-primaria/20 transition"
                >
                  <FiCalendar /> Reservar Mesa
                </Link>
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center gap-2 text-sm bg-primaria/10 text-primaria px-3 py-2 rounded-xl hover:bg-primaria/20 transition"
                    >
                      Entrar
                    </Link>
                    <Link
                      to="/registro"
                      className="flex items-center gap-2 text-sm bg-primaria/10 text-primaria px-3 py-2 rounded-xl hover:bg-primaria/20 transition"
                    >
                     Criar Conta
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/minhas-reservas"
                      className="flex items-center gap-2 text-sm bg-primaria/10 text-primaria px-3 py-2 rounded-xl hover:bg-primaria/20 transition"
                    >
                      📋 Minhas Reservas
                    </Link>
                    <Link
                      to="/perfil"
                      className="flex items-center gap-2 text-sm bg-primaria/10 text-primaria px-3 py-2 rounded-xl hover:bg-primaria/20 transition"
                    >
                      👤 Meu Perfil
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}