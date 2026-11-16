export const RESTAURANTE = {
  nome: "Origens do Sabor",
  descricao: "Restaurante & Bar",
  telefonePrincipal: "+258 84 842 4621",
  telefoneSecundario: "+258 86 015 1122",
  telefonePrincipalLink: "tel:+258848424621",
  telefoneSecundarioLink: "tel:+258860151122",
  whatsapp: "https://wa.me/258860151122",
  whatsappReservas:
    "https://wa.me/258860151122?text=" +
    encodeURIComponent("Olá, gostaria de falar com o Origens do Sabor sobre uma reserva."),
  email: "origensdosabor@gmail.com",
  emailLink: "mailto:origensdosabor@gmail.com",
  endereco:
    "Rua Cidade de Lichinga, em frente ao Tribunal Judicial, Chimoio, Moçambique",
  enderecoCurto: "Rua Cidade de Lichinga, Chimoio",
  mapsUrl: "https://maps.google.com/?q=Origens+do+Sabor+Chimoio",
  instagram:
    "https://www.instagram.com/origens_do_sabor_restaurante_/",
  facebook: "https://web.facebook.com/p/Origens-do-sabor-61572114920143",
  horarios: [
    { dias: "Segunda a Sábado", horas: "07:30 – 22:00" },
    { dias: "Domingo", horas: "09:00 – 22:00" },
  ],
  appUrl: "https://origens-sabor.vercel.app",
} as const;

export const LINK_NAVEGACAO = [
  { label: "Início", to: "/" },
  { label: "Menu", to: "/cardapio" },
  { label: "Reservar mesa", to: "/reservar-mesa" },
  { label: "Contacto", to: "/contacto" },
] as const;
