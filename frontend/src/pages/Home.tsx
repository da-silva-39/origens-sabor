"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/navbar.tsx";
import { Link } from "react-router-dom";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { src: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?w=1200", alt: "Ambiente", title: "Bem-vindo ao Origens do Sabor", desc: "Tradição e inovação na sua mesa." },
    { src: "https://images.pexels.com/photos/2147485/pexels-photo-2147485.jpeg?w=1200", alt: "Pratos", title: "Sabores que encantam", desc: "Ingredientes frescos e receitas únicas." },
    { src: "https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?w=1200", alt: "Chef", title: "Culinária de autor", desc: "Preparado com muito carinho." },
    { src: "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?w=1200", alt: "Momentos", title: "Experiência inesquecível", desc: "Venha viver momentos especiais." },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />
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
                <Link
                  to="/cardapio"
                  className="bg-primaria hover:bg-secundaria px-8 py-3 rounded-full text-lg font-semibold transition animate-fade-in-up animation-delay-400"
                >
                  Ver Cardápio
                </Link>
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

        {/* Estatísticas */}
        <section className="py-16 bg-fundo">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div><div className="text-4xl font-bold text-primaria">10+</div><div>Anos de experiência</div></div>
              <div><div className="text-4xl font-bold text-primaria">50+</div><div>Pratos no cardápio</div></div>
              <div><div className="text-4xl font-bold text-primaria">5000+</div><div>Clientes satisfeitos</div></div>
              <div><div className="text-4xl font-bold text-primaria">10</div><div>Bairros atendidos</div></div>
            </div>
          </div>
        </section>

        {/* Características */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-secundaria mb-12">Porquê escolher-nos?</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {["🍳 Culinária Diversificada", "🍷 Ambiente Acolhedor", "🛵 Delivery Rápido", "⭐ Tradição e Sabor"].map((item, i) => (
                <div key={i} className="text-center p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
                  <div className="text-5xl mb-4">{item.split(" ")[0]}</div>
                  <h3 className="text-xl font-semibold mb-2">{item.substring(2)}</h3>
                  <p className="text-gray-600">Sabores que encantam, do tradicional ao contemporâneo.</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pratos em destaque */}
        <section className="py-16 bg-fundo">
          <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-secundaria mb-12">Pratos em Destaque</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition">
                <div className="relative h-56">
                  <img src="https://images.pexels.com/photos/2147485/pexels-photo-2147485.jpeg?w=400" alt="Pizza" className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Pizza Margherita</h3>
                  <p className="text-gray-600 mb-4">Molho de tomate, mussarela, manjericão.</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primaria">450 MT</span>
                    <button className="bg-primaria text-white px-4 py-2 rounded-full hover:bg-secundaria transition">Adicionar</button>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition">
                <div className="relative h-56">
                  <img src="https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?w=400" alt="Hambúrguer" className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Hambúrguer Artesanal</h3>
                  <p className="text-gray-600 mb-4">180g carne, queijo cheddar, alface, tomate.</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primaria">320 MT</span>
                    <button className="bg-primaria text-white px-4 py-2 rounded-full hover:bg-secundaria transition">Adicionar</button>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition">
                <div className="relative h-56">
                  <img src="https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?w=400" alt="Frango" className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Frango Grelhado</h3>
                  <p className="text-gray-600 mb-4">¼ frango com batata e arroz.</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primaria">400 MT</span>
                    <button className="bg-primaria text-white px-4 py-2 rounded-full hover:bg-secundaria transition">Adicionar</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center mt-12">
              <Link to="/cardapio" className="bg-secundaria text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-primaria transition">Ver Cardápio Completo</Link>
            </div>
          </div>
        </section>

        {/* Sobre o restaurante */}
        <section className="py-16 bg-white">
          <div className="container-custom grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-secundaria mb-6">Conheça a nossa história</h2>
              <p className="text-gray-700 text-lg mb-6">Há mais de 10 anos, o Origens do Sabor nasceu com o propósito de trazer à mesa o melhor da gastronomia moçambicana e internacional.</p>
              <p className="text-gray-700 text-lg mb-6">Localizado no coração de Chimoio, somos referência em qualidade, atendimento e criatividade. Cada prato é preparado com ingredientes frescos e muito carinho.</p>
              <p className="text-gray-700 text-lg">Venha viver uma experiência única, onde o sabor e a tradição se encontram.</p>
            </div>
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
              <img src="https://images.pexels.com/photos/258105/pexels-photo-258105.jpeg?w=600" alt="Interior" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section className="py-16 bg-fundo">
          <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-secundaria mb-12">O que dizem os nossos clientes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg"><div className="text-4xl text-primaria mb-4">“</div><p className="text-gray-700 mb-4">Comida deliciosa e atendimento impecável. O ambiente é muito agradável!</p><div className="font-semibold">— Ana Maria</div></div>
              <div className="bg-white p-6 rounded-2xl shadow-lg"><div className="text-4xl text-primaria mb-4">“</div><p className="text-gray-700 mb-4">O melhor restaurante de Chimoio! Peço delivery sempre e chega rápido.</p><div className="font-semibold">— Carlos J.</div></div>
              <div className="bg-white p-6 rounded-2xl shadow-lg"><div className="text-4xl text-primaria mb-4">“</div><p className="text-gray-700 mb-4">Os hambúrgueres são maravilhosos, e o preço justo. Recomendo!</p><div className="font-semibold">— Fernanda L.</div></div>
            </div>
          </div>
        </section>

        {/* Contacto e localização */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-secundaria mb-12">Contacto & Localização</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <div className="mb-6"><h3 className="text-xl font-semibold mb-2">📞 Telefone / WhatsApp</h3><p className="text-gray-700">+258 84 842 4621</p><p className="text-gray-700">+258 86 015 1122</p></div>
                <div className="mb-6"><h3 className="text-xl font-semibold mb-2">✉️ E-mail</h3><p className="text-gray-700">geral@origensdosabor.co.mz</p></div>
                <div className="mb-6"><h3 className="text-xl font-semibold mb-2">📍 Endereço</h3><p className="text-gray-700">Rua Cidade de Lichinga, em frente ao Tribunal Judicial,<br />Chimoio, Moçambique</p></div>
                <div className="mb-6"><h3 className="text-xl font-semibold mb-2">🕒 Horário</h3><p className="text-gray-700">Segunda a Sábado: 07:30 - 22h</p><p className="text-gray-700">Domingo: 09h - 22h</p></div>
                <div><h3 className="text-xl font-semibold mb-2">📱 Siga-nos</h3><div className="flex gap-4"><a href="#" className="text-primaria hover:text-secundaria">Instagram</a><a href="#" className="text-primaria hover:text-secundaria">Facebook</a><a href="#" className="text-primaria hover:text-secundaria">WhatsApp</a></div></div>
              </div>
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3255.964598476873!2d33.458832595283994!3d-19.10551060266401!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x192b3552f129dbbf%3A0x7339343c13544974!2sOrigens%20do%20sabor!5e1!3m2!1spt-PT!2smz!4v1779887217117!5m2!1spt-PT!2smz" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" className="absolute inset-0 w-full h-full"></iframe>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-secundaria text-white py-8">
        <div className="container-custom text-center">
          <p>&copy; 2026 Origens do Sabor - Todos os direitos reservados</p>
          <p className="mt-2 text-sm">Sabor, qualidade e tradição.</p>
        </div>
      </footer>
    </>
  );
}