import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

export default function Manual() {
  return (
    <>
      <Navbar />
      <div className="container-custom py-16">
        <h1 className="text-4xl font-bold text-center text-secundaria mb-8">Manual do Utilizador</h1>
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-primaria mb-4">📱 Para Clientes</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Criar conta:</strong> Aceda a "Entrar" e escolha "Criar conta". Preencha os seus dados.</li>
              <li><strong>Fazer login:</strong> Use o seu e‑mail e senha ou entre com Google.</li>
              <li><strong>Explorar cardápio:</strong> Navegue pelos produtos, filtre por categoria, preço ou nome.</li>
              <li><strong>Adicionar ao carrinho:</strong> Clique em "Adicionar" no produto desejado.</li>
              <li><strong>Finalizar pedido:</strong> No carrinho, confirme os itens, escolha o bairro, calcule o frete e finalize.</li>
              <li><strong>Acompanhar pedidos:</strong> Na área "Meus Pedidos", veja o status (Pendente, Preparando, Saiu entrega, Entregue).</li>
              <li><strong>Reservar mesa:</strong> Aceda a "Reservas", escolha data, hora e número de pessoas.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-primaria mb-4">🛠️ Para Administradores</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Login:</strong> Use as credenciais fornecidas (role ADMIN).</li>
              <li><strong>Dashboard:</strong> Aceda a <code>/admin/dashboard</code> para visão geral.</li>
              <li><strong>Gestão de produtos:</strong> Adicione, edite ou remova produtos (incluindo upload de imagem).</li>
              <li><strong>Gestão de pedidos:</strong> Altere o status dos pedidos e atribua entregadores (agentes).</li>
              <li><strong>Gestão de utilizadores:</strong> Crie, active/desactive clientes ou agentes.</li>
              <li><strong>Gestão de mesas:</strong> Gere QR Codes, altere ocupação.</li>
              <li><strong>Configurações:</strong> Ajuste horários, taxas de frete, etc.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-primaria mb-4">🚚 Para Agentes (Entregadores)</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Login:</strong> Utilize as credenciais de agente (role AGENTE).</li>
              <li><strong>Dashboard:</strong> Aceda a <code>/agente/dashboard</code> para ver os pedidos atribuídos.</li>
              <li><strong>Atualizar status:</strong> Marque o pedido como "Entregue" quando concluído.</li>
              <li><strong>Localização:</strong> (se implementado) Atualize a sua localização em tempo real para os clientes.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-primaria mb-4">❓ Dúvidas Frequentes</h2>
            <div className="space-y-3">
              <div>
                <strong className="text-secundaria">Como calcular o frete?</strong>
                <p className="text-gray-600">Na finalização do pedido, selecione o seu bairro. O frete será calculado automaticamente com base numa tabela pré‑definida.</p>
              </div>
              <div>
                <strong className="text-secundaria">Posso cancelar um pedido?</strong>
                <p className="text-gray-600">Contacte o restaurante através do WhatsApp ou telefone. Pedidos já em preparo não podem ser cancelados.</p>
              </div>
              <div>
                <strong className="text-secundaria">Como funciona o QR Code das mesas?</strong>
                <p className="text-gray-600">Cada mesa tem um QR Code. Ao escanear, a mesa é marcada como ocupada e pode fazer pedidos directamente do lugar.</p>
              </div>
            </div>
          </section>
        </div>
        <div className="text-center mt-8">
          <Link to="/" className="btn-primary">Voltar à Página Inicial</Link>
        </div>
      </div>
            <Footer />
    </>
  );
}