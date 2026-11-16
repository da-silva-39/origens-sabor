const IMAGENS_LOCAIS: Record<string, string> = {
  DOUNATS: "/Imagens Corretas/donuts.jpg",
  "CHAMUSSAS DE FRANGO (4 UNID)": "/Imagens Corretas/chamussa de frango.jpg",
  "CHAMUSSAS DE PEIXE (4 UNID)": "/Imagens Corretas/chamussa de peixe.jpg",
  "CHAMUSSAS DE CARNE (4 UNID)": "/Imagens Corretas/chamussa 4.jpg",
  "COXINHAS DE FRANGO (4 UNID)": "/Imagens Corretas/coxinha de frango.jpg",
  "COMBO DE SALGADOS": "/Imagens Corretas/combo salgados.jpg",
  "CHÁ DE CAMOMILA": "/Imagens Corretas/cha de camomila.jpg",
  "CHÁ PRETO": "/Imagens Corretas/cha preto.jpg",
  "CHÁ SIMPLES": "/Imagens Corretas/cha.jpg",
};

function otimizarImagem(url: string | null): string | null {
  if (!url) return null;
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  if (/\/upload\/[^/]*f_auto/.test(url)) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto,w_600/');
}

export function imagemDoProduto(nome: string, imagemUrl: string | null): string | null {
  const local = IMAGENS_LOCAIS[nome.trim().toUpperCase()];
  return local || otimizarImagem(imagemUrl);
}

export const GALERIA = [
  {
    src: "/prato apresentacao.jpg",
    alt: "Prato servido no Origens do Sabor",
    legenda: "Da nossa cozinha para a mesa",
  },
  {
    src: "/Imagens Corretas/1-4 frango grelhado.jpg",
    alt: "Frango grelhado com acompanhamento",
    legenda: "Frango grelhado",
  },
  {
    src: "/Imagens Corretas/bife a portuguesa.jpg",
    alt: "Bife à portuguesa servido no restaurante",
    legenda: "Bife à portuguesa",
  },
  {
    src: "/Imagens Corretas/picanha na grelha.jpg",
    alt: "Picanha na grelha",
    legenda: "Picanha na grelha",
  },
  {
    src: "/Imagens Corretas/frango com xima.jpg",
    alt: "Frango com xima, prato tradicional moçambicano",
    legenda: "Frango com xima",
  },
  {
    src: "/Imagens Corretas/chamussa de frango.jpg",
    alt: "Chamussas de frango",
    legenda: "Chamussas de frango",
  },
] as const;

export const HERO_SLIDES = [
  {
    src: "/imagens-web/hero.webp",
    alt: "Prato servido no Origens do Sabor, em Chimoio",
  },
  {
    src: "/imagens-web/prato-assinatura.webp",
    alt: "Prato de assinatura do Origens do Sabor",
  },
  {
    src: "/Imagens Corretas/1-4 frango grelhado.jpg",
    alt: "Frango grelhado com acompanhamento",
  },
  {
    src: "/imagens-web/contacto.webp",
    alt: "Ambiente e mesa do restaurante Origens do Sabor",
  },
] as const;
