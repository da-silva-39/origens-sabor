import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

interface ContaHeaderProps {
  eyebrow: string;
  titulo: string;
  descricao: string;
  acao?: ReactNode;
  voltarPara?: string;
  voltarRotulo?: string;
}

export default function ContaHeader({
  eyebrow,
  titulo,
  descricao,
  acao,
  voltarPara = '/dashboard',
  voltarRotulo = 'Voltar ao painel',
}: ContaHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-secundaria text-creme">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(193,154,91,0.22),transparent_45%)]" />
      <div className="container-custom relative py-9 sm:py-12">
        <Link
          to={voltarPara}
          className="inline-flex items-center gap-2 text-xs font-semibold text-creme/60 transition-colors hover:text-creme"
        >
          <FiArrowLeft aria-hidden="true" /> {voltarRotulo}
        </Link>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-dourado">{eyebrow}</p>
            <h1 className="mt-2 font-display text-3xl text-creme sm:text-4xl">{titulo}</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-creme/70">{descricao}</p>
          </div>
          {acao && <div className="shrink-0">{acao}</div>}
        </div>
      </div>
    </section>
  );
}
