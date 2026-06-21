/* eslint-disable @typescript-eslint/no-unused-vars */
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Cores institucionais
const COR_PRIMARIA = '#ff6b35';   // laranja
const COR_SECUNDARIA = '#2c3e50'; // azul escuro
const COR_CINZA = '#555555';

// URL da logo no Cloudinary
const LOGO_URL = 'https://res.cloudinary.com/dx3rzepdc/image/upload/v1782072018/logo_zhzabn.jpg';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COR_PRIMARIA,
    paddingBottom: 15,
    marginBottom: 25,
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain',
  },
  empresa: {
    textAlign: 'right',
  },
  tituloEmpresa: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COR_SECUNDARIA,
  },
  subtituloEmpresa: {
    fontSize: 10,
    color: COR_CINZA,
    marginTop: 2,
  },
  tituloRecibo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COR_PRIMARIA,
    textAlign: 'center',
    marginBottom: 20,
  },
  infoPedido: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoBloco: {
    width: '45%',
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COR_SECUNDARIA,
    marginBottom: 2,
  },
  valor: {
    fontSize: 11,
    color: '#333333',
    marginBottom: 6,
  },
  tabela: {
    marginTop: 10,
    marginBottom: 20,
  },
  headerTabela: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 5,
    marginBottom: 5,
    fontWeight: 'bold',
    fontSize: 11,
    color: COR_SECUNDARIA,
  },
  linhaTabela: {
    flexDirection: 'row',
    paddingVertical: 4,
    fontSize: 10,
    color: '#333333',
  },
  colProduto: { width: '55%' },
  colQtd: { width: '15%', textAlign: 'center' },
  colPreco: { width: '15%', textAlign: 'right' },
  colSubtotal: { width: '15%', textAlign: 'right' },
  total: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    paddingTop: 10,
    marginTop: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: COR_SECUNDARIA,
  },
  totalValor: {
    color: COR_PRIMARIA,
    marginLeft: 20,
  },
  rodape: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    paddingTop: 15,
    fontSize: 9,
    color: COR_CINZA,
    textAlign: 'center',
  },
});

interface Item {
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

interface Props {
  pedido: {
    id: number;
    dataPedido: string;
    total: number;
    subtotal: number;
    frete: number;
    itens: Item[];
    endereco?: string;
    bairro?: string;
  };
  cliente: {
    nome: string;
    email: string;
  };
}

export const ReciboPedidoPDF = ({ pedido, cliente }: Props) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho com logo e nome da empresa */}
        <View style={styles.header}>
          <Image src={LOGO_URL} style={styles.logo} />
          <View style={styles.empresa}>
            <Text style={styles.tituloEmpresa}>Origens do Sabor</Text>
            <Text style={styles.subtituloEmpresa}>Restaurante • Chimoio</Text>
            <Text style={styles.subtituloEmpresa}>Rua Cidade de Lichinga, em frente ao Tribunal</Text>
          </View>
        </View>

        <Text style={styles.tituloRecibo}>RECIBO DE PEDIDO</Text>

        {/* Informações do pedido e cliente */}
        <View style={styles.infoPedido}>
          <View style={styles.infoBloco}>
            <Text style={styles.label}>Nº do Pedido</Text>
            <Text style={styles.valor}>#{pedido.id}</Text>
            <Text style={styles.label}>Data</Text>
            <Text style={styles.valor}>{new Date(pedido.dataPedido).toLocaleString('pt-PT')}</Text>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.valor}>{cliente.nome}</Text>
            <Text style={styles.label}>E-mail</Text>
            <Text style={styles.valor}>{cliente.email}</Text>
          </View>
          <View style={styles.infoBloco}>
            {pedido.endereco && (
              <>
                <Text style={styles.label}>Endereço de Entrega</Text>
                <Text style={styles.valor}>{pedido.endereco}</Text>
                <Text style={styles.valor}>{pedido.bairro}</Text>
              </>
            )}
          </View>
        </View>

        {/* Tabela de itens */}
        <View style={styles.tabela}>
          <View style={styles.headerTabela}>
            <Text style={styles.colProduto}>Produto</Text>
            <Text style={styles.colQtd}>Qtd</Text>
            <Text style={styles.colPreco}>Unitário</Text>
            <Text style={styles.colSubtotal}>Subtotal</Text>
          </View>
          {pedido.itens.map((item, idx) => (
            <View key={idx} style={styles.linhaTabela}>
              <Text style={styles.colProduto}>{item.produtoNome}</Text>
              <Text style={styles.colQtd}>{item.quantidade}</Text>
              <Text style={styles.colPreco}>{item.precoUnitario.toFixed(2)} MT</Text>
              <Text style={styles.colSubtotal}>{item.subtotal.toFixed(2)} MT</Text>
            </View>
          ))}
        </View>

        {/* Totais */}
        <View style={styles.total}>
          <Text>Subtotal</Text>
          <Text style={styles.totalValor}>{pedido.subtotal.toFixed(2)} MT</Text>
        </View>
        <View style={styles.total}>
          <Text>Frete</Text>
          <Text style={styles.totalValor}>{pedido.frete.toFixed(2)} MT</Text>
        </View>
        <View style={styles.total}>
          <Text>Total</Text>
          <Text style={styles.totalValor}>{pedido.total.toFixed(2)} MT</Text>
        </View>

        {/* Rodapé */}
        <View style={styles.rodape}>
          <Text>Obrigado pela preferência!</Text>
          <Text>Contactos: +258 84 842 4621 | +258 86 015 1122</Text>
          <Text>© Origens do Sabor – Todos os direitos reservados</Text>
        </View>
      </Page>
    </Document>
  );
};