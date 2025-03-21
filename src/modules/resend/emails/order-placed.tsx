import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { BigNumberValue, OrderDTO } from '@medusajs/framework/types';

type OrderPlacedEmailProps = {
  order: OrderDTO;
};

export const OrderPlacedEmailComponent = ({ order }: OrderPlacedEmailProps) => {
  // Si tu OrderDTO no tiene `created_at`,
  // podrías manejarlo con otra fecha o remover esta parte.
  const invoiceDate = new Date().toLocaleDateString();

  // Formatter para la moneda
  const formatter = new Intl.NumberFormat([], {
    style: 'currency',
    currencyDisplay: 'narrowSymbol',
    currency: order.currency_code,
  });

  const formatPrice = (price: BigNumberValue) => {
    if (typeof price === 'number') {
      return formatter.format(price);
    }
    if (typeof price === 'string') {
      return formatter.format(parseFloat(price));
    }
    return price?.toString() || '';
  };

  return (
    <Html>
      <Head />
      <Body style={main}>
        {/* Preview es el texto que aparece como preview en algunos clientes de correo */}
        <Preview>Recibo de compra</Preview>

        <Container style={container}>
          {/* Encabezado */}
          <Section>
            <Row>
              <Column>
                <Img
                  src="https://cota-admin-dashboard-dev.s3.us-east-1.amazonaws.com/omegakrill/logo-omega-krill.svg"
                  width="150"
                  height="42"
                  alt="Logo"
                />
              </Column>
              <Column align="right" style={tableCell}>
                <Text style={heading}>Recibo</Text>
              </Column>
            </Row>
          </Section>

          {/* Información principal del pedido */}
          <Section style={informationTable}>
            <Row style={informationTableRow}>
              <Column colSpan={2}>
                <Section>
                  <Row>
                    <Column style={informationTableColumn}>
                      <Text style={informationTableLabel}>EMAIL</Text>
                      <Link
                        style={{
                          ...informationTableValue,
                          color: '#15c',
                          textDecoration: 'underline',
                        }}
                      >
                        {order.email}
                      </Link>
                    </Column>
                  </Row>

                  <Row>
                    <Column style={informationTableColumn}>
                      <Text style={informationTableLabel}>FECHA DE COMPRA</Text>
                      <Text style={informationTableValue}>{invoiceDate}</Text>
                    </Column>
                  </Row>

                  <Row>
                    <Column style={informationTableColumn}>
                      <Text style={informationTableLabel}>NO. ORDEN</Text>
                      <Link
                        style={{
                          ...informationTableValue,
                          color: '#15c',
                          textDecoration: 'underline',
                        }}
                      >
                        {order.id}
                      </Link>
                    </Column>
                    <Column style={informationTableColumn}>
                      <Text style={informationTableLabel}>NO. DOCUMENTO</Text>
                      <Text style={informationTableValue}>
                        {/* Ajusta o elimina si no lo ocupas */}
                        186623754793
                      </Text>
                    </Column>
                  </Row>
                </Section>
              </Column>

              {/* DATOS DE PAGO - aquí pones info de dirección de facturación o pago */}
              <Column style={informationTableColumn} colSpan={2}>
                <Text style={informationTableLabel}>DATOS DE PAGO</Text>
                <Text style={informationTableValue}>
                  {/* Podrías poner "Visa .... 7461" o el método de pago que tengas */}
                  Pago con Tarjeta
                </Text>
                <Text style={informationTableValue}>{order.email}</Text>
                <Text style={informationTableValue}>
                  {/* Si tuvieras dirección */}
                  Dirección de facturación
                </Text>
                <Text style={informationTableValue}>Ciudad, Estado, País</Text>
              </Column>
            </Row>
          </Section>

          {/* Título de productos/Sección de Items */}
          <Section style={productTitleTable}>
            <Text style={productsTitle}>Productos</Text>
          </Section>

          {/* Mapeo de los items del pedido */}
          {order.items?.map((item) => (
            <Section key={item.id}>
              <Row>
                <Column style={{ width: '64px' }}>
                  <Img
                    // Si no tienes thumbnail real, deja placeholder
                    src={
                      item.thumbnail ||
                      'https://cota-admin-dashboard-dev.s3.us-east-1.amazonaws.com/omegakrill/1envase-2x.png'
                    }
                    width="64"
                    height="64"
                    alt={item.product_title || ''}
                    style={productIcon}
                  />
                </Column>
                <Column style={{ paddingLeft: '22px' }}>
                  <Text style={productTitle}>{item.product_title}</Text>
                  <Text style={productDescription}>{item.variant_title}</Text>
                  <Text style={productDescription}>
                    Cantidad: {item.quantity}
                  </Text>
                </Column>
                <Column style={productPriceWrapper} align="right">
                  <Text style={productPrice}>
                    {formatPrice(item.original_total)}
                  </Text>
                </Column>
              </Row>
            </Section>
          ))}

          {/* Separador */}
          <Hr style={productPriceLine} />

          {/* Totales */}
          <Section align="right">
            <Row>
              <Column style={tableCell} align="right">
                <Text style={productPriceTotal}>TOTAL</Text>
              </Column>
              <Column style={productPriceLine} />
              <Column style={productPriceLargeWrapper}>
                <Text style={productPriceLarge}>
                  {formatPrice(order.total)}
                </Text>
              </Column>
            </Row>
          </Section>
          <Hr style={productPriceLineBottom} />

          {/* Secciones adicionales (descuentos, disclaimers, links...) */}
          <Text style={footerText}>
            ¡Gracias por tu compra! Cualquier duda, contáctanos.
          </Text>

          {/* Footer con datos legales o enlaces */}
          <Section>
            <Row>
              <Column align="center" style={footerIcon}>
                <Img
                  src="https://cota-admin-dashboard-dev.s3.us-east-1.amazonaws.com/omegakrill/logos-desktop.svg"
                  width="250"
                  height="150"
                  alt="Logo"
                />
              </Column>
            </Row>
          </Section>

          <Text style={footerLinksWrapper}>
            <Link href="https://ejemplo.com/account">Cuenta</Link> •{' '}
            <Link href="https://ejemplo.com/terms">Términos de uso</Link> •{' '}
            <Link href="https://ejemplo.com/privacy">
              Política de Privacidad
            </Link>
          </Text>
          <Text style={footerCopyright}>
            © 2025 Naturalim <br />
            <Link href="https://ejemplo.com/legal">
              Todos los derechos reservados
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

/* --- Estilos (idénticos al ejemplo OrderPlacedEmailComponent, sin cambios) --- */
const main = {
  fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif',
  backgroundColor: '#ffffff',
};

const resetText = {
  margin: '0',
  padding: '0',
  lineHeight: 1.4,
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '660px',
  maxWidth: '100%',
};

const tableCell = { display: 'table-cell' };

const heading = {
  fontSize: '32px',
  fontWeight: '300',
  color: '#888888',
};

const informationTable = {
  borderCollapse: 'collapse' as const,
  borderSpacing: '0px',
  color: 'rgb(51,51,51)',
  backgroundColor: 'rgb(250,250,250)',
  borderRadius: '3px',
  fontSize: '12px',
};

const informationTableRow = {
  height: '46px',
};

const informationTableColumn = {
  paddingLeft: '20px',
  borderStyle: 'solid',
  borderColor: 'white',
  borderWidth: '0px 1px 1px 0px',
  height: '44px',
};

const informationTableLabel = {
  ...resetText,
  color: 'rgb(102,102,102)',
  fontSize: '10px',
};

const informationTableValue = {
  fontSize: '12px',
  margin: '0',
  padding: '0',
  lineHeight: 1.4,
};

const productTitleTable = {
  ...informationTable,
  margin: '30px 0 15px 0',
  height: '24px',
};

const productsTitle = {
  background: '#fafafa',
  paddingLeft: '10px',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const productIcon = {
  margin: '0 0 0 20px',
  borderRadius: '14px',
  border: '1px solid rgba(128,128,128,0.2)',
};

const productTitle = { fontSize: '12px', fontWeight: '600', ...resetText };

const productDescription = {
  fontSize: '12px',
  color: 'rgb(102,102,102)',
  ...resetText,
};

const productPriceWrapper = {
  display: 'table-cell',
  padding: '0px 20px 0px 0px',
  width: '100px',
  verticalAlign: 'top',
};

const productPrice = {
  fontSize: '12px',
  fontWeight: '600',
  margin: '0',
};

const productPriceLine = { margin: '30px 0 0 0' };

const productPriceLineBottom = { margin: '0 0 75px 0' };

const productPriceTotal = {
  margin: '0',
  color: 'rgb(102,102,102)',
  fontSize: '10px',
  fontWeight: '600',
  padding: '0px 30px 0px 0px',
  textAlign: 'right' as const,
};

const productPriceLargeWrapper = { display: 'table-cell', width: '90px' };

const productPriceLarge = {
  margin: '0px 20px 0px 0px',
  fontSize: '16px',
  fontWeight: '600',
  whiteSpace: 'nowrap' as const,
  textAlign: 'right' as const,
};

const footerText = {
  fontSize: '12px',
  color: 'rgb(102,102,102)',
  margin: '0',
  lineHeight: 'auto',
  marginBottom: '16px',
};

const footerIcon = { display: 'block', margin: '40px 0 0 0' };

const footerLinksWrapper = {
  margin: '8px 0 0 0',
  textAlign: 'center' as const,
  fontSize: '12px',
  color: 'rgb(102,102,102)',
};

const footerCopyright = {
  margin: '25px 0 0 0',
  textAlign: 'center' as const,
  fontSize: '12px',
  color: 'rgb(102,102,102)',
};

export const orderPlacedEmail = (props: OrderPlacedEmailProps) => (
  <OrderPlacedEmailComponent {...props} />
);
