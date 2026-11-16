import { Link } from 'react-router-dom';
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiArrowUpRight,
  FiInstagram,
  FiFacebook,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { RESTAURANTE } from '../data/restaurante';

export default function Footer() {
  return (
    <footer className="bg-secundaria text-creme">
      <div className="container-custom py-14 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1fr]">
          <div>
            <p className="font-display text-2xl">{RESTAURANTE.nome}</p>
            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.28em] text-creme/50">
              {RESTAURANTE.descricao}
            </p>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-creme/70">
              Cozinha moçambicana e pratos da casa, servidos com cuidado em
              Chimoio. À mesa, para levar ou para reservar.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={RESTAURANTE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-creme/20 text-creme/75 transition-colors hover:border-dourado hover:text-dourado"
                aria-label="Instagram do Origens do Sabor"
              >
                <FiInstagram className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={RESTAURANTE.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-creme/20 text-creme/75 transition-colors hover:border-dourado hover:text-dourado"
                aria-label="Facebook do Origens do Sabor"
              >
                <FiFacebook className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={RESTAURANTE.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-creme/20 text-creme/75 transition-colors hover:border-dourado hover:text-dourado"
                aria-label="WhatsApp do Origens do Sabor"
              >
                <FaWhatsapp className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <nav aria-label="Links do rodapé">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-dourado">
              Explorar
            </h2>
            <ul className="mt-5 space-y-3">
              <li><Link to="/cardapio" className="footer-link">Menu</Link></li>
              <li><Link to="/reservar-mesa" className="footer-link">Reservar mesa</Link></li>
              <li><Link to="/minhas-reservas" className="footer-link">As minhas reservas</Link></li>
              <li><Link to="/meus-pedidos" className="footer-link">Os meus pedidos</Link></li>
              <li><Link to="/contacto" className="footer-link">Contacto</Link></li>
              <li><Link to="/termos" className="footer-link">Termos e privacidade</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-dourado">
              Contactos
            </h2>
            <ul className="mt-5 space-y-4 text-sm text-creme/70">
              <li className="flex gap-3">
                <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-creme/45" aria-hidden="true" />
                <span>{RESTAURANTE.endereco}</span>
              </li>
              <li className="flex gap-3">
                <FiPhone className="mt-0.5 h-4 w-4 shrink-0 text-creme/45" aria-hidden="true" />
                <span>
                  <a href={RESTAURANTE.telefonePrincipalLink} className="footer-link block">
                    {RESTAURANTE.telefonePrincipal}
                  </a>
                  <a href={RESTAURANTE.telefoneSecundarioLink} className="footer-link block">
                    {RESTAURANTE.telefoneSecundario}
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <FiMail className="mt-0.5 h-4 w-4 shrink-0 text-creme/45" aria-hidden="true" />
                <a href={RESTAURANTE.emailLink} className="footer-link break-all">
                  {RESTAURANTE.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-dourado">
              Horário
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-creme/70">
              {RESTAURANTE.horarios.map((horario) => (
                <li key={horario.dias} className="flex gap-3">
                  <FiClock className="mt-0.5 h-4 w-4 shrink-0 text-creme/45" aria-hidden="true" />
                  <span>
                    <span className="block text-creme/55">{horario.dias}</span>
                    {horario.horas}
                  </span>
                </li>
              ))}
            </ul>
            <a
              href={RESTAURANTE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-dourado hover:text-white"
            >
              Como chegar
              <FiArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-creme/15 pt-6 text-xs text-creme/45 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {RESTAURANTE.nome}. Todos os direitos
            reservados.
          </p>
          <p>
            Concebido e desenvolvido por{" "}
            <a
              href="https://wa.me/258855712857"
              target="_blank"
              rel="noopener noreferrer"
              className="text-creme/70 hover:text-creme"
            >
              José Da Silva
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
