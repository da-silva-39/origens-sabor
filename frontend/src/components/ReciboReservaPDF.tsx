/* eslint-disable @typescript-eslint/no-unused-vars */
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Cores institucionais
const COR_PRIMARIA = '#ff6b35';
const COR_SECUNDARIA = '#2c3e50';
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
  infoBloco: {
    marginBottom: 12,
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
  qrContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  qrImage: {
    width: 120,
    height: 120,
    objectFit: 'contain',
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

interface Props {
  reserva: {
    id: number;
    codigoRecibo: string;
    dataHora: string;
    quantidadePessoas: number;
    status: string;
    observacoes?: string;
    mesa: { numero: number };
    cliente: { nome: string; email: string; telefone?: string };
  };
  qrDataUrl?: string;
}

export const ReciboReservaPDF = ({ reserva, qrDataUrl }: Props) => {
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

        <Text style={styles.tituloRecibo}>RECIBO DE RESERVA</Text>

        {/* Dados da reserva */}
        <View style={styles.infoBloco}>
          <Text style={styles.label}>Código do Recibo</Text>
          <Text style={styles.valor}>{reserva.codigoRecibo}</Text>
        </View>
        <View style={styles.infoBloco}>
          <Text style={styles.label}>Cliente</Text>
          <Text style={styles.valor}>{reserva.cliente.nome}</Text>
        </View>
        <View style={styles.infoBloco}>
          <Text style={styles.label}>E-mail</Text>
          <Text style={styles.valor}>{reserva.cliente.email}</Text>
        </View>
        {reserva.cliente.telefone && (
          <View style={styles.infoBloco}>
            <Text style={styles.label}>Telefone</Text>
            <Text style={styles.valor}>{reserva.cliente.telefone}</Text>
          </View>
        )}
        <View style={styles.infoBloco}>
          <Text style={styles.label}>Mesa</Text>
          <Text style={styles.valor}>{reserva.mesa.numero}</Text>
        </View>
        <View style={styles.infoBloco}>
          <Text style={styles.label}>Data e Hora</Text>
          <Text style={styles.valor}>{new Date(reserva.dataHora).toLocaleString('pt-PT')}</Text>
        </View>
        <View style={styles.infoBloco}>
          <Text style={styles.label}>Quantidade de Pessoas</Text>
          <Text style={styles.valor}>{reserva.quantidadePessoas}</Text>
        </View>
        <View style={styles.infoBloco}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.valor}>
            {reserva.status === 'CONFIRMADA' ? 'Confirmada' : reserva.status}
          </Text>
        </View>
        {reserva.observacoes && (
          <View style={styles.infoBloco}>
            <Text style={styles.label}>Observações</Text>
            <Text style={styles.valor}>{reserva.observacoes}</Text>
          </View>
        )}

        {/* QR Code (se fornecido) */}
        {qrDataUrl && (
          <View style={styles.qrContainer}>
            <Image src={qrDataUrl} style={styles.qrImage} />
            <Text style={{ fontSize: 9, color: COR_CINZA, marginTop: 5 }}>Código de validação</Text>
          </View>
        )}

        {/* Rodapé */}
        <View style={styles.rodape}>
          <Text>Obrigado por reservar no Origens do Sabor!</Text>
          <Text>Contactos: +258 84 842 4621 | +258 86 015 1122</Text>
          <Text>© Origens do Sabor – Todos os direitos reservados</Text>
        </View>
      </Page>
    </Document>
  );
};