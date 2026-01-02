'use client';

import type { SWRConfiguration } from 'swr';
import type { Product, ProductCreateInput, ProductUpdateInput } from 'src/types/product';

import useSWR, { mutate } from 'swr';
import { useMemo, useState, useCallback } from 'react';

import { supabase } from 'src/lib/supabase';
import {
  createProduct as createProductAction,
  updateProduct as updateProductAction,
  deleteProduct as deleteProductAction,
  updateProductStock as updateProductStockAction,
  toggleProductStatus as toggleProductStatusAction,
} from 'src/actions/product';

// ----------------------------------------------------------------------

const SWR_OPTIONS: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,
  errorRetryCount: 3,
  errorRetryInterval: 3000,
};

// ----------------------------------------------------------------------

/**
 * Fetch all products for a specific merchant
 */
async function fetchProducts(merchantId: string | undefined): Promise<Product[]> {
  if (!merchantId) return [];

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []) as Product[];
  } catch (error) {
    console.error('[fetchProducts] Error:', error);
    throw error;
  }
}

/**
 * Fetch a single product by ID
 */
async function fetchProduct(productId: string | undefined): Promise<Product | null> {
  if (!productId) return null;

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) throw error;

    return data as Product;
  } catch (error) {
    console.error('[fetchProduct] Error:', error);
    throw error;
  }
}

/**
 * Fetch product statistics for a merchant
 */
async function fetchProductStats(merchantId: string | undefined) {
  if (!merchantId) return null;

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('active, stock, price')
      .eq('merchant_id', merchantId);

    if (error) throw error;

    const activeProducts = products.filter((p) => p.active).length;
    const totalProducts = products.length;
    const outOfStock = products.filter((p) => p.stock === 0 || p.stock === null).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0);

    return {
      total: totalProducts,
      active: activeProducts,
      inactive: totalProducts - activeProducts,
      outOfStock,
      totalValue,
    };
  } catch (error) {
    console.error('[fetchProductStats] Error:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

/**
 * Hook for fetching all products for a merchant
 * Uses SWR for caching and automatic revalidation
 */
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

// ----------------------------------------------------------------------

/**
 * Hook for fetching a single product by ID
 * Uses SWR for caching and automatic revalidation
 */
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

// ----------------------------------------------------------------------

/**
 * Hook for fetching product statistics for a merchant
 * Uses SWR for caching and automatic revalidation
 */
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

// ----------------------------------------------------------------------

/**
 * Hook for product mutations (create, update, delete)
 * Includes optimistic updates and automatic cache revalidation
 */
export function useProductMutations(merchantId: string | null | undefined) {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Create a new product
   * Merchant ownership is verified via currentMerchant from cache
   */
  const createProduct = useCallback(
    async (data: ProductCreateInput) => {
      if (!merchantId) {
        throw new Error('Merchant ID is required');
      }

      try {
        setIsCreating(true);

        // Create product
        const newProduct = await createProductAction({
          ...data,
          merchant_id: merchantId,
        });

        // Revalidate products list and stats
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

  /**
   * Update an existing product
   */
  const updateProduct = useCallback(
    async (productId: string, data: ProductUpdateInput) => {
      try {
        setIsUpdating(true);

        // Optimistic update
        mutate(
          ['product', productId],
          (currentData: Product | undefined) => {
            if (!currentData) return currentData;
            return { ...currentData, ...data } as Product;
          },
          { revalidate: false }
        );

        // Update product
        const updatedProduct = await updateProductAction(productId, data);

        // Revalidate cache
        await Promise.all([
          mutate(['product', productId]),
          mutate(['products', merchantId]),
          mutate(['product-stats', merchantId]),
        ]);

        return updatedProduct;
      } catch (error) {
        // Rollback on error
        await mutate(['product', productId]);
        console.error('[updateProduct] Error:', error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [merchantId]
  );

  /**
   * Delete a product (soft delete)
   */
  const deleteProduct = useCallback(
    async (productId: string) => {
      try {
        setIsDeleting(true);

        // Optimistic update - remove from list
        mutate(
          ['products', merchantId],
          async (currentData: Product[] | undefined) => {
            if (!currentData) return currentData;
            return currentData.filter((p) => p.id !== productId);
          },
          { revalidate: false }
        );

        // Delete product
        await deleteProductAction(productId);

        // Revalidate cache
        await Promise.all([
          mutate(['products', merchantId]),
          mutate(['product-stats', merchantId]),
        ]);
      } catch (error) {
        // Rollback on error
        await mutate(['products', merchantId]);
        console.error('[deleteProduct] Error:', error);
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    [merchantId]
  );

  /**
   * Toggle product active status
   */
  const toggleStatus = useCallback(
    async (productId: string) => {
      try {
        setIsUpdating(true);

        // Toggle status
        const updatedProduct = await toggleProductStatusAction(productId);

        // Revalidate cache
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

  /**
   * Update product stock
   */
  const updateStock = useCallback(
    async (productId: string, newStock: number) => {
      try {
        setIsUpdating(true);

        // Optimistic update
        mutate(
          ['product', productId],
          (currentData: Product | undefined) => {
            if (!currentData) return currentData;
            return { ...currentData, stock: newStock } as Product;
          },
          { revalidate: false }
        );

        // Update stock
        const updatedProduct = await updateProductStockAction(productId, newStock);

        // Revalidate cache
        await Promise.all([
          mutate(['product', productId]),
          mutate(['products', merchantId]),
          mutate(['product-stats', merchantId]),
        ]);

        return updatedProduct;
      } catch (error) {
        // Rollback on error
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
