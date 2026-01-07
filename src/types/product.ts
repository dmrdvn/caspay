
// Product filters for list view
export type IProductFilters = {
  name: string;
  active: string[];
  priceRange: number[];
};

export type IProductTableFilters = {
  stock: string[];
  active: string[];
};

// CasPay Product (aligned with Supabase schema)
export type Product = {
  id: string; 
  merchant_id: string; 
  product_id: string; 
  name: string;
  description?: string | null;
  price: number; 
  currency: string; 
  token_address: string; 
  image_url?: string | null; 
  images?: string[] | null; 
  stock?: number | null; 
  track_inventory: boolean; 
  metadata?: Record<string, any> | null; 
  active: boolean; 
  transaction_hash?: string | null; 
  created_at: string; 
  updated_at: string; 
};

// For creating/updating products
export type ProductCreateInput = {
  merchant_id: string;
  product_id?: string;
  name: string;
  description?: string;
  price: number;
  currency?: string; 
  token_address?: string;
  image_url?: string;
  images?: string[];
  stock?: number;
  track_inventory?: boolean;
  metadata?: Record<string, any>;
  active?: boolean;
};

export type ProductUpdateInput = Partial<ProductCreateInput>;

export type IProductItem = Product;
