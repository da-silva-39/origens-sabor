import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebook, FaWhatsapp, FaArrowUp } from 'react-icons/fa';
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gradient-to-br from-secundaria to-primaria text-white pt-16 pb-6">
      <div className="container-custom px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Logo e descrição */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Origens do Sabor</h2>
            <p className="text-gray-200 leading-relaxed">
              Sabor, qualidade e tradição. Desde 2024 servindo o melhor da gastronomia moçambicana com todo o carinho.
            </p>
            <div className="flex gap-4 text-gray-300">
              <a
                href="https://www.instagram.com/origens_do_sabor_restaurante_/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-transform hover:scale-110 inline-block"
                aria-label="Instagram"
              >
                <FaInstagram size={24} />
              </a>
              <a
                href="https://web.facebook.com/p/Origens-do-sabor-61572114920143"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-transform hover:scale-110 inline-block"
                aria-label="Facebook"
              >
                <FaFacebook size={24} />
              </a>
              <a
                href="https://wa.me/258848424621"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-transform hover:scale-110 inline-block"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={24} />
              </a>
            </div>
          </div>

          {/* Links rápidos */}
          <div>
            <h3 className="text-xl font-semibold mb-4 relative inline-block after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-0.5 after:bg-primaria">
              Navegação
            </h3>
            <ul className="space-y-2 text-gray-200">
              <li>
                <Link to="/cardapio" className="hover:text-white transition-colors flex items-center gap-2">
                  🍽️ Cardápio
                </Link>
              </li>
              <li>
                <Link to="/reservar-mesa" className="hover:text-white transition-colors flex items-center gap-2">
                  📅 Reservar Mesa
                </Link>
              </li>
              <li>
                <Link to="/minhas-reservas" className="hover:text-white transition-colors flex items-center gap-2">
                  📋 Minhas Reservas
                </Link>
              </li>
              <li>
                <Link to="/perfil" className="hover:text-white transition-colors flex items-center gap-2">
                  👤 Meu Perfil
                </Link>
              </li>
            </ul>
          </div>

          {/* Contactos */}
          <div>
            <h3 className="text-xl font-semibold mb-4 relative inline-block after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-0.5 after:bg-primaria">
              Contactos
            </h3>
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-center gap-3">
                <FiPhone className="flex-shrink-0" /> 
                <span>+258 84 842 4621</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="flex-shrink-0" /> 
                <span>+258 86 015 1122</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="flex-shrink-0" /> 
                <span>origensdosabor@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMapPin className="flex-shrink-0" /> 
                <span>Rua Cidade de Lichinga, em frente ao Tribunal Judicial, Chimoio</span>
              </li>
            </ul>
          </div>

          {/* Horário e local */}
          <div>
            <h3 className="text-xl font-semibold mb-4 relative inline-block after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-0.5 after:bg-primaria">
              Horário
            </h3>
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-center gap-3">
                <FiClock className="flex-shrink-0" />
                <div>
                  <p>Segunda a Sábado: 07:30 - 22h</p>
                  <p>Domingo: 09h - 22h</p>
                </div>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-medium mb-2">📍 Como chegar</h4>
              <a
                href="https://maps.google.com/?q=Origens+do+Sabor+Chimoio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition text-sm"
              >
                Ver no Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Linha divisória e direitos */}
        <div className="border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-300 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Origens do Sabor – Todos os direitos reservados.
          </p>
          <p className="text-center">
            Desenvolvido com ❤️ em Chimoio
          </p>
        </div>
      </div>

      {/* Botão Voltar ao Topo (apenas mobile/desktop flutuante) */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 bg-primaria hover:bg-secundaria text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-40 focus:outline-none"
        aria-label="Voltar ao topo"
      >
        <FaArrowUp size={20} />
      </button>
    </footer>
  );
}