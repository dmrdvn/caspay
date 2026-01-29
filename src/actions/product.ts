'use server';

import type { Product, ProductCreateInput, ProductUpdateInput } from 'src/types/product';

import { createServerSupabaseClient } from 'src/lib/supabase-server';

export async function getProductsByMerchant(merchantId: string): Promise<Product[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error(error.message);
  }

  return data as Product[];
}

export async function getProductById(productId: string): Promise<Product | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching product:', error);
    throw new Error(error.message);
  }

  return data as Product;
}

export async function createProduct(input: ProductCreateInput): Promise<Product> {
  const supabase = await createServerSupabaseClient();
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  const productId = input.product_id || `prod_${timestamp}_${random}`;

  const productData = {
    merchant_id: input.merchant_id,
    product_id: productId,
    name: input.name,
    description: input.description || null,
    price: input.price,
    currency: input.currency || 'CSPR',
    token_address: input.token_address || 'hash-de04671ba6226ecbb4c4e09c256459d2dec2d7dab305b5e57825894c07607069',
    image_url: input.image_url || null,
    images: input.images || null,
    stock: input.stock ?? null,
    track_inventory: input.track_inventory ?? false,
    metadata: input.metadata || null,
    active: input.active ?? true,
    accept_payment: input.accept_payment ?? false,
    payment_wallet_address: input.payment_wallet_address || null,
  };

  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select(`
      *,
      merchant:merchants!inner(merchant_id, network)
    `)
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw new Error(error.message);
  }

  try {
    const { createProduct: createProductOnChain } = await import('src/lib/api/contract-service');
    
    const merchantCustomId = (data as any).merchant?.merchant_id;
    const merchantNetwork = (data as any).merchant?.network || 'testnet';
    
    if (!merchantCustomId) {
      throw new Error('Merchant custom ID not found');
    }
    
    console.log('[createProduct] Registering on blockchain...', {
      productId: data.product_id,
      merchantCustomId,
      price: data.price,
      network: merchantNetwork
    });
    
    const deployHash = await createProductOnChain(
      merchantCustomId,
      data.product_id,
      data.price.toString(),
      merchantNetwork
    );
    
    console.log('[createProduct] Blockchain registration successful:', deployHash);
    
    await supabase
      .from('products')
      .update({ transaction_hash: deployHash })
      .eq('id', data.id);
    
    (data as any).transaction_hash = deployHash;
  } catch (contractError: any) {
    console.error('[createProduct] Blockchain registration failed:', contractError);
  }

  return data as Product;
}

export async function updateProduct(
  productId: string,
  input: ProductUpdateInput
): Promise<Product> {
  const supabase = await createServerSupabaseClient();
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.price !== undefined) updateData.price = input.price;
  if (input.currency !== undefined) updateData.currency = input.currency;
  if (input.token_address !== undefined) updateData.token_address = input.token_address;
  if (input.image_url !== undefined) updateData.image_url = input.image_url;
  if (input.images !== undefined) updateData.images = input.images;
  if (input.stock !== undefined) updateData.stock = input.stock;
  if (input.track_inventory !== undefined) updateData.track_inventory = input.track_inventory;
  if (input.metadata !== undefined) updateData.metadata = input.metadata;
  if (input.active !== undefined) updateData.active = input.active;
  if (input.accept_payment !== undefined) updateData.accept_payment = input.accept_payment;
  if (input.payment_wallet_address !== undefined) updateData.payment_wallet_address = input.payment_wallet_address;

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', productId)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw new Error(error.message);
  }

  return data as Product;
}

export async function deleteProduct(productId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('products')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', productId);

  if (error) {
    console.error('Error deleting product:', error);
    throw new Error(error.message);
  }
}

export async function hardDeleteProduct(productId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('products').delete().eq('id', productId);

  if (error) {
    console.error('Error hard deleting product:', error);
    throw new Error(error.message);
  }
}

export async function toggleProductStatus(productId: string): Promise<Product> {
  const supabase = await createServerSupabaseClient();
  const { data: currentProduct, error: fetchError } = await supabase
    .from('products')
    .select('active, merchant:merchants(network)')
    .eq('id', productId)
    .single();

  if (fetchError) {
    console.error('Error fetching product:', fetchError);
    throw new Error(fetchError.message);
  }

  const { data, error } = await supabase
    .from('products')
    .update({
      active: !currentProduct.active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)
    .select('*, merchant:merchants(network)')
    .single();

  if (error) {
    console.error('Error toggling product status:', error);
    throw new Error(error.message);
  }

  try {
    const { updateProductStatus: updateProductStatusOnChain } = await import('src/lib/api/contract-service');
    
    console.log('[toggleProductStatus] Updating on blockchain...', {
      productId: data.id,
      active: data.active
    });
    
    const deployHash = await updateProductStatusOnChain(
      data.id,
      data.active,
      (data as any).merchant?.network || 'testnet'
    );
    
    console.log('[toggleProductStatus] Blockchain update successful:', deployHash);
  } catch (contractError: any) {
    console.error('[toggleProductStatus] Blockchain update failed:', contractError);
  }

  return data as Product;
}

export async function updateProductStock(
  productId: string,
  newStock: number
): Promise<Product> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('products')
    .update({
      stock: newStock,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)
    .select()
    .single();

  if (error) {
    console.error('Error updating product stock:', error);
    throw new Error(error.message);
  }

  return data as Product;
}

export async function getProductStats(merchantId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: products, error } = await supabase
    .from('products')
    .select('active, stock, price')
    .eq('merchant_id', merchantId);

  if (error) {
    console.error('Error fetching product stats:', error);
    throw new Error(error.message);
  }

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
}
