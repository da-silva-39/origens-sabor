import { useState } from "react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { toast } from "react-hot-toast";
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiSend,
  FiInstagram,
  FiFacebook,
  FiArrowUpRight,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { RESTAURANTE } from "../data/restaurante";

export default function Contacto() {
  useDocumentTitle("Contacto — Origens do Sabor");
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    mensagem: "",
  });
  const [enviando, setEnviando] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !formData.nome.trim() ||
      !formData.email.trim() ||
      !formData.telefone.trim() ||
      !formData.mensagem.trim()
    ) {
      toast.error("Preencha todos os campos");
      return;
    }

    setEnviando(true);
    const mensagem = [
      "Nova mensagem do site — Origens do Sabor",
      "",
      `Nome: ${formData.nome}`,
      `E-mail: ${formData.email}`,
      `Telefone: ${formData.telefone}`,
      "",
      `Mensagem: ${formData.mensagem}`,
    ].join("\n");

    window.open(
      `${RESTAURANTE.whatsapp}?text=${encodeURIComponent(mensagem)}`,
      "_blank",
      "noopener,noreferrer"
    );

    toast.success("A abrir o WhatsApp. Envie a mensagem para concluir.");
    setFormData({ nome: "", email: "", telefone: "", mensagem: "" });
    setEnviando(false);
  };

  return (
    <div>
      <section className="border-b border-carvao/10 bg-white/60">
        <div className="container-custom py-12 sm:py-16">
          <p className="eyebrow">Contacto</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">Fale connosco</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-carvao/65 sm:text-base">
            Para reservas, encomendas ou qualquer questão, use o telefone,
            WhatsApp ou o formulário. Respondemos durante o horário de
            funcionamento.
          </p>
        </div>
      </section>

      <div className="container-custom section grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-start">
        <div className="space-y-8">
          <div>
            <h2 className="font-display text-2xl">O restaurante</h2>
            <ul className="mt-5 space-y-5 text-sm">
              <li className="flex gap-4">
                <FiMapPin aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-terracota" />
                <div>
                  <p className="font-semibold text-carvao">Morada</p>
                  <p className="mt-1 leading-relaxed text-carvao/65">{RESTAURANTE.endereco}</p>
                  <a
                    href={RESTAURANTE.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 font-semibold text-terracota hover:text-secundaria"
                  >
                    Abrir no Google Maps <FiArrowUpRight aria-hidden="true" />
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <FiPhone aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-terracota" />
                <div>
                  <p className="font-semibold text-carvao">Telefone</p>
                  <a
                    href={RESTAURANTE.telefonePrincipalLink}
                    className="mt-1 block text-carvao/65 hover:text-terracota"
                  >
                    {RESTAURANTE.telefonePrincipal}
                  </a>
                  <a
                    href={RESTAURANTE.telefoneSecundarioLink}
                    className="block text-carvao/65 hover:text-terracota"
                  >
                    {RESTAURANTE.telefoneSecundario}
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <FiMail aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-terracota" />
                <div>
                  <p className="font-semibold text-carvao">E-mail</p>
                  <a
                    href={RESTAURANTE.emailLink}
                    className="mt-1 block break-all text-carvao/65 hover:text-terracota"
                  >
                    {RESTAURANTE.email}
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <FiClock aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-terracota" />
                <div>
                  <p className="font-semibold text-carvao">Horário</p>
                  {RESTAURANTE.horarios.map((horario) => (
                    <p key={horario.dias} className="mt-1 text-carvao/65">
                      {horario.dias}: {horario.horas}
                    </p>
                  ))}
                </div>
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={RESTAURANTE.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary btn-sm"
              >
                <FaWhatsapp aria-hidden="true" /> WhatsApp
              </a>
              <a
                href={RESTAURANTE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary btn-sm"
              >
                <FiInstagram aria-hidden="true" /> Instagram
              </a>
              <a
                href={RESTAURANTE.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary btn-sm"
              >
                <FiFacebook aria-hidden="true" /> Facebook
              </a>
            </div>
          </div>

          <div className="h-72 overflow-hidden border border-carvao/10">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3255.964598476873!2d33.458832595283994!3d-19.10551060266401!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x192b3552f129dbbf%3A0x7339343c13544974!2sOrigens%20do%20sabor!5e1!3m2!1spt-PT!2smz!4v1779887217117!5m2!1spt-PT!2smz"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Localização do Origens do Sabor no Google Maps"
              className="h-full w-full"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="border border-carvao/10 bg-white p-6 sm:p-8">
          <h2 className="font-display text-2xl">Enviar mensagem</h2>
          <p className="mt-2 text-sm text-carvao/60">
            Ao enviar, abrimos o WhatsApp com a sua mensagem já preenchida.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="contacto-nome" className="label">Nome *</label>
              <input
                id="contacto-nome"
                name="nome"
                className="input"
                value={formData.nome}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>
            <div>
              <label htmlFor="contacto-email" className="label">E-mail *</label>
              <input
                id="contacto-email"
                name="email"
                type="email"
                className="input"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label htmlFor="contacto-telefone" className="label">Telefone *</label>
              <input
                id="contacto-telefone"
                name="telefone"
                type="tel"
                className="input"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="84 123 4567"
                autoComplete="tel"
                required
              />
            </div>
            <div>
              <label htmlFor="contacto-mensagem" className="label">Mensagem *</label>
              <textarea
                id="contacto-mensagem"
                name="mensagem"
                className="input min-h-32 resize-y"
                rows={5}
                value={formData.mensagem}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={enviando} className="btn-primary mt-6 w-full">
            <FiSend aria-hidden="true" /> {enviando ? "A preparar..." : "Enviar pelo WhatsApp"}
          </button>
        </form>
      </div>
    </div>
  );
}
