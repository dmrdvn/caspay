
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
  transaction_hash?: string | null; 
  contract_deployed_at?: string | null;
  status: 'pending' | 'active' | 'suspended' | 'closed';
  network: 'testnet' | 'mainnet';
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
  network?: 'testnet' | 'mainnet';
};

/**
 * Data for updating an existing merchant
 */
export type UpdateMerchantData = Partial<Omit<CreateMerchantData, 'user_id'>>;
