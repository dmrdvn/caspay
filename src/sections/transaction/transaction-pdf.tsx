import type { TransactionItem } from 'src/actions/transaction';

import { useMemo } from 'react';
import {
  Page,
  Text,
  View,
  Font,
  Image,
  Document,
  PDFViewer,
  StyleSheet,
  PDFDownloadLink,
} from '@react-pdf/renderer';

import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type TransactionPDFProps = {
  transaction?: TransactionItem;
  merchantName?: string;
  merchantEmail?: string;
  merchantLogo?: string;
};

export function TransactionPDFDownload({ transaction, merchantName, merchantEmail, merchantLogo }: TransactionPDFProps) {
  const renderButton = (loading: boolean) => (
    <Tooltip title="Download PDF">
      <IconButton>
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          <Iconify icon="solar:download-minimalistic-bold" />
        )}
      </IconButton>
    </Tooltip>
  );

  return (
    <PDFDownloadLink
      document={<TransactionPdfDocument transaction={transaction} merchantName={merchantName} merchantEmail={merchantEmail} merchantLogo={merchantLogo} />}
      fileName={transaction?.invoice_number || `transaction-${transaction?.id.slice(0, 8)}.pdf`}
      style={{ textDecoration: 'none' }}
    >
      {({ loading }) => renderButton(loading)}
    </PDFDownloadLink>
  );
}

// ----------------------------------------------------------------------

export function TransactionPDFViewer({ transaction, merchantName, merchantEmail, merchantLogo }: TransactionPDFProps) {
  return (
    <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
      <TransactionPdfDocument transaction={transaction} merchantName={merchantName} merchantEmail={merchantEmail} merchantLogo={merchantLogo} />
    </PDFViewer>
  );
}

// ----------------------------------------------------------------------

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

const useStyles = () =>
  useMemo(
    () =>
      StyleSheet.create({
        page: {
          fontSize: 9,
          lineHeight: 1.6,
          fontFamily: 'Roboto',
          backgroundColor: '#FFFFFF',
          padding: '40px 24px 120px 24px',
        },
        footer: {
          left: 0,
          right: 0,
          bottom: 0,
          padding: 24,
          margin: 'auto',
          borderTopWidth: 1,
          borderStyle: 'solid',
          position: 'absolute',
          borderColor: '#e9ecef',
        },
        container: { flexDirection: 'row', justifyContent: 'space-between' },
        mb4: { marginBottom: 4 },
        mb8: { marginBottom: 8 },
        mb40: { marginBottom: 40 },
        h3: { fontSize: 16, fontWeight: 700, lineHeight: 1.2 },
        h4: { fontSize: 12, fontWeight: 700 },
        text1: { fontSize: 10 },
        text2: { fontSize: 9 },
        text1Bold: { fontSize: 10, fontWeight: 700 },
        text2Bold: { fontSize: 9, fontWeight: 700 },
        monospace: { fontSize: 8, fontFamily: 'Courier' },
        infoBox: {
          padding: 12,
          borderRadius: 4,
          backgroundColor: '#f8f9fa',
          marginBottom: 20,
        },
      }),
    []
  );

function TransactionPdfDocument({ transaction, merchantName, merchantEmail, merchantLogo }: TransactionPDFProps) {
  const styles = useStyles();

  if (!transaction) return null;

  const itemName = transaction.product_name || transaction.plan_name || 'N/A';
  const itemDescription = transaction.payment_type === 'subscription'
    ? `${transaction.plan_name} - ${transaction.billing_interval} billing`
    : transaction.product_name || '';

  const renderHeader = () => (
    <View style={[styles.container, styles.mb40]}>
      <Image 
        source={merchantLogo || '/logo/logo-single.png'} 
        style={{ width: 48, height: 48 }} 
      />

      <View style={{ alignItems: 'flex-end', flexDirection: 'column' }}>
        <Text style={[styles.h3, styles.mb8]}>
          {transaction.payment_type === 'product' ? 'PRODUCT SALE' : 'SUBSCRIPTION'}
        </Text>
        <Text style={[styles.text2]}>
          {transaction.invoice_number || `#${transaction.id.slice(0, 8)}`}
        </Text>
      </View>
    </View>
  );

  const renderBillingInfo = () => (
    <View style={[styles.container, styles.mb40]}>
      <View style={{ width: '50%' }}>
        <Text style={[styles.text1Bold, styles.mb4]}>From</Text>
        <Text style={[styles.text2, styles.mb4]}>{merchantName || 'N/A'}</Text>
        {merchantEmail && <Text style={[styles.text2]}>{merchantEmail}</Text>}
      </View>

      <View style={{ width: '50%' }}>
        <Text style={[styles.text1Bold, styles.mb4]}>To</Text>
        {transaction.metadata?.customer_name && (
          <Text style={[styles.text2]}>{transaction.metadata.customer_name}</Text>
        )}
        {transaction.metadata?.customer_email && (
          <Text style={[styles.text2]}>{transaction.metadata.customer_email}</Text>
        )}
        <Text style={[styles.text2, styles.mb4]}>Wallet:</Text>
        <Text style={[styles.monospace]}>{transaction.payer_address}</Text>
      </View>
    </View>
  );

  const renderDates = () => (
    <View style={[styles.container, styles.mb40]}>
      <View style={{ width: '50%' }}>
        <Text style={[styles.text1Bold, styles.mb4]}>Payment Date</Text>
        <Text style={[styles.text2]}>{fDate(transaction.created_at)}</Text>
        <Text style={[styles.text2]}>{fTime(transaction.created_at)}</Text>
      </View>
      {transaction.payment_type === 'subscription' && (
        <View style={{ width: '50%' }}>
          <Text style={[styles.text1Bold, styles.mb4]}>Subscription Period</Text>
          <Text style={[styles.text2]}>
            Start: {transaction.subscription_start ? fDate(transaction.subscription_start) : '-'}
          </Text>
          <Text style={[styles.text2]}>
            End: {transaction.subscription_end ? fDate(transaction.subscription_end) : '-'}
          </Text>
        </View>
      )}
    </View>
  );

  const renderItemDetails = () => (
    <View style={styles.mb40}>
      <Text style={[styles.text1Bold, styles.mb8]}>Item Details</Text>
      <View style={styles.infoBox}>
        <View style={[styles.container, styles.mb8]}>
          <View style={{ width: '70%' }}>
            <Text style={[styles.text1Bold]}>{itemName}</Text>
            {itemDescription && (
              <Text style={[styles.text2]}>{itemDescription}</Text>
            )}
          </View>
          <View style={{ width: '30%', textAlign: 'right' }}>
            <Text style={[styles.h4]}>{transaction.amount} {transaction.token}</Text>
            {transaction.usd_value && (
              <Text style={[styles.text2]}>≈ {fCurrency(transaction.usd_value)}</Text>
            )}
          </View>
        </View>
        {transaction.exchange_rate && (
          <View style={styles.container}>
            <Text style={[styles.text2]}>Exchange Rate</Text>
            <Text style={[styles.text2]}>
              1 {transaction.token} = ${transaction.exchange_rate.toFixed(2)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderBlockchainInfo = () => (
    <View style={styles.mb40}>
      <Text style={[styles.text1Bold, styles.mb8]}>Blockchain Information</Text>
      <View style={styles.infoBox}>
        <Text style={[styles.text2Bold, styles.mb4]}>Transaction Hash</Text>
        <Text style={[styles.monospace, styles.mb8]}>{transaction.transaction_hash}</Text>
        
        {transaction.block_height && (
          <View style={[styles.container, styles.mb4]}>
            <Text style={[styles.text2]}>Block Height</Text>
            <Text style={[styles.text2]}>#{transaction.block_height.toLocaleString()}</Text>
          </View>
        )}
        
        <View style={styles.container}>
          <Text style={[styles.text2]}>Block Timestamp</Text>
          <Text style={[styles.text2]}>
            {fDate(transaction.block_timestamp)} {fTime(transaction.block_timestamp)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={[styles.container, styles.footer]} fixed>
      <View style={{ width: '70%' }}>
        <Text style={[styles.text2Bold, styles.mb4]}>PAYMENT CONFIRMATION</Text>
        <Text style={[styles.text2]}>
          This payment has been confirmed on the Casper blockchain. 
          Transaction is immutable and cannot be reversed.
        </Text>
      </View>
      <View style={{ width: '30%', textAlign: 'right' }}>
        <Text style={[styles.text2Bold, styles.mb4]}>Need Help?</Text>
        <Text style={[styles.text2]}>{merchantEmail || 'Contact merchant support'}</Text>
      </View>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {renderHeader()}
        {renderBillingInfo()}
        {renderDates()}
        {renderItemDetails()}
        {renderBlockchainInfo()}
        {renderFooter()}
      </Page>
    </Document>
  );
}
