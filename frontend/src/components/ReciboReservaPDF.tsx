/* eslint-disable @typescript-eslint/no-unused-vars */
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  section: { marginBottom: 10 },
  label: { fontSize: 12, fontWeight: 'bold' },
  value: { fontSize: 12, marginBottom: 10 },
  footer: { marginTop: 30, textAlign: 'center', fontSize: 10, color: 'gray' },
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
    mesa: { numero: number };
  };
}

export const ReciboReservaPDF = ({ reserva }: ReciboReservaProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Recibo de Reserva</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Código do Recibo:</Text>
        <Text style={styles.value}>{reserva.codigoRecibo}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Cliente:</Text>
        <Text style={styles.value}>{reserva.cliente.nome}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{reserva.cliente.email}</Text>
      </View>
      {reserva.cliente.telefone && (
        <View style={styles.section}>
          <Text style={styles.label}>Telefone:</Text>
          <Text style={styles.value}>{reserva.cliente.telefone}</Text>
        </View>
      )}
      <View style={styles.section}>
        <Text style={styles.label}>Mesa:</Text>
        <Text style={styles.value}>{reserva.mesa.numero}</Text>
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
        <Text style={styles.value}>{reserva.status}</Text>
      </View>
      {reserva.observacoes && (
        <View style={styles.section}>
          <Text style={styles.label}>Observações:</Text>
          <Text style={styles.value}>{reserva.observacoes}</Text>
        </View>
      )}
      <Text style={styles.footer}>Obrigado por reservar no Origens do Sabor! Apresente este recibo no restaurante.</Text>
    </Page>
  </Document>
);