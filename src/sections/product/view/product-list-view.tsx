'use client';

import type {
  GridColDef,
  GridRowSelectionModel,
  GridColumnVisibilityModel,
} from '@mui/x-data-grid';
import type { Product, IProductTableFilters } from 'src/types/product';

import { useMemo, useState, useCallback } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { DataGrid, gridClasses } from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';
import { useProducts, useMerchants, useProductMutations } from 'src/hooks';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useToolbarSettings, CustomGridActionsCellItem } from 'src/components/custom-data-grid';

import { ProductTableToolbar } from '../product-table-toolbar';
import {
  RenderCellStock,
  RenderCellPrice,
  RenderCellProduct,
  RenderCellPublish,
  RenderCellCreatedAt,
} from '../product-table-row';

// ----------------------------------------------------------------------

const STOCK_OPTIONS = [
  { value: 'in_stock', label: 'In stock' },
  { value: 'low_stock', label: 'Low stock' },
  { value: 'out_of_stock', label: 'Out of stock' },
];

const ACTIVE_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const HIDE_COLUMNS = {};
const HIDE_COLUMNS_TOGGLABLE = ['actions'];

// ----------------------------------------------------------------------

export function ProductListView() {
  const confirmDialog = useBoolean();
  const toolbarOptions = useToolbarSettings();

  // Get current merchant from context
  const { currentMerchant } = useMerchants();
  const merchantId = currentMerchant?.id;

  const { products, isLoading, refetch } = useProducts(merchantId);
  const { deleteProduct, toggleStatus } = useProductMutations(merchantId);

  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set(),
  });

  const filters = useSetState<IProductTableFilters>({
    active: [],
    stock: [],
  });

  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>(HIDE_COLUMNS);

  const canReset = filters.state.active.length > 0 || filters.state.stock.length > 0;

  const dataFiltered = applyFilter({
    inputData: products || [],
    filters: filters.state,
  });

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await deleteProduct(id);
        toast.success('Product deleted successfully!');
        refetch();
      } catch (error) {
        toast.error('Failed to delete product');
        console.error(error);
      }
    },
    [deleteProduct, refetch]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      const deletePromises = Array.from(selectedRows.ids).map((id) =>
        deleteProduct(id as string)
      );
      await Promise.all(deletePromises);
      toast.success(`${selectedRows.ids.size} products deleted successfully!`);
      refetch();
      confirmDialog.onFalse();
    } catch (error) {
      toast.error('Failed to delete products');
      console.error(error);
    }
  }, [selectedRows.ids, deleteProduct, refetch, confirmDialog]);

  const handleToggleStatus = useCallback(
    async (id: string) => {
      try {
        await toggleStatus(id);
        toast.success('Product status updated!');
        refetch();
      } catch (error) {
        toast.error('Failed to update product status');
        console.error(error);
      }
    },
    [toggleStatus, refetch]
  );

  const columns = useGetColumns({
    onDeleteRow: handleDeleteRow,
    onToggleStatus: handleToggleStatus,
  });

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete Products"
      content={
        <>
          Are you sure you want to delete <strong>{selectedRows.ids.size}</strong> products?
        </>
      }
      action={
        <Button variant="contained" color="error" onClick={handleDeleteRows}>
          Delete
        </Button>
      }
    />
  );

  // Show message if no merchant selected
  if (!currentMerchant) {
    return (
      <DashboardContent maxWidth="xl">
        <EmptyContent
          filled
          title="No merchant selected"
          description="Please select a merchant from the top menu to manage products"
          sx={{ py: 10 }}
        />
      </DashboardContent>
    );
  }

  return (
    <>
      <DashboardContent maxWidth="xl" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="Products"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: currentMerchant.store_name },
            { name: 'Products' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.product.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Add Product
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card
          sx={{
            minHeight: 640,
            flexGrow: { md: 1 },
            display: { md: 'flex' },
            height: { xs: 800, md: '1px' },
            flexDirection: { md: 'column' },
          }}
        >
          <DataGrid
            {...toolbarOptions.settings}
            checkboxSelection
            disableRowSelectionOnClick
            rows={dataFiltered}
            columns={columns}
            loading={isLoading}
            getRowHeight={() => 'auto'}
            pageSizeOptions={[5, 10, 20, { value: -1, label: 'All' }]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
            onRowSelectionModelChange={(newSelectionModel) => setSelectedRows(newSelectionModel)}
            slots={{
              noRowsOverlay: () => <EmptyContent title="No products yet" />,
              noResultsOverlay: () => <EmptyContent title="No results found" />,
              toolbar: () => (
                <ProductTableToolbar
                  filters={filters}
                  canReset={canReset}
                  filteredResults={dataFiltered.length}
                  selectedRowCount={selectedRows.ids.size}
                  onOpenConfirmDeleteRows={confirmDialog.onTrue}
                  options={{ stocks: STOCK_OPTIONS, publishs: ACTIVE_OPTIONS }}
                  settings={toolbarOptions.settings}
                  onChangeSettings={toolbarOptions.onChangeSettings}
                />
              ),
            }}
            slotProps={{
              columnsManagement: {
                getTogglableColumns: () =>
                  columns
                    .filter((col) => !HIDE_COLUMNS_TOGGLABLE.includes(col.field))
                    .map((col) => col.field),
              },
            }}
            sx={{
              [`& .${gridClasses.cell}`]: {
                display: 'flex',
                alignItems: 'center',
              },
            }}
          />
        </Card>
      </DashboardContent>

      {renderConfirmDialog()}
    </>
  );
}

// ----------------------------------------------------------------------

type UseGetColumnsProps = {
  onDeleteRow: (id: string) => void;
  onToggleStatus: (id: string) => void;
};

const useGetColumns = ({ onDeleteRow, onToggleStatus }: UseGetColumnsProps) => {
  const theme = useTheme();

  const columns: GridColDef<Product>[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Product',
        flex: 1,
        minWidth: 200,
        sortable: false,
        filterable: false,
        hideable: false,
        renderCell: (params) => (
          <RenderCellProduct
            params={params}
            href={paths.dashboard.product.details(params.row.id)}
            coverUrl={params.row.image_url || ''}
          />
        ),
      },
      {
        field: 'product_id',
        headerName: 'Product ID',
        flex: 1,
        minWidth: 150,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
            {params.row.product_id}
          </Typography>
        ),
      },
      {
        field: 'price',
        headerName: 'Price',
        flex: 0.8,
        minWidth: 120,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <RenderCellPrice
            params={params}
            price={params.row.price}
            currency={params.row.currency}
          />
        ),
      },
      {
        field: 'token_address',
        headerName: 'Token',
        flex: 0.6,
        minWidth: 100,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Chip
            label={params.row.token_address === 'NATIVE' ? 'CSPR' : 'CEP-18'}
            size="small"
            color={params.row.token_address === 'NATIVE' ? 'primary' : 'secondary'}
            variant="soft"
          />
        ),
      },
      {
        field: 'stock',
        headerName: 'Inventory',
        flex: 0.9,
        minWidth: 140,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          if (!params.row.track_inventory) {
            return (
              <Chip
                label="No tracking"
                size="small"
                variant="outlined"
                color="default"
              />
            );
          }

          const inventoryType = params.row.stock && params.row.stock > 0
            ? params.row.stock > 10
              ? 'in_stock'
              : 'low_stock'
            : 'out_of_stock';

          return <RenderCellStock params={params} inventoryType={inventoryType} />;
        },
      },
      {
        field: 'active',
        headerName: 'Status',
        flex: 0.6,
        minWidth: 100,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <RenderCellPublish params={params} publish={params.row.active ? 'active' : 'inactive'} />
        ),
      },
      {
        field: 'created_at',
        headerName: 'Created',
        flex: 0.9,
        minWidth: 140,
        sortable: false,
        filterable: false,
        renderCell: (params) => <RenderCellCreatedAt params={params} />,
      },
      {
        type: 'actions',
        field: 'actions',
        headerName: ' ',
        width: 80,
        align: 'right',
        headerAlign: 'right',
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        getActions: (params) => [
          <CustomGridActionsCellItem
            showInMenu
            label="View"
            icon={<Iconify icon="solar:eye-bold" />}
            href={paths.dashboard.product.details(params.row.id)}
          />,
          <CustomGridActionsCellItem
            showInMenu
            label="Edit"
            icon={<Iconify icon="solar:pen-bold" />}
            href={paths.dashboard.product.edit(params.row.id)}
          />,
          <CustomGridActionsCellItem
            showInMenu
            label={params.row.active ? 'Deactivate' : 'Activate'}
            icon={
              <Iconify
                icon={params.row.active ? 'solar:eye-closed-bold' : 'solar:eye-bold'}
              />
            }
            onClick={() => onToggleStatus(params.row.id)}
          />,
          <CustomGridActionsCellItem
            showInMenu
            label="Delete"
            icon={<Iconify icon="solar:trash-bin-trash-bold" />}
            onClick={() => onDeleteRow(params.row.id)}
            style={{ color: theme.vars.palette.error.main }}
          />,
        ],
      },
    ],
    [onDeleteRow, onToggleStatus, theme.vars.palette.error.main]
  );

  return columns;
};

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  inputData: Product[];
  filters: IProductTableFilters;
};

function applyFilter({ inputData, filters }: ApplyFilterProps) {
  const { stock, active } = filters;

  let filteredData = inputData;

  // Filter by active status
  if (active.length) {
    filteredData = filteredData.filter((product) =>
      active.includes(product.active ? 'active' : 'inactive')
    );
  }

  // Filter by stock status
  if (stock.length) {
    filteredData = filteredData.filter((product) => {
      if (!product.track_inventory) return stock.includes('in_stock');

      const stockValue = product.stock || 0;
      const stockStatus =
        stockValue === 0 ? 'out_of_stock' : stockValue <= 10 ? 'low_stock' : 'in_stock';

      return stock.includes(stockStatus);
    });
  }

  return filteredData;
}
