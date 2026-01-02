// ----------------------------------------------------------------------

export type Merchant = {
  id: string;
  merchant_id: string;
  store_name: string;
  store_description?: string | null;
  business_type?: 'individual' | 'company' | 'dao';
  support_email?: string | null;
  support_url?: string | null;
  logo_url: string | null;
  brand_color?: string | null;
  wallet_address?: string | null;
  contract_hash?: string | null; // Deployed contract address on Casper Network
  contract_deployed_at?: string | null;
  status: 'pending' | 'active' | 'suspended' | 'closed';
  created_at?: string;
};

// ----------------------------------------------------------------------

export type MerchantStatus = Merchant['status'];

export type MerchantBusinessType = NonNullable<Merchant['business_type']>;

// ----------------------------------------------------------------------

/**
 * Data for creating a new merchant
 */
export type CreateMerchantData = {
  user_id: string;
  store_name: string;
  store_description?: string;
  business_type?: MerchantBusinessType;
  support_email?: string;
  support_url?: string;
  logo_url?: string;
  brand_color?: string;
};

/**
 * Data for updating an existing merchant
 */
export type UpdateMerchantData = Partial<Omit<CreateMerchantData, 'user_id'>>;
