import { useEffect, useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { RESTAURANTE } from '../data/restaurante';

const SECOES = [
  { id: 'identificacao', titulo: 'Identificação e âmbito' },
  { id: 'aceitacao', titulo: 'Aceitação dos termos' },
  { id: 'utilizacao', titulo: 'Utilização do website' },
  { id: 'conta', titulo: 'Conta de utilizador' },
  { id: 'reservas', titulo: 'Reservas de mesa' },
  { id: 'encomendas', titulo: 'Encomendas e entregas' },
  { id: 'precos', titulo: 'Preços, pagamentos e disponibilidade' },
  { id: 'cancelamentos', titulo: 'Cancelamentos e alterações' },
  { id: 'alergenios', titulo: 'Alergénios e informação alimentar' },
  { id: 'propriedade', titulo: 'Propriedade intelectual' },
  { id: 'responsabilidade', titulo: 'Responsabilidade' },
  { id: 'dados', titulo: 'Dados pessoais recolhidos' },
  { id: 'finalidades', titulo: 'Finalidades e fundamentos' },
  { id: 'partilha', titulo: 'Partilha, conservação e segurança' },
  { id: 'direitos', titulo: 'Direitos do titular dos dados' },
  { id: 'cookies', titulo: 'Cookies e armazenamento local' },
  { id: 'terceiros', titulo: 'Ligações e serviços de terceiros' },
  { id: 'alteracoes', titulo: 'Alterações ao documento' },
  { id: 'lei', titulo: 'Lei aplicável e litígios' },
  { id: 'contactos', titulo: 'Contactos e reclamações' },
] as const;

function ListaIndice({ ativo, onNavegar }: { ativo: string; onNavegar?: () => void }) {
  return (
    <ol className="space-y-2 text-sm">
      {SECOES.map((secao, indice) => (
        <li key={secao.id}>
          <a
            href={`#${secao.id}`}
            onClick={onNavegar}
            aria-current={ativo === secao.id ? 'location' : undefined}
            className={`flex gap-2 leading-snug transition-colors ${
              ativo === secao.id
                ? 'font-semibold text-terracota'
                : 'text-carvao/65 hover:text-terracota'
            }`}
          >
            <span className="w-5 shrink-0 text-right text-xs text-carvao/35">
              {String(indice + 1).padStart(2, '0')}
            </span>
            <span>{secao.titulo}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

export default function Termos() {
  useDocumentTitle(
    'Termos, condições e privacidade — Origens do Sabor',
    'Termos de utilização, condições de reservas e encomendas, política de privacidade e uso de dados do Origens do Sabor, em Chimoio.'
  );
  const [ativo, setAtivo] = useState<string>(SECOES[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entradas) => {
        const visiveis = entradas
          .filter((entrada) => entrada.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visiveis[0]) setAtivo(visiveis[0].target.id);
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: 0 }
    );

    const elementos = SECOES.map((secao) => document.getElementById(secao.id)).filter(
      (elemento): elemento is HTMLElement => Boolean(elemento)
    );
    elementos.forEach((elemento) => observer.observe(elemento));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="section">
      <div className="container-custom max-w-6xl">
        <header className="max-w-3xl">
          <p className="eyebrow">Informação legal</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">
            Termos, condições e privacidade
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-carvao/65">
            Este documento reúne as regras de utilização do website, as condições
            aplicáveis a reservas e encomendas e a forma como tratamos os seus
            dados pessoais. Leia-o antes de utilizar os serviços.
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-carvao/40">
            Última atualização: 16 de novembro de 2026
          </p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <details className="border border-carvao/10 bg-white p-5 lg:hidden">
              <summary className="cursor-pointer font-display text-lg text-secundaria">
                Índice do documento
              </summary>
              <nav className="mt-4" aria-label="Índice do documento">
                <ListaIndice ativo={ativo} />
              </nav>
            </details>

            <nav
              className="hidden border border-carvao/10 bg-white p-5 lg:block"
              aria-label="Índice do documento"
            >
              <p className="eyebrow">Índice</p>
              <div className="mt-4">
                <ListaIndice ativo={ativo} />
              </div>
            </nav>
          </aside>

          <article className="min-w-0 space-y-12 text-sm leading-relaxed text-carvao/75">
            <section id="identificacao" className="scroll-mt-28">
              <h2 className="font-display text-2xl sm:text-3xl">1. Identificação e âmbito</h2>
              <p className="mt-3">
                O website do <strong>Origens do Sabor</strong> é operado pelo
                próprio restaurante, estabelecimento de restauração e bar com
                atendimento em {RESTAURANTE.endereco}. Pode contactar-nos pelos
                telefones {RESTAURANTE.telefonePrincipal} ou{' '}
                {RESTAURANTE.telefoneSecundario}, ou por e-mail para{' '}
                <a className="font-medium text-terracota hover:text-secundaria" href={RESTAURANTE.emailLink}>
                  {RESTAURANTE.email}
                </a>
                .
              </p>
              <p className="mt-3">
                Este documento aplica-se à utilização do website, à criação de
                conta, às reservas de mesa, às encomendas para entrega ou
                takeaway e aos contactos efetuados através dos canais digitais do
                restaurante. Serviços prestados presencialmente podem estar
                sujeitos a condições adicionais informadas no local.
              </p>
            </section>

            <section id="aceitacao" className="scroll-mt-28">
              <h2 className="font-display text-2xl sm:text-3xl">2. Aceitação dos termos</h2>
              <p className="mt-3">
                Ao aceder ou utilizar o website, confirma que leu e compreendeu
                este documento e que aceita as condições nele descritas. Se não
                concordar, deve abster-se de utilizar os serviços digitais.
              </p>
              <p className="mt-3">
                A aceitação não prejudica os direitos imperativos que a lei
                confira ao consumidor. Sempre que uma disposição destes termos
                seja contrária a norma legal obrigatória, prevalece a norma
                legal.
              </p>
            </section>

            <section id="utilizacao" className="scroll-mt-28">
              <h2 className="font-display text-2xl sm:text-3xl">3. Utilização do website</h2>
              <p className="mt-3">
                O website deve ser utilizado de forma lícita e responsável. Não é
                permitido, designadamente:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>utilizar o site para fins ilícitos, fraudulentos ou abusivos;</li>
                <li>introduzir informação falsa em contas, reservas, pedidos ou formulários;</li>
                <li>tentar aceder a áreas restritas, contas de terceiros ou sistemas internos;</li>
                <li>recolher, copiar ou explorar dados de outros utilizadores;</li>
                <li>
                  interferir com o funcionamento do site, incluindo através de
                  pedidos automatizados que o sobrecarreguem.
                </li>
              </ul>
              <p className="mt-3">
                O restaurante pode limitar ou suspender o acesso em caso de
                utilização indevida, sem prejuízo de outras medidas legalmente
                admissíveis.
              </p>
            </section>

            <section id="conta" className="scroll-mt-28">
              <h2 className="font-display text-2xl sm:text-3xl">4. Conta de utilizador</h2>
              <p className="mt-3">
                Algumas funcionalidades exigem a criação de conta. Deve fornecer
                informação verdadeira, completa e atualizada, e mantê-la
                corrigida. As credenciais de acesso são pessoais e não devem ser
                partilhadas.
              </p>
              <p className="mt-3">
                É responsável pelas atividades realizadas com a sua conta. Se
                suspeitar de acesso não autorizado, deve alterar a palavra-passe
                e contactar-nos imediatamente. Podemos desativar contas que
                violem estes termos ou que contenham informação manifestamente
                falsa.
              </p>
              <p className="mt-3">
                A conta pode ser desativada a pedido do titular, sem prejuízo da
                conservação de registos necessários ao cumprimento de
                obrigações legais ou ao exercício de direitos.
              </p>
            </section>

            <section id="reservas" className="scroll-mt-28">
              <h2 className="font-display text-2xl sm:text-3xl">5. Reservas de mesa</h2>
              <p className="mt-3">
                Ao submeter uma reserva, recebe uma confirmação de pedido. A
                reserva fica <strong>pendente</strong> até ser confirmada pela
                equipa do restaurante. A confirmação pode ser comunicada pelos
                contactos indicados (telefone, e-mail ou WhatsApp).
              </p>
              <p className="mt-3">
                A disponibilidade é verificada no momento do pedido, mas pode
                alterar-se antes da confirmação. A mesa e o horário indicados
                podem ser ajustados por acordo entre as partes. Recomendamos que
                chegue à hora reservada; atrasos podem implicar a libertação da
                mesa, conforme a disponibilidade e sem prejuízo de outras
                soluções que a equipa possa oferecer.
              </p>
              <p className="mt-3">
                Reservas para grupos, eventos ou necessidades especiais devem ser
                confirmadas diretamente com o restaurante. Os dados fornecidos
                são utilizados para gerir a reserva e comunicar o seu estado.
              </p>
            </section>

            <section id="encomendas" className="scroll-mt-28">
              <h2 className="font-display text-2xl sm:text-3xl">6. Encomendas e entregas</h2>
              <p className="mt-3">
                As encomendas estão sujeitas à disponibilidade dos artigos, à
                confirmação do restaurante e à área de entrega selecionada. Os
                artigos e preços apresentados no site podem ser atualizados pela
                equipa; o resumo final apresentado antes da submissão prevalece
                sobre informações anteriores.
              </p>
              <p className="mt-3">
                As taxas e os tempos de entrega são apresentados durante o
                processo de encomenda. Os tempos indicados são estimativas e
                podem variar por razões de trânsito, clima, volume de pedidos ou
                outras circunstâncias alheias ao restaurante.
              </p>
              <p className="mt-3">
                A entrega é efetuada no endereço e para a pessoa indicados. Se
                não for possível entregar por informação incorreta ou ausência no
                local, a equipa tentará contactar o cliente. O website não
                processa pagamentos com cartão; o meio de pagamento é acordado
                com o restaurante no momento do pedido ou da entrega.
              </p>
            </section>

            <section id="precos" className="scroll-mt-28">
              <h2 className="font-display text-2xl sm:text-3xl">
                7. Preços, pagamentos e disponibilidade
              </h2>
              <p className="mt-3">
                Salvo indicação em contrário, os preços são apresentados em
                meticais (MT) e incluem os valores aplicáveis ao serviço
                indicado. Podem existir taxas de entrega adicionais,
                devidamente apresentadas antes da conclusão da encomenda.
              </p>
              <p className="mt-3">
                Apesar dos esforços de atualização, podem ocorrer erros de preço,
                descrição ou disponibilidade. Se detetarmos um erro material
                antes de o pedido ser executado, contactaremos o cliente para
                confirmar ou cancelar a encomenda, sem custos indevidos.
              </p>
              <p className="mt-3">
                Os artigos estão disponíveis enquanto durarem os produtos. A
                equipa pode, se necessário, propor um artigo alternativo ou
                confirmar a indisponibilidade.
              </p>
            </section>

            <section id="cancelamentos" className="scroll-mt-28">
              <h2 className="font-display text-2xl sm:text-3xl">
                8. Cancelamentos e alterações
              </h2>
              <p className="mt-3">
                As reservas ativas podem ser canceladas na área da conta ou
                diretamente com o restaurante, pelos contactos indicados. As
                encomendas podem ser alteradas ou canceladas enquanto não tiverem
                entrado em preparação ou entrega; depois disso, a equipa avaliará
                cada situação.
              </p>
              <p className="mt-3">
                Quaisquer custos de cancelamento só serão aplicados quando
                previamente informados e legalmente admissíveis. Recomendamos o
                contacto direto em caso de dúvida, para encontrar a melhor
                solução.
              </p>
            </section>

            <section id="alergenios" className="scroll-mt-28">
              <h2 className="font-display text-2xl sm:text-3xl">
                9. Alergénios e informação alimentar
              </h2>
              <p className="mt-3">
                As descrições dos pratos e eventuais menções a alergénios são
                informativas. A preparação decorre numa cozinha onde podem existir
                vários ingredientes, pelo que não é possível garantir ausência
                total de vestígios de alergénios ou de contaminantes.
              </p>
              <p className="mt-3">
                Se tem alergia, intolerância ou restrição alimentar, informe a
                equipa antes de encomendar ou de consumir. A equipa indicará as
                opções disponíveis e as adaptações possíveis.
              </p>
            </section>

            <section id="propriedade" className="scroll-mt-28">
              <h2 className="font-display text-2xl sm:text-3xl">10. Propriedade intelectual</h2>
              <p className="mt-3">
                O nome, logótipo, textos, fotografias, menu, design e restantes
                conteúdos do website pertencem ao Origens do Sabor ou são
                utilizados com autorização. Não podem ser copiados, reproduzidos,
                modificados ou utilizados para fins comerciais sem autorização
                escrita prévia, exceto nos casos permitidos por lei.
              </p>
              <p className="mt-3">
                Pode partilhar ligações para as páginas públicas do website e
                visualizar os conteúdos para uso pessoal.
              </p>
            </section>

            <section id="responsabilidade" className="scroll-mt-28">
              <h2 className="font-display text-2xl sm:text-3xl">11. Responsabilidade</h2>
              <p className="mt-3">
                O restaurante procura manter o website disponível, seguro e com
                informação atualizada, mas não garante funcionamento ininterrupto
                ou isento de erros. O serviço pode ser suspenso por manutenção,
                segurança ou causas alheias ao controlo do restaurante.
              </p>
              <p className="mt-3">
                Na medida permitida por lei, o restaurante não responde por danos
                resultantes de utilização indevida do site, de informação
                incorreta fornecida pelo utilizador ou de falhas de serviços de
                terceiros. Nada nestes termos exclui ou limita responsabilidade
                que não possa ser legalmente excluída, incluindo direitos do
                consumidor.
              </p>
              <p className="mt-3">
                As imagens dos pratos são ilustrativas; a apresentação final pode
                variar.
              </p>
            </section>

            <section id="dados" className="scroll-mt-28">
              <h2 className="font-display text-2xl sm:text-3xl">12. Dados pessoais recolhidos</h2>
              <p className="mt-3">
                Recolhemos apenas os dados necessários para prestar os serviços,
                designadamente:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  <strong>Conta:</strong> nome, e-mail, telefone, palavra-passe
                  (guardada de forma encriptada), morada e data de nascimento,
                  quando indicadas, e foto de perfil, se a carregar. Em contas
                  criadas com Google, recebemos os dados básicos autorizados pelo
                  serviço de autenticação.
                </li>
                <li>
                  <strong>Reservas:</strong> nome, e-mail, telefone, data e hora,
                  número de pessoas, mesa atribuída, estado e observações.
                </li>
                <li>
                  <strong>Encomendas:</strong> nome, contactos, endereço e bairro
                  de entrega, artigos, valores, estado e histórico da encomenda.
                </li>
                <li>
                  <strong>Contactos:</strong> nome, e-mail, telefone e conteúdo
                  da mensagem enviada.
                </li>
                <li>
                  <strong>Dados técnicos:</strong> endereço IP, data e hora de
                  acesso, tipo de dispositivo/navegador e registos de segurança
                  necessários ao funcionamento e à proteção do sistema.
                </li>
                <li>
                  <strong>Localização:</strong> apenas os agentes de entrega
                  autorizados partilham a localização durante o serviço, para
                  acompanhamento das entregas. Os clientes não são localizados
                  pelo website.
                </li>
              </ul>
            </section>

            <section id="finalidades" className="scroll-mt-28">
              <h2 className="font-display text-2xl sm:text-3xl">
                13. Finalidades e fundamentos do tratamento
              </h2>
              <p className="mt-3">Os dados são tratados para:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>criar e gerir a conta e autenticar o utilizador;</li>
                <li>registar, confirmar e gerir reservas e encomendas;</li>
                <li>processar entregas e contactar o cliente sobre o pedido;</li>
                <li>responder a mensagens, pedidos de informação e reclamações;</li>
                <li>prevenir fraude, abuso e acessos não autorizados;</li>
                <li>cumprir obrigações legais e exercer direitos;</li>
                <li>melhorar a segurança e o funcionamento do website.</li>
              </ul>
              <p className="mt-3">
                O tratamento baseia-se na execução do contrato ou de diligências
                pré-contratuais, no consentimento quando solicitado, no
                cumprimento de obrigações legais e no interesse legítimo do
                restaurante em manter os serviços seguros e funcionais. O
                consentimento pode ser retirado a qualquer momento, sem afetar o
                tratamento já realizado.
              </p>
            </section>

            <section id="partilha" className="scroll-mt-28">
              <h2 className="font-display text-2xl sm:text-3xl">
                14. Partilha, conservação e segurança
              </h2>
              <p className="mt-3">
                Não vendemos dados pessoais. Partilhamos apenas o necessário com
                prestadores que apoiam o funcionamento do serviço, como
                alojamento do website e da base de dados, armazenamento de
                imagens, envio de e-mail, envio de mensagens por WhatsApp,
                autenticação com Google e mapas. Estes prestadores tratam os
                dados de acordo com as suas próprias condições e apenas para as
                finalidades contratadas.
              </p>
              <p className="mt-3">
                Podemos divulgar informação quando exigido por lei, por decisão
                de autoridade competente ou para proteger direitos do restaurante
                ou de terceiros.
              </p>
              <p className="mt-3">
                Alguns prestadores podem tratar dados fora de Moçambique. Nesses
                casos, adotamos medidas contratuais, organizativas e técnicas
                razoáveis para proteger a informação. Os dados são conservados
                enquanto a conta estiver ativa e pelo período necessário às
                finalidades descritas, incluindo prazos legais, contabilísticos
                ou de defesa de direitos; depois disso são eliminados ou
                anonimizados.
              </p>
              <p className="mt-3">
                As palavras-passe são guardadas com função de hash. O acesso à
                informação é limitado a pessoas autorizadas. Ainda assim, nenhum
                sistema é totalmente imune a riscos; se detetar um problema,
                contacte-nos imediatamente.
              </p>
            </section>

            <section id="direitos" className="scroll-mt-28">
              <h2 className="font-display text-2xl sm:text-3xl">
                15. Direitos do titular dos dados
              </h2>
              <p className="mt-3">
                Nos termos da lei aplicável, pode pedir o acesso aos seus dados,
                a correção de informação inexata, a eliminação, a limitação ou a
                oposição a determinados tratamentos, a portabilidade quando
                aplicável e a retirada do consentimento. Pode ainda solicitar
                informação sobre a origem dos dados e sobre a sua partilha.
              </p>
              <p className="mt-3">
                Para exercer estes direitos, contacte-nos por e-mail ou telefone.
                Podemos pedir informação adicional para confirmar a identidade e
                proteger os dados. Responderemos dentro de um prazo razoável e de
                acordo com a lei. Se considerar que o tratamento não respeita os
                seus direitos, pode apresentar reclamação à autoridade competente
                em matéria de proteção de dados.
              </p>
            </section>

            <section id="cookies" className="scroll-mt-28">
              <h2 className="font-display text-2xl sm:text-3xl">
                16. Cookies e armazenamento local
              </h2>
              <p className="mt-3">
                O website utiliza armazenamento local do navegador para manter a
                sessão de autenticação e o conteúdo do carrinho. Estes dados são
                essenciais ao funcionamento das funcionalidades pedidas e podem
                ser removidos ao terminar sessão ou limpar os dados do navegador.
              </p>
              <p className="mt-3">
                Podem existir cookies ou recursos de terceiros quando utiliza
                serviços incorporados, como o mapa do Google, ou quando acede a
                plataformas externas através de links (Instagram, Facebook,
                WhatsApp). Esses serviços têm as suas próprias políticas. O
                website não utiliza, atualmente, publicidade comportamental
                própria. Pode gerir cookies e armazenamento nas definições do
                navegador; bloquear os elementos essenciais pode impedir o
                funcionamento de algumas funcionalidades.
              </p>
            </section>

            <section id="terceiros" className="scroll-mt-28">
              <h2 className="font-display text-2xl sm:text-3xl">
                17. Ligações e serviços de terceiros
              </h2>
              <p className="mt-3">
                O website pode conter ligações ou funcionalidades de terceiros,
                incluindo autenticação Google, mapas, redes sociais e WhatsApp. O
                restaurante não controla esses serviços nem as suas políticas de
                privacidade. Ao utilizá-los, aplicam-se as condições dos
                respetivos fornecedores.
              </p>
            </section>

            <section id="alteracoes" className="scroll-mt-28">
              <h2 className="font-display text-2xl sm:text-3xl">18. Alterações ao documento</h2>
              <p className="mt-3">
                Estes termos e esta política podem ser atualizados para refletir
                alterações nos serviços, na legislação ou nas práticas do
                restaurante. A versão em vigor é a publicada nesta página, com a
                data de atualização no topo. Alterações relevantes serão
                comunicadas por meios adequados quando legalmente exigido.
              </p>
              <p className="mt-3">
                A continuação da utilização do website após a publicação de uma
                nova versão significa que aceita as condições atualizadas.
              </p>
            </section>

            <section id="lei" className="scroll-mt-28">
              <h2 className="font-display text-2xl sm:text-3xl">
                19. Lei aplicável e litígios
              </h2>
              <p className="mt-3">
                Este documento rege-se pela legislação aplicável em Moçambique,
                sem prejuízo das normas de proteção do consumidor que sejam
                imperativas. Em caso de divergência, procuremos primeiro uma
                solução amigável através dos contactos indicados. Se não for
                possível, a questão pode ser submetida aos tribunais competentes,
                nos termos da lei.
              </p>
            </section>

            <section id="contactos" className="scroll-mt-28">
              <h2 className="font-display text-2xl sm:text-3xl">20. Contactos e reclamações</h2>
              <p className="mt-3">
                Para questões sobre este documento, reservas, encomendas ou
                tratamento de dados, utilize os seguintes contactos:
              </p>
              <ul className="mt-4 space-y-3 rounded-sm border border-carvao/10 bg-white p-5">
                <li>
                  <strong>E-mail:</strong>{' '}
                  <a
                    href={RESTAURANTE.emailLink}
                    className="font-medium text-terracota hover:text-secundaria"
                  >
                    {RESTAURANTE.email}
                  </a>
                </li>
                <li>
                  <strong>Telefone:</strong>{' '}
                  <a
                    href={RESTAURANTE.telefonePrincipalLink}
                    className="font-medium text-terracota hover:text-secundaria"
                  >
                    {RESTAURANTE.telefonePrincipal}
                  </a>{' '}
                  ·{' '}
                  <a
                    href={RESTAURANTE.telefoneSecundarioLink}
                    className="font-medium text-terracota hover:text-secundaria"
                  >
                    {RESTAURANTE.telefoneSecundario}
                  </a>
                </li>
                <li>
                  <strong>Morada:</strong> {RESTAURANTE.endereco}
                </li>
                <li>
                  <strong>Horário:</strong>{' '}
                  {RESTAURANTE.horarios.map((horario) => `${horario.dias}: ${horario.horas}`).join(' · ')}
                </li>
              </ul>
              <p className="mt-3">
                Comprometemo-nos a analisar cada pedido ou reclamação com atenção
                e a responder pelos meios de contacto indicados.
              </p>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
}
