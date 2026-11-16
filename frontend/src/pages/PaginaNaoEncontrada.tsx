import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function PaginaNaoEncontrada() {
  useDocumentTitle('Página não encontrada — Origens do Sabor');

  return (
    <section className="section">
      <div className="container-custom max-w-xl text-center">
        <p className="eyebrow">Erro 404</p>
        <h1 className="mt-4 font-display text-4xl text-secundaria sm:text-5xl">
          Esta página saiu da mesa.
        </h1>
        <p className="mt-4 text-texto/70">
          O endereço que procura não existe ou foi movido. Volte ao início ou
          consulte o nosso menu.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary">
            Voltar ao início
          </Link>
          <Link to="/cardapio" className="btn-secondary">
            Ver o menu
          </Link>
        </div>
      </div>
    </section>
  );
}
