/* eslint-disable @typescript-eslint/no-unused-vars */
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { 
    padding: 30, 
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  title: { 
    fontSize: 24, 
    marginBottom: 20, 
    textAlign: 'center', 
    color: '#ff6b35',
    fontWeight: 'bold',
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#ff6b35',
    marginBottom: 20,
    paddingBottom: 10,
  },
  section: { 
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    width: 130,
    color: '#333',
  },
  value: { 
    fontSize: 12, 
    flex: 1,
    color: '#555',
  },
  qrContainer: { 
    alignItems: 'center', 
    marginTop: 20, 
    marginBottom: 20,
  },
  qrImage: { 
    width: 120, 
    height: 120,
  },
  qrText: {
    fontSize: 10,
    color: '#777',
    marginTop: 8,
  },
  footer: { 
    marginTop: 30, 
    textAlign: 'center', 
    fontSize: 10, 
    color: '#aaa',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  highlight: {
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
  },
});

interface ReciboReservaProps {
  reserva: {
    id: number;
    codigoRecibo: string;
    dataHora: string;
    quantidadePessoas: number;
    observacoes?: string;
    status: string;
    cliente: { nome: string; email: string; telefone?: string };
    mesa: { numero: number }; // agora numero
  };
  qrDataUrl?: string;
}

export const ReciboReservaPDF = ({ reserva, qrDataUrl }: ReciboReservaProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Origens do Sabor</Text>
        <Text style={{ fontSize: 12, textAlign: 'center', color: '#666' }}>Recibo de Reserva</Text>
      </View>

      <View style={styles.highlight}>
        <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>Código do Recibo: {reserva.codigoRecibo}</Text>
        <Text style={{ fontSize: 10, color: '#666' }}>Apresente este comprovativo no restaurante.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Cliente:</Text>
        <Text style={styles.value}>{reserva.cliente.nome}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>E-mail:</Text>
        <Text style={styles.value}>{reserva.cliente.email}</Text>
      </View>
      {reserva.cliente.telefone && (
        <View style={styles.section}>
          <Text style={styles.label}>Telefone:</Text>
          <Text style={styles.value}>{reserva.cliente.telefone}</Text>
        </View>
      )}
      <View style={styles.section}>
        <Text style={styles.label}>Mesa reservada:</Text>
        <Text style={styles.value}>Mesa {reserva.mesa.numero}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Data e Hora:</Text>
        <Text style={styles.value}>{new Date(reserva.dataHora).toLocaleString('pt-PT')}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Quantidade de Pessoas:</Text>
        <Text style={styles.value}>{reserva.quantidadePessoas}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>
          {reserva.status === 'CONFIRMADA' ? '✓ Confirmada' : reserva.status}
        </Text>
      </View>
      {reserva.observacoes && (
        <View style={styles.section}>
          <Text style={styles.label}>Observações:</Text>
          <Text style={styles.value}>{reserva.observacoes}</Text>
        </View>
      )}

      {qrDataUrl && (
        <View style={styles.qrContainer}>
          <Image src={qrDataUrl} style={styles.qrImage} />
          <Text style={styles.qrText}>Escanear para validar a reserva</Text>
        </View>
      )}

      <Text style={styles.footer}>
        Origens do Sabor - Rua Cidade de Lichinga, Chimoio - +258 86 015 1122
      </Text>
    </Page>
  </Document>
);