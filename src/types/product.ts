

// ----------------------------------------------------------------------

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
  id: string; // UUID
  merchant_id: string; // UUID - FK to merchants
  product_id: string; // Unique text identifier (e.g., "prod_abc123")
  name: string;
  description?: string | null;
  price: number; // numeric in DB
  currency: string; // 'CSPR', 'USDT', 'USDC', or 'CUSTOM'
  token_address: string; // CEP-18 token contract hash (e.g., 'hash-...')
  image_url?: string | null; // Primary image
  images?: string[] | null; // Additional images array
  stock?: number | null; // Available quantity
  track_inventory: boolean; // Whether to track stock
  metadata?: Record<string, any> | null; // JSONB - flexible data (SKU, weight, etc.)
  active: boolean; // Product status
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
};

// For creating/updating products
export type ProductCreateInput = {
  merchant_id: string;
  product_id?: string; // Auto-generated if not provided
  name: string;
  description?: string;
  price: number;
  currency?: string; // Default: 'CSPR'
  token_address?: string; // Default: CSPR token hash
  image_url?: string;
  images?: string[];
  stock?: number;
  track_inventory?: boolean;
  metadata?: Record<string, any>;
  active?: boolean;
};

export type ProductUpdateInput = Partial<ProductCreateInput>;

// Legacy type alias for backward compatibility
export type IProductItem = Product;
