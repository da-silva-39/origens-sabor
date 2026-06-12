import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  section: { marginBottom: 10 },
  label: { fontSize: 12, fontWeight: 'bold' },
  value: { fontSize: 12, marginBottom: 5 },
  table: { marginTop: 20, marginBottom: 20 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 5 },
  tableRow: { flexDirection: 'row', marginBottom: 5 },
  col1: { width: '60%' },
  col2: { width: '20%', textAlign: 'right' },
  col3: { width: '20%', textAlign: 'right' },
  footer: { marginTop: 30, textAlign: 'center', fontSize: 10, color: 'gray' },
});

interface ReciboPedidoProps {
  pedido: {
    id: number;
    dataPedido: string;
    total: number;
    itens: Array<{ produtoNome: string; quantidade: number; precoUnitario: number; subtotal: number }>;
    endereco?: string;
    bairro?: string;
  };
  cliente: { nome: string; email: string };
}

export const ReciboPedidoPDF = ({ pedido, cliente }: ReciboPedidoProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Recibo de Pedido</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Pedido Nº:</Text>
        <Text style={styles.value}>{pedido.id}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Cliente:</Text>
        <Text style={styles.value}>{cliente.nome}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Data:</Text>
        <Text style={styles.value}>{new Date(pedido.dataPedido).toLocaleString('pt-PT')}</Text>
      </View>
      {pedido.endereco && (
        <View style={styles.section}>
          <Text style={styles.label}>Endereço de Entrega:</Text>
          <Text style={styles.value}>{pedido.endereco} - {pedido.bairro}</Text>
        </View>
      )}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Produto</Text>
          <Text style={styles.col2}>Qtd</Text>
          <Text style={styles.col3}>Subtotal</Text>
        </View>
        {pedido.itens.map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={styles.col1}>{item.produtoNome}</Text>
            <Text style={styles.col2}>{item.quantidade}</Text>
            <Text style={styles.col3}>{item.subtotal.toFixed(2)} MT</Text>
          </View>
        ))}
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Total:</Text>
        <Text style={styles.value}>{pedido.total.toFixed(2)} MT</Text>
      </View>
      <Text style={styles.footer}>Obrigado pela preferência! Origens do Sabor.</Text>
    </Page>
  </Document>
);