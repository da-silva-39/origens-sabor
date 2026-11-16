const IMAGENS_LOCAIS: Record<string, string> = {
  "1-4 FRANGO GRELHADO": "/Imagens Corretas/1-4 frango grelhado.jpg",
  "1-4 FRANGO": "/Imagens Corretas/1-4 frango.jpg",
  "ASINHAS A ORIGEM": "/Imagens Corretas/asinhas a origem.jpg",
  "ASINHAS DE ORIGEM": "/Imagens Corretas/asinhas de origem.jpg",
  "ASINHAS DE FRANGO": "/Imagens Corretas/asinhas d frango.jpg",
  "ASINHAS D FRANGO": "/Imagens Corretas/asinhas d frango.jpg",
  ASINHAS: "/Imagens Corretas/asinhas.jpg",
  "BIFE ACEBOLADO COM ARROZ E BATATAS":
    "/Imagens Corretas/bife acebolado com arroz e batatas.jpg",
  "BIFE A MODA DA CASA": "/Imagens Corretas/bife a moda da casa.jpg",
  "BIFE AO MOLHO INGLES": "/Imagens Corretas/Bife ao molho inglês.jpg",
  "BIFE A PORTUGUESA": "/Imagens Corretas/bife a portuguesa.jpg",
  "BIFE COM COGUMELOS E NATAS": "/Imagens Corretas/bife com cogumelos e natas.jpg",
  CABECAS: "/Imagens Corretas/cabecas.jpg",
  "CAFE COM LEITE": "/Imagens Corretas/cafe com leite.jpg",
  "CAFE GALAO": "/Imagens Corretas/Cafe galao.jpg",
  "CAFE LONGO/CURTO": "/Imagens Corretas/cafe longo-curto.jpg",
  CAPUCCINO: "/Imagens Corretas/capuccino.jpg",
  "CHA DE CAMOMILA": "/Imagens Corretas/cha de camomila.jpg",
  "CHA DE MENTA": "/Imagens Corretas/cha de menta.jpg",
  "CHA LEITE": "/Imagens Corretas/cha leite.jpg",
  "CHA PRETO": "/Imagens Corretas/cha preto.jpg",
  "CHA SIMPLES": "/Imagens Corretas/cha.jpg",
  "CHAMUSSAS DE CARNE 4 UNID": "/Imagens Corretas/chamussa 4.jpg",
  "CHAMUSSAS DE FRANGO 4 UNID": "/Imagens Corretas/chamussa de frango.jpg",
  "CHAMUSSAS DE PEIXE 4 UNID": "/Imagens Corretas/chamussa de peixe.jpg",
  "CHOCOLATE QUENTE": "/Imagens Corretas/chocolate quente.jpg",
  "CHOURISSO COMPOSTO": "/Imagens Corretas/chourisso-Composto.jpg",
  "COMBO DE SALGADOS": "/Imagens Corretas/combo salgados.jpg",
  "COXINHAS DE FRANGO 4 UNID": "/Imagens Corretas/coxinha de frango.jpg",
  DOBRADA: "/Imagens Corretas/dobrada.jpg",
  DOUNATS: "/Imagens Corretas/donuts.jpg",
  "FRANGO COM BATATA GRELHA": "/Imagens Corretas/frango com batata grelha.jpg",
  "FRANGO COM XIMA": "/Imagens Corretas/frango com xima.jpg",
  "FRANGO E BTT": "/Imagens Corretas/frango e btt.jpg",
  "FRANGO INTERIO": "/Imagens Corretas/frango interio.jpg",
  "FRANGO PANADO": "/Imagens Corretas/frango panado.jpg",
  GALAO: "/Imagens Corretas/galao.jpg",
  "ISCA DE FIGADO": "/Imagens Corretas/isca de figado.jpg",
  "ISCA DE MOELAS": "/Imagens Corretas/isca de moelas.jpg",
  LANCHE: "/Imagens Corretas/lanche.jpg",
  "MAO DE VACA": "/Imagens Corretas/mao de vaca.jpg",
  "PICANHA NA GRELHA": "/Imagens Corretas/picanha na grelha.jpg",
  STROGNOF: "/Imagens Corretas/strognof.jpg",
  "TBONE COM ARROZ E BATATAS": "/Imagens Corretas/tbone com arroz e batatas.jpg",
  "MASSA COM CHOURICO 700 MT": "/Imagens Corretas/massa com chourico.jpg",
  "MASSA COM CHOURICO 1000 MT": "/Imagens Corretas/massa com chourico.jpg",
  "MASSAS ALFREDO DE CARNE 650 MT": "/Imagens Corretas/massas alfredo de carne.jpg",
  "MASSAS ALFREDO DE CARNE 800 MT": "/Imagens Corretas/massas alfredo de carne.jpg",
  "MASSAS ALFREDO DE CARNE 1000 MT": "/Imagens Corretas/massas alfredo de carne.jpg",
  "POSTA DE PEIXE CHICAMBA": "/Imagens Corretas/posta de peixe grelhada.jpg",
  "POSTA DE PEIXE PENDE": "/Imagens Corretas/posta de peixe grelhada.jpg",
  "POSTA DE PEIXE PEDRA": "/Imagens Corretas/posta de peixe grelhada.jpg",
  "PEIXE CORVINA POSTA 450 MT": "/Imagens Corretas/posta de peixe grelhada.jpg",
  "PEIXE CORVINA POSTA 500 MT": "/Imagens Corretas/posta de peixe grelhada.jpg",
  "PEIXE CHICAMBA 500 MT": "/Imagens Corretas/peixe grelhado.jpg",
  "PEIXE CHICAMBA 700 MT": "/Imagens Corretas/peixe grelhado.jpg",
  "PEIXE CHICAMBA 800 MT": "/Imagens Corretas/peixe grelhado.jpg",
  "PEIXE PENDE 500 MT": "/Imagens Corretas/peixe grelhado.jpg",
  "PEIXE PENDE 700 MT": "/Imagens Corretas/peixe grelhado.jpg",
  "PEIXE PENDE 800 MT": "/Imagens Corretas/peixe grelhado.jpg",
  "PEIXE PEDRA 500 MT": "/Imagens Corretas/peixe grelhado.jpg",
  "PEIXE PEDRA 750 MT": "/Imagens Corretas/peixe grelhado.jpg",
  "PEIXE PEDRA 800 MT": "/Imagens Corretas/peixe grelhado.jpg",
  "PEIXE VERMELHAO 600 MT": "/Imagens Corretas/peixe grelhado.jpg",
  "PEIXE VERMELHAO 700 MT": "/Imagens Corretas/peixe grelhado.jpg",
  "PEIXE VERMELHAO 800 MT": "/Imagens Corretas/peixe grelhado.jpg",
  "PEIXE CORVINA 500 MT": "/Imagens Corretas/peixe grelhado.jpg",
  "PEIXE CORVINA 600 MT": "/Imagens Corretas/peixe grelhado.jpg",
};

function chaveProduto(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function otimizarImagem(url: string | null): string | null {
  if (!url) return null;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (/\/upload\/[^/]*f_auto/.test(url)) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_600/");
}

export function imagemDoProduto(nome: string, imagemUrl: string | null): string | null {
  const chave = chaveProduto(nome);
  const local = IMAGENS_LOCAIS[chave];
  if (local) return local;
  if (chave.startsWith("HAMBURGUER")) return "/img2.jpg";
  return otimizarImagem(imagemUrl);
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
    src: "/prato apresentacao.jpg",
    alt: "Prato de carne com arroz e legumes do Origens do Sabor",
  },
  {
    src: "/pizza cliente.jpg",
    alt: "Cliente a receber uma pizza no balcão do Origens do Sabor",
  },
  {
    src: "/contacto.jpg",
    alt: "Identidade visual do Origens do Sabor com bife e legumes",
  },
  {
    src: "/img2.jpg",
    alt: "Hambúrguer com batatas fritas do Origens do Sabor",
  },
] as const;
