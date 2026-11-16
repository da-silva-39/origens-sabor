import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Privacidade() {
  useDocumentTitle('Privacidade e dados — Origens do Sabor');

  return (
    <div className="section">
      <div className="container-custom max-w-3xl">
        <p className="eyebrow">Informação</p>
        <h1 className="mt-3 font-display text-4xl">Privacidade e dados</h1>
        <p className="mt-4 text-sm text-carvao/55">
          Última atualização: novembro de 2026
        </p>

        <div className="prose-restaurante mt-10 space-y-8 text-sm">
          <section>
            <h2 className="font-display text-2xl">Que dados recolhemos</h2>
            <p className="mt-2">
              Ao criar conta, o Origens do Sabor recolhe o nome, e-mail,
              telefone e, se indicar, endereço e data de nascimento. Ao fazer
              uma reserva, recolhemos o nome e os contactos necessários para a
              confirmar, além da data, hora, número de pessoas e observações. Ao
              fazer um pedido, recolhemos os dados de entrega e os artigos
              escolhidos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Para que usamos os dados</h2>
            <p className="mt-2">
              Usamos os dados apenas para gerir a sua conta, processar reservas
              e pedidos, confirmar informações por telefone, e-mail ou WhatsApp
              e responder a pedidos de contacto. Não vendemos dados pessoais.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Serviços utilizados</h2>
            <p className="mt-2">
              Para operar o serviço, recorremos a fornecedores de alojamento e
              base de dados, armazenamento de imagens, envio de e-mail e envio
              de mensagens WhatsApp. Estes fornecedores tratam apenas os dados
              necessários à função que desempenham.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Os seus direitos</h2>
            <p className="mt-2">
              Pode pedir acesso, correção ou eliminação dos seus dados, bem como
              a desativação da conta, através de{" "}
              <a
                href="mailto:origensdosabor@gmail.com"
                className="font-medium text-terracota hover:text-secundaria"
              >
                origensdosabor@gmail.com
              </a>{" "}
              ou pelo telefone +258 84 842 4621.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Segurança</h2>
            <p className="mt-2">
              As palavras-passe são guardadas de forma encriptada. O acesso à
              área administrativa é restrito a utilizadores autorizados. Ainda
              assim, nenhum sistema é totalmente imune a riscos; se detetar
              algum problema, contacte-nos.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
