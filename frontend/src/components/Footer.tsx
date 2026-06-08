export default function Footer() {
  return (
    <footer className="bg-secundaria text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Origens do Sabor</h3>
            <p className="text-gray-300">Sabor, qualidade e tradição.</p>
            <p className="text-gray-300 mt-2">Desde 2024 servindo o melhor da gastronomia moçambicana.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contactos</h4>
            <p className="text-gray-300">📞 +258 84 842 4621</p>
            <p className="text-gray-300">📞 +258 86 015 1122</p>
            <p className="text-gray-300">✉️ geral@origensdosabor.co.mz</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Horário</h4>
            <p className="text-gray-300">Segunda a Sábado: 07:30 - 22h</p>
            <p className="text-gray-300">Domingo: 09h - 22h</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Siga-nos</h4>
            <div className="flex flex-col gap-2">
              <a href="https://www.instagram.com/origens_do_sabor_restaurante_/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-300 hover:text-white transition">
                <i className="fab fa-instagram text-xl"></i> Instagram
              </a>
              <a href="https://web.facebook.com/p/Origens-do-sabor-61572114920143" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-300 hover:text-white transition">
                <i className="fab fa-facebook text-xl"></i> Facebook
              </a>
              <a href="https://wa.me/258848424621" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-300 hover:text-white transition">
                <i className="fab fa-whatsapp text-xl"></i> WhatsApp
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
          &copy; 2026 Origens do Sabor - Todos os direitos reservados | Desenvolvido com ❤️ em Chimoio
        </div>
      </div>
    </footer>
  );
}