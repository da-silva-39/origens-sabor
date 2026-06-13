import { useState } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiMessageSquare, FiFacebook, FiInstagram } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function Contacto() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    mensagem: '',
  });
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.email || !formData.mensagem) {
      toast.error('Preencha todos os campos');
      return;
    }

    setEnviando(true);

    // Número do restaurante (começa com 86)
    const phoneNumber = '258860151122'; // apenas números, sem + ou espaços

    // Construir a mensagem
    const message = `*Nova mensagem do site - Origens do Sabor*%0A%0A
*Nome:* ${formData.nome}%0A
*E-mail:* ${formData.email}%0A
*Mensagem:* ${formData.mensagem}%0A%0A
Enviado através do formulário de contacto.`;

    // Criar link do WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    // Abrir em nova aba
    window.open(whatsappUrl, '_blank');

    toast.success('A abrir WhatsApp... Envie a mensagem para concluir.');
    setFormData({ nome: '', email: '', mensagem: '' });
    setEnviando(false);
  };

  return (
    <div className="min-h-screen bg-fundo py-12">
      <div className="container-custom px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-secundaria mb-4">Fale Connosco</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Estamos aqui para ouvir as suas sugestões, dúvidas ou elogios. Preencha o formulário e será redirecionado ao WhatsApp do restaurante.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Informações de contacto (mesmo código anterior) */}
          <div className="space-y-8">
            {/* ... mantenha as secções de mapa, contactos e redes sociais como já estavam ... */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
              <h2 className="text-2xl font-semibold text-secundaria mb-6 flex items-center gap-2">
                <FiMapPin className="text-primaria" /> Onde Estamos
              </h2>
              <p className="text-gray-700 mb-4">
                Rua Cidade de Lichinga, em frente ao Tribunal Judicial da cidade de Chimoio, Moçambique
              </p>
              <div className="rounded-xl overflow-hidden h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3255.964598476873!2d33.458832595283994!3d-19.10551060266401!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x192b3552f129dbbf%3A0x7339343c13544974!2sOrigens%20do%20sabor!5e1!3m2!1spt-PT!2smz!4v1779887217117!5m2!1spt-PT!2smz"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Mapa Origens do Sabor"
                ></iframe>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
              <h2 className="text-2xl font-semibold text-secundaria mb-6 flex items-center gap-2">
                <FiPhone className="text-primaria" /> Contactos Diretos
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-gray-700">
                  <FiPhone className="text-primaria text-xl" />
                  <div>
                    <p className="font-medium">Telefone / WhatsApp</p>
                    <p>+258 84 842 4621</p>
                    <p>+258 86 015 1122</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-700">
                  <FiMail className="text-primaria text-xl" />
                  <div>
                    <p className="font-medium">E-mail</p>
                    <p>origensdosabor@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-700">
                  <FiClock className="text-primaria text-xl" />
                  <div>
                    <p className="font-medium">Horário de Funcionamento</p>
                    <p>Segunda a Sábado: 07:30 – 22h</p>
                    <p>Domingo: 09h – 22h</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
              <h2 className="text-2xl font-semibold text-secundaria mb-6 flex items-center gap-2">
                <FiMessageSquare className="text-primaria" /> Redes Sociais
              </h2>
              <div className="flex flex-wrap gap-4">
                <a href="https://www.instagram.com/origens_do_sabor_restaurante_/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white px-4 py-2 rounded-full hover:opacity-90 transition">
                  <FiInstagram size={20} /> Instagram
                </a>
                <a href="https://web.facebook.com/p/Origens-do-sabor-61572114920143" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#1877F2] text-white px-4 py-2 rounded-full hover:bg-[#0E5A9E] transition">
                  <FiFacebook size={20} /> Facebook
                </a>
                <a href="https://wa.me/258860151122" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-full hover:bg-[#128C7E] transition">
                  <FaWhatsapp size={20} /> WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Formulário de contacto (agora com WhatsApp) */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <h2 className="text-2xl font-semibold text-secundaria mb-6 flex items-center gap-2">
              <FiSend className="text-primaria" /> Envie-nos uma Mensagem
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Nome completo</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primaria"
                  placeholder="Seu nome"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primaria"
                  placeholder="exemplo@dominio.com"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Mensagem</label>
                <textarea
                  name="mensagem"
                  value={formData.mensagem}
                  onChange={handleChange}
                  rows={5}
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primaria"
                  placeholder="Escreva aqui a sua mensagem..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-primaria hover:bg-secundaria text-white font-semibold py-3 rounded-xl transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FaWhatsapp size={20} />
                {enviando ? 'A processar...' : 'Enviar via WhatsApp'}
              </button>
            </form>
            <p className="text-gray-500 text-xs text-center mt-4">
              Ao clicar, será aberto o WhatsApp com a mensagem pré‑preenchida. Basta enviar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}