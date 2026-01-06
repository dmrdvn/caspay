'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';

import { usePayLinks } from 'src/hooks/use-paylinks';
import { useMerchants } from 'src/hooks';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  TableNoData,
  TableHeadCustom,
  TableSelectedAction,
} from 'src/components/table';

import { PayLinkTableRow } from 'src/sections/paylink/paylink-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'product_name', label: 'Product' },
  { id: 'slug', label: 'Link' },
  { id: 'status', label: 'Status', width: 100 },
  { id: 'views', label: 'Views', width: 100 },
  { id: 'payments', label: 'Payments', width: 100 },
  { id: 'conversion', label: 'Conv. Rate', width: 120 },
  { id: 'revenue', label: 'Revenue', width: 120 },
  { id: 'usage', label: 'Usage', width: 100 },
  { id: 'created_at', label: 'Created', width: 140 },
  { id: 'actions', label: 'Actions', width: 88 },
];

// ----------------------------------------------------------------------

export function PayLinkListView() {
  const router = useRouter();
  
  // Get current merchant from context
  const { currentMerchant } = useMerchants();
  const merchantId = currentMerchant?.id;
  
  const { paylinks, isLoading } = usePayLinks(merchantId);

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleNewPayLink = useCallback(() => {
    router.push(paths.dashboard.payLink.new);
  }, [router]);

  const handleSelectRow = useCallback((id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAllRows = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedRows(paylinks.map((paylink) => paylink.id));
      } else {
        setSelectedRows([]);
      }
    },
    [paylinks]
  );

  const notFound = !isLoading && !paylinks.length;

  // Show message if no merchant selected
  if (!currentMerchant) {
    return (
      <Container maxWidth="xl">
        <EmptyContent
          filled
          title="No merchant selected"
          description="Please select a merchant from the top menu to manage PayLinks"
          sx={{ py: 10 }}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="PayLinks"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'PayLinks' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleNewPayLink}
          >
            Create PayLink
          </Button>
        }
        sx={{ mb: 3 }}
      />

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 5 }}>
        Create payment links to accept one-time payments. Share via email, social media, or embed on
        your website.
      </Typography>

      <Card>
        {selectedRows.length > 0 && (
          <TableSelectedAction
            dense={false}
            numSelected={selectedRows.length}
            rowCount={paylinks.length}
            onSelectAllRows={(checked) => handleSelectAllRows(checked)}
            action={
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                >
                  Delete
                </Button>
              </Stack>
            }
          />
        )}

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size="medium" sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order="asc"
                orderBy="product_name"
                headCells={TABLE_HEAD}
                rowCount={paylinks.length}
                numSelected={selectedRows.length}
                onSort={() => {}}
                onSelectAllRows={(checked) => handleSelectAllRows(checked)}
              />

              <TableBody>
                {paylinks.map((paylink) => (
                  <PayLinkTableRow
                    key={paylink.id}
                    row={paylink}
                    selected={selectedRows.includes(paylink.id)}
                    onSelectRow={() => handleSelectRow(paylink.id)}
                  />
                ))}

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      </Card>
    </Container>
  );
}
