import type { TransactionItem } from 'src/types/transaction';

import dynamic from 'next/dynamic';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import DialogActions from '@mui/material/DialogActions';

import { useMerchants } from 'src/hooks';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const TransactionPDFDownload = dynamic(
  () => import('./transaction-pdf').then((mod) => mod.TransactionPDFDownload),
  { ssr: false }
);

const TransactionPDFViewer = dynamic(
  () => import('./transaction-pdf').then((mod) => mod.TransactionPDFViewer),
  { ssr: false }
);

// ----------------------------------------------------------------------

type Props = {
  transaction?: TransactionItem;
};

export function TransactionToolbar({ transaction }: Props) {
  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();
  const { currentMerchant } = useMerchants();

  const renderDownloadButton = () =>
    transaction ? (
      <TransactionPDFDownload
        transaction={transaction}
        merchantName={currentMerchant?.store_name}
        merchantEmail={currentMerchant?.support_email ?? undefined}
        merchantLogo={currentMerchant?.logo_url ?? undefined}
      />
    ) : null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Transaction ${transaction?.invoice_number || transaction?.id}`,
        text: `Transaction details for ${transaction?.amount} ${transaction?.token}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const renderDetailsDialog = () => (
    <Dialog fullScreen open={open}>
      <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
        <DialogActions sx={{ p: 1.5 }}>
          <Button color="inherit" variant="contained" onClick={onClose}>
            Close
          </Button>
        </DialogActions>
        <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
          {transaction && (
            <TransactionPDFViewer
              transaction={transaction}
              merchantName={currentMerchant?.store_name}
              merchantEmail={currentMerchant?.support_email ?? undefined}
              merchantLogo={currentMerchant?.logo_url ?? undefined}
            />
          )}
        </Box>
      </Box>
    </Dialog>
  );

  return (
    <>
      <Box
        sx={{
          gap: 3,
          display: 'flex',
          mb: { xs: 3, md: 5 },
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-end', sm: 'center' },
        }}
      >
        <Box
          sx={{
            gap: 1,
            width: 1,
            flexGrow: 1,
            display: 'flex',
          }}
        >
          <Tooltip title="View PDF">
            <IconButton onClick={onOpen}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>

          {renderDownloadButton()}

          <Tooltip title="Print">
            <IconButton onClick={handlePrint}>
              <Iconify icon="solar:printer-minimalistic-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Share">
            <IconButton onClick={handleShare}>
              <Iconify icon="solar:share-bold" />
            </IconButton>
          </Tooltip>

          {transaction?.transaction_hash && (
            <Tooltip title="View on Explorer">
              <IconButton
                component="a"
                href={`https://testnet.cspr.live/deploy/${transaction.transaction_hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Iconify icon="solar:link-bold" />
              </IconButton>
            </Tooltip>
          )}

          {transaction?.invoice_url && (
            <Tooltip title="Download Invoice">
              <IconButton
                component="a"
                href={transaction.invoice_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Iconify icon="solar:document-text-bold" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {renderDetailsDialog()}
    </>
  );
}
