'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';

import { useProducts, useMerchants, useProductMutations } from 'src/hooks';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  TableNoData,
  TableHeadCustom,
  TableSelectedAction,
} from 'src/components/table';

import { ProductTableRow } from '../product-table-row';

const TABLE_HEAD = [
  { id: 'name', label: 'Product', width: 250 },
  { id: 'product_id', label: 'Product ID', width: 50 },
  { id: 'price', label: 'Price', width: 80 },
  { id: 'token', label: 'Token', width: 80 },
  { id: 'stock', label: 'Inventory', width: 100 },
  { id: 'status', label: 'Status', width: 80 },
  { id: 'created_at', label: 'Created', width: 100 },
  { id: 'actions', label: 'Actions', width: 48 },
];

export function ProductListView() {
  const router = useRouter();
  
  const { currentMerchant } = useMerchants();
  const merchantId = currentMerchant?.id;
  
  const { products, isLoading, refetch } = useProducts(merchantId);
  const { deleteProduct } = useProductMutations(merchantId);

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleNewProduct = useCallback(() => {
    router.push(paths.dashboard.product.new);
  }, [router]);

  const handleSelectRow = useCallback((id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAllRows = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedRows(products.map((product) => product.id));
      } else {
        setSelectedRows([]);
      }
    },
    [products]
  );

  const handleDeleteSelected = useCallback(async () => {
    try {
      await Promise.all(selectedRows.map((id) => deleteProduct(id)));
      setSelectedRows([]);
      await refetch();
    } catch (error) {
      console.error('Error deleting products:', error);
    }
  }, [selectedRows, deleteProduct, refetch]);

  const notFound = !isLoading && !products.length;

  if (!currentMerchant) {
    return (
      <Container maxWidth="xl">
        <EmptyContent
          filled
          title="No merchant selected"
          description="Please select a merchant from the top menu to manage products"
          sx={{ py: 10 }}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Products"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Products' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleNewProduct}
          >
            Add Product
          </Button>
        }
        sx={{ mb: 3 }}
      />

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 5 }}>
        Manage your products and track inventory.
      </Typography>

      <Card>
        {selectedRows.length > 0 && (
          <TableSelectedAction
            dense={false}
            numSelected={selectedRows.length}
            rowCount={products.length}
            onSelectAllRows={(checked) => handleSelectAllRows(checked)}
            action={
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                  onClick={handleDeleteSelected}
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
                orderBy="name"
                headCells={TABLE_HEAD}
                rowCount={products.length}
                numSelected={selectedRows.length}
                onSort={() => {}}
                onSelectAllRows={(checked) => handleSelectAllRows(checked)}
              />

              <TableBody>
                {products.map((product) => (
                  <ProductTableRow
                    key={product.id}
                    row={product}
                    selected={selectedRows.includes(product.id)}
                    onSelectRow={() => handleSelectRow(product.id)}
                    onDeleteSuccess={refetch}
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
