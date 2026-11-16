const SUFIXO_PRECO = /\s*\(\d[\d.,]*\s*MT\)\s*$/i;

export function nomeExibicao(nome: string): string {
  return nome.replace(SUFIXO_PRECO, '').trim();
}

export function descricaoExibicao(descricao: string | null): string | null {
  if (!descricao) return null;
  const limpa = descricao.replace(SUFIXO_PRECO, '').trim();
  return limpa || null;
}

const ROTULOS_CATEGORIA: Record<string, string> = {
  "Cafe e Cha": "Café e Chá",
  Hamburguer: "Hambúrguer",
  "Massas & Pratos": "Massas & Pratos",
};

export function rotuloCategoria(categoria: string): string {
  return ROTULOS_CATEGORIA[categoria] || categoria;
}
