/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const slides = [
    { src: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?w=1200", alt: "Ambiente", title: "Bem-vindo ao Origens do Sabor", desc: "Tradição e inovação na sua mesa." },
    { src: "/pizza cliente.jpg", alt: "Pratos", title: "Sabores que encantam", desc: "Ingredientes frescos e receitas únicas." },
    { src: "/prato apresentacao 2.jpg", alt: "Chef", title: "Culinária de autor", desc: "Preparado com muito carinho." },
    { src: "/contacto.jpg", alt: "Momentos", title: "Experiência inesquecível", desc: "Venha viver momentos especiais." },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  const handleProtectedClick = (path: string) => {
    if (!isAuthenticated) navigate("/login");
    else navigate(path);
  };

  const handleManualClick = () => {
    navigate("/manual");
  };

  return (
    <>
      <main>
        {/* Hero Carrossel */}
        <div className="relative h-[600px] md:h-[700px] overflow-hidden">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                idx === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="relative w-full h-full">
                <img src={slide.src} alt={slide.alt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40" />
              </div>
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-4">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in-up">{slide.title}</h1>
                <p className="text-xl md:text-2xl mb-8 animate-fade-in-up animation-delay-200">{slide.desc}</p>
                <button
                  onClick={() => handleProtectedClick("/cardapio")}
                  className="bg-primaria hover:bg-secundaria px-8 py-3 rounded-full text-lg font-semibold transition transform hover:scale-105 animate-fade-in-up animation-delay-400"
                >
                  Ver Cardápio
                </button>
              </div>
            </div>
          ))}
          <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentSlide ? "bg-primaria scale-125" : "bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Banner de boas‑vindas para utilizadores autenticados */}
        {isAuthenticated && (
          <div className="bg-gradient-to-r from-primaria to-secundaria text-white py-6">
            <div className="container-custom text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Bem‑vindo de volta, {user?.nome?.split(' ')[0]}! 👋</h2>
              <p className="text-lg mb-4">Aproveite ao máximo o nosso sistema:</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => navigate("/cardapio")} className="bg-white text-primaria px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition">🍽️ Explorar Cardápio</button>
                <button onClick={() => navigate("/reservar-mesa")} className="bg-white text-primaria px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition">📅 Reservar Mesa</button>
                <button onClick={() => navigate("/minhas-reservas")} className="bg-white text-primaria px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition">📋 Minhas Reservas</button>
                <button onClick={() => navigate("/perfil")} className="bg-white text-primaria px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition">👤 Meu Perfil</button>
              </div>
            </div>
          </div>
        )}

        {/* Chamada atrativa para utilizadores NÃO autenticados */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 py-12 border-b border-amber-200">
            <div className="container-custom text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-secundaria mb-4">🍽️ Faça parte da nossa família!</h2>
              <p className="text-gray-700 text-lg max-w-2xl mx-auto mb-8">
                Crie uma conta gratuita e tenha acesso a um mundo de vantagens: faça pedidos online, 
                reserve a sua mesa com apenas alguns cliques, guarde os seus pratos favoritos e muito mais.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => navigate("/registro")}
                  className="bg-primaria text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-secundaria transition transform hover:scale-105 shadow-md"
                >
                  📝 Criar Conta Grátis
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="bg-white border-2 border-primaria text-primaria px-8 py-3 rounded-full text-lg font-semibold hover:bg-primaria/10 transition"
                >
                  🔐 Já tenho conta
                </button>
              </div>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <p className="text-gray-600 text-sm">Pedidos online rápidos e seguros</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <p className="text-gray-600 text-sm">Reserva de mesas com confirmação por e‑mail</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <p className="text-gray-600 text-sm">Acompanhamento dos seus pedidos</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        <section className="py-16 bg-fundo">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div><div className="text-4xl font-bold text-primaria">2+</div><div>Anos de experiência</div></div>
              <div><div className="text-4xl font-bold text-primaria">50+</div><div>Pratos no cardápio</div></div>
              <div><div className="text-4xl font-bold text-primaria">900+</div><div>Clientes satisfeitos</div></div>
              <div><div className="text-4xl font-bold text-primaria">10+</div><div>Bairros atendidos</div></div>
            </div>
          </div>
        </section>

        {/* Como usar o sistema */}
        <section id="como-usar" className="py-16 bg-white">
          <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-secundaria mb-12">Como usar o sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center p-6 rounded-2xl hover:shadow-lg transition group">
                <div className="text-5xl mb-4 bg-primaria/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto group-hover:bg-primaria/20 transition">1</div>
                <h3 className="text-xl font-semibold mb-2">Crie sua conta</h3>
                <p className="text-gray-600">Registe-se com e-mail ou utilize a sua conta Google.</p>
              </div>
              <div className="text-center p-6 rounded-2xl hover:shadow-lg transition group">
                <div className="text-5xl mb-4 bg-primaria/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto group-hover:bg-primaria/20 transition">2</div>
                <h3 className="text-xl font-semibold mb-2">Explore o cardápio</h3>
                <p className="text-gray-600">Adicione os pratos ao carrinho e personalize seu pedido.</p>
              </div>
              <div className="text-center p-6 rounded-2xl hover:shadow-lg transition group">
                <div className="text-5xl mb-4 bg-primaria/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto group-hover:bg-primaria/20 transition">3</div>
                <h3 className="text-xl font-semibold mb-2">Finalize e receba</h3>
                <p className="text-gray-600">Escolha o bairro, calcule o frete e aguarde a entrega.</p>
              </div>
              <div className="text-center p-6 rounded-2xl hover:shadow-lg transition group">
                <div className="text-5xl mb-4 bg-primaria/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto group-hover:bg-primaria/20 transition">4</div>
                <h3 className="text-xl font-semibold mb-2">Reserve sua mesa</h3>
                <p className="text-gray-600">Escolha data, hora e número de pessoas. Receba um recibo em PDF.</p>
              </div>
            </div>
            <div className="text-center mt-8">
              <button onClick={handleManualClick} className="bg-primaria text-white px-6 py-2 rounded-full hover:bg-secundaria transition transform hover:scale-105 inline-flex items-center gap-2">
                📖 Manual do Utilizador
              </button>
            </div>
          </div>
        </section>

        {/* Porquê escolher-nos? */}
        <section className="py-16 bg-fundo">
          <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-secundaria mb-12">Porquê escolher-nos?</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { icon: "🍳", title: "Culinária Diversificada", text: "Sabores que encantam, do tradicional ao contemporâneo." },
                { icon: "🍷", title: "Ambiente Acolhedor", text: "Espaço familiar, ideal para momentos especiais." },
                { icon: "🛵", title: "Delivery Rápido", text: "Receba o seu pedido em casa com segurança." },
                { icon: "⭐", title: "Tradição e Sabor", text: "Receitas que respeitam as origens, com toque moderno." },
              ].map((feature, i) => (
                <div key={i} className="text-center p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-2 duration-300 bg-white">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pratos em destaque */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-secundaria mb-12">Pratos em Destaque</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { img: "/pizza.jpg", nome: "Pizza Margherita", desc: "Molho de tomate, mussarela, manjericão.", preco: 450 },
                { img: "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?w=400", nome: "Hambúrguer Artesanal", desc: "180g carne, queijo cheddar, alface, tomate.", preco: 320 },
                { img: "/Imagens Corretas/1-4 frango grelhado.jpg", nome: "Frango Grelhado", desc: "¼ frango com batata e arroz.", preco: 400 },
              ].map((prato, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition transform hover:-translate-y-2 duration-300">
                  <div className="relative h-56 overflow-hidden">
                    <img src={prato.img} alt={prato.nome} className="w-full h-full object-cover transition hover:scale-105 duration-500" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{prato.nome}</h3>
                    <p className="text-gray-600 mb-4">{prato.desc}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primaria">{prato.preco} MT</span>
                      <button onClick={() => handleProtectedClick("/cardapio")} className="bg-primaria text-white px-4 py-2 rounded-full hover:bg-secundaria transition">Adicionar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <button onClick={() => handleProtectedClick("/cardapio")} className="bg-secundaria text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-primaria transition transform hover:scale-105">Ver Cardápio Completo</button>
            </div>
          </div>
        </section>

        {/* Sobre o restaurante */}
        <section className="py-16 bg-fundo">
          <div className="container-custom grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-secundaria mb-6">Conheça a nossa história</h2>
              <p className="text-gray-700 text-lg mb-6">Há mais de 2 anos, o Origens do Sabor nasceu com o propósito de trazer à mesa o melhor da gastronomia moçambicana.</p>
              <p className="text-gray-700 text-lg mb-6">Localizado no coração de Chimoio, somos referência em qualidade, atendimento e criatividade. Cada prato é preparado com ingredientes frescos e muito carinho.</p>
              <p className="text-gray-700 text-lg">Venha viver uma experiência única, onde o sabor e a tradição se encontram.</p>
            </div>
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
              <img src="/cliente.jpg" alt="Interior do restaurante" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-secundaria mb-12">O que dizem os nossos clientes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-2">
                <div className="text-4xl text-primaria mb-4">“</div>
                <p className="text-gray-700 mb-4">Comida deliciosa e atendimento impecável. O ambiente é muito agradável!</p>
                <div className="font-semibold">— Ana Maria</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-2">
                <div className="text-4xl text-primaria mb-4">“</div>
                <p className="text-gray-700 mb-4">O melhor restaurante de Chimoio! Peço delivery sempre e chega rápido.</p>
                <div className="font-semibold">— Carlos J.</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-2">
                <div className="text-4xl text-primaria mb-4">“</div>
                <p className="text-gray-700 mb-4">Os hambúrgueres são maravilhosos, e o preço justo. Recomendo!</p>
                <div className="font-semibold">— Fernanda L.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Contacto e localização */}
        <section className="py-16 bg-fundo">
          <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-secundaria mb-12">Contacto & Localização</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">📞 Telefone / WhatsApp</h3>
                  <p className="text-gray-700">+258 84 842 4621</p>
                  <p className="text-gray-700">+258 86 015 1122</p>
                  <a href="https://wa.me/258860151122" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-2 bg-[#25D366] text-white px-4 py-2 rounded-full hover:bg-[#128C7E] transition">💬 Falar no WhatsApp</a>
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">✉️ E-mail</h3>
                  <p className="text-gray-700">origensdosabor@gmail.com</p>
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">📍 Endereço</h3>
                  <p className="text-gray-700">Rua Cidade de Lichinga, em frente ao Tribunal Judicial,<br />Chimoio, Moçambique</p>
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">🕒 Horário</h3>
                  <p className="text-gray-700">Segunda a Sábado: 07:30 - 22h</p>
                  <p className="text-gray-700">Domingo: 09h - 22h</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">📱 Siga-nos</h3>
                  <div className="flex flex-wrap gap-4">
                    <a href="https://www.instagram.com/origens_do_sabor_restaurante_/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full text-white bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90 transition">📷 Instagram</a>
                    <a href="https://web.facebook.com/p/Origens-do-sabor-61572114920143" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full text-white bg-[#1877F2] hover:bg-[#0E5A9E] transition">📘 Facebook</a>
                    <a href="https://wa.me/258860151122" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full text-white bg-[#25D366] hover:bg-[#128C7E] transition">💬 WhatsApp</a>
                  </div>
                </div>
              </div>
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3255.964598476873!2d33.458832595283994!3d-19.10551060266401!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x192b3552f129dbbf%3A0x7339343c13544974!2sOrigens%20do%20sabor!5e1!3m2!1spt-PT!2smz!4v1779887217117!5m2!1spt-PT!2smz" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" className="absolute inset-0 w-full h-full"></iframe>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}