'use client';

import type { SWRConfiguration } from 'swr';
import type { Product, ProductCreateInput, ProductUpdateInput } from 'src/types/product';

import useSWR, { mutate } from 'swr';
import { useMemo, useState, useCallback } from 'react';

import {
  getProductsByMerchant as getProductsByMerchantAction,
  getProductById as getProductByIdAction,
  getProductStats as getProductStatsAction,
  createProduct as createProductAction,
  updateProduct as updateProductAction,
  deleteProduct as deleteProductAction,
  updateProductStock as updateProductStockAction,
  toggleProductStatus as toggleProductStatusAction,
} from 'src/actions/product';

const SWR_OPTIONS: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,
  errorRetryCount: 3,
  errorRetryInterval: 3000,
};

async function fetchProducts(merchantId: string | undefined): Promise<Product[]> {
  if (!merchantId) return [];

  try {
    return await getProductsByMerchantAction(merchantId);
  } catch (error) {
    console.error('[fetchProducts] Error:', error);
    throw error;
  }
}

async function fetchProduct(productId: string | undefined): Promise<Product | null> {
  if (!productId) return null;

  try {
    return await getProductByIdAction(productId);
  } catch (error) {
    console.error('[fetchProduct] Error:', error);
    throw error;
  }
}

async function fetchProductStats(merchantId: string | undefined) {
  if (!merchantId) return null;

  try {
    return await getProductStatsAction(merchantId);
  } catch (error) {
    console.error('[fetchProductStats] Error:', error);
    throw error;
  }
}

export function useProducts(merchantId: string | null | undefined) {
  const {
    data: products,
    error,
    isLoading,
    isValidating,
    mutate: revalidate,
  } = useSWR(
    merchantId ? ['products', merchantId] : null,
    () => fetchProducts(merchantId || undefined),
    SWR_OPTIONS
  );

  const memoizedValue = useMemo(
    () => ({
      products: products || [],
      isLoading,
      isValidating,
      error,
      isEmpty: !isLoading && !products?.length,
      refetch: revalidate,
    }),
    [products, isLoading, isValidating, error, revalidate]
  );

  return memoizedValue;
}

export function useProduct(productId: string | null | undefined) {
  const {
    data: product,
    error,
    isLoading,
    isValidating,
    mutate: revalidate,
  } = useSWR(
    productId ? ['product', productId] : null,
    () => fetchProduct(productId || undefined),
    SWR_OPTIONS
  );

  const memoizedValue = useMemo(
    () => ({
      product: product || null,
      isLoading,
      isValidating,
      error,
      refetch: revalidate,
    }),
    [product, isLoading, isValidating, error, revalidate]
  );

  return memoizedValue;
}

export function useProductStats(merchantId: string | null | undefined) {
  const {
    data: stats,
    error,
    isLoading,
    isValidating,
    mutate: revalidate,
  } = useSWR(
    merchantId ? ['product-stats', merchantId] : null,
    () => fetchProductStats(merchantId || undefined),
    SWR_OPTIONS
  );

  const memoizedValue = useMemo(
    () => ({
      stats: stats || null,
      isLoading,
      isValidating,
      error,
      refetch: revalidate,
    }),
    [stats, isLoading, isValidating, error, revalidate]
  );

  return memoizedValue;
}

export function useProductMutations(merchantId: string | null | undefined) {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const createProduct = useCallback(
    async (data: ProductCreateInput) => {
      if (!merchantId) {
        throw new Error('Merchant ID is required');
      }

      try {
        setIsCreating(true);

        const newProduct = await createProductAction({
          ...data,
          merchant_id: merchantId,
        });

        await Promise.all([
          mutate(['products', merchantId]),
          mutate(['product-stats', merchantId]),
        ]);

        return newProduct;
      } catch (error) {
        console.error('[createProduct] Error:', error);
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [merchantId]
  );

  const updateProduct = useCallback(
    async (productId: string, data: ProductUpdateInput) => {
      try {
        setIsUpdating(true);

        mutate(
          ['product', productId],
          (currentData: Product | undefined) => {
            if (!currentData) return currentData;
            return { ...currentData, ...data } as Product;
          },
          { revalidate: false }
        );

        const updatedProduct = await updateProductAction(productId, data);

        await Promise.all([
          mutate(['product', productId]),
          mutate(['products', merchantId]),
          mutate(['product-stats', merchantId]),
        ]);

        return updatedProduct;
      } catch (error) {

        await mutate(['product', productId]);
        console.error('[updateProduct] Error:', error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [merchantId]
  );

  const deleteProduct = useCallback(
    async (productId: string) => {
      try {
        setIsDeleting(true);

        mutate(
          ['products', merchantId],
          async (currentData: Product[] | undefined) => {
            if (!currentData) return currentData;
            return currentData.filter((p) => p.id !== productId);
          },
          { revalidate: false }
        );

        await deleteProductAction(productId);

        await Promise.all([
          mutate(['products', merchantId]),
          mutate(['product-stats', merchantId]),
        ]);
      } catch (error) {
        await mutate(['products', merchantId]);
        console.error('[deleteProduct] Error:', error);
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    [merchantId]
  );

  const toggleStatus = useCallback(
    async (productId: string) => {
      try {
        setIsUpdating(true);

        const updatedProduct = await toggleProductStatusAction(productId);

        await Promise.all([
          mutate(['product', productId]),
          mutate(['products', merchantId]),
          mutate(['product-stats', merchantId]),
        ]);

        return updatedProduct;
      } catch (error) {
        console.error('[toggleStatus] Error:', error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [merchantId]
  );

  const updateStock = useCallback(
    async (productId: string, newStock: number) => {
      try {
        setIsUpdating(true);

        mutate(
          ['product', productId],
          (currentData: Product | undefined) => {
            if (!currentData) return currentData;
            return { ...currentData, stock: newStock } as Product;
          },
          { revalidate: false }
        );

        const updatedProduct = await updateProductStockAction(productId, newStock);

        await Promise.all([
          mutate(['product', productId]),
          mutate(['products', merchantId]),
          mutate(['product-stats', merchantId]),
        ]);

        return updatedProduct;
      } catch (error) {

        await mutate(['product', productId]);
        console.error('[updateStock] Error:', error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [merchantId]
  );

  const memoizedValue = useMemo(
    () => ({
      createProduct,
      updateProduct,
      deleteProduct,
      toggleStatus,
      updateStock,
      isCreating,
      isUpdating,
      isDeleting,
      isMutating: isCreating || isUpdating || isDeleting,
    }),
    [
      createProduct,
      updateProduct,
      deleteProduct,
      toggleStatus,
      updateStock,
      isCreating,
      isUpdating,
      isDeleting,
    ]
  );

  return memoizedValue;
}
