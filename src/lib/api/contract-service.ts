import { Args, CLValue, Key, KeyTypeID, PublicKey } from 'casper-js-sdk';

import {
  addBoolArg,
  addStringArg,
  addU32Arg,
  callContract,
  createEmptyArgs,
  csprToMotes,
  waitForDeploy,
} from './casper-client';

// ----------------------------------------------------------------------
// MERCHANT OPERATIONS
// ----------------------------------------------------------------------

/**
 * Register a new merchant on-chain
 * 
 * @param merchantId Supabase UUID
 * @param walletAddress Casper wallet address (hex)
 * @returns Deploy hash
 */
export async function registerMerchant(
  merchantId: string,
  walletAddress: string
): Promise<string> {
  console.log('[Contract Service] ===== REGISTER MERCHANT =====');
  console.log('[Contract Service] Input merchantId:', merchantId);
  console.log('[Contract Service] Input walletAddress:', walletAddress);
  
  // Use Args.fromMap - SDK v5 recommended pattern  
  const publicKey = PublicKey.fromHex(walletAddress);
  
  // Create CLKey from PublicKey (Odra Address = Key type)
  const addressKey = Key.createByType(
    publicKey.accountHash().toPrefixedString(),
    KeyTypeID.Account
  );
  
  console.log('[Contract Service] Sending to contract:', {
    merchant_id: merchantId,
    wallet_address_account_hash: publicKey.accountHash().toPrefixedString()
  });
  
  const args = Args.fromMap({
    merchant_id: CLValue.newCLString(merchantId),
    wallet_address: CLValue.newCLKey(addressKey)
  });
  
  const deployHash = await callContract('register_merchant', args, csprToMotes(5));
  
  console.log('[Contract Service] Merchant deploy sent:', deployHash);
  console.log('[Contract Service] Merchant registered successfully');
  console.log('[Contract Service] =====================================');
  
  return deployHash;
}

/**
 * Update merchant status on-chain
 * 
 * @param merchantId Supabase UUID
 * @param newStatus Status enum (0=Active, 1=Suspended, 2=Banned, 3=Pending)
 * @returns Deploy hash
 */
export async function updateMerchantStatus(
  merchantId: string,
  newStatus: number
): Promise<string> {
  const args = createEmptyArgs();
  
  addStringArg(args, 'merchant_id', merchantId);
  addU32Arg(args, 'new_status', newStatus);
  
  const deployHash = await callContract('update_merchant_status', args, csprToMotes(3));
  
  console.log('[Contract Service] Merchant status updated:', { merchantId, newStatus, deployHash });
  
  return deployHash;
}

// ----------------------------------------------------------------------
// PRODUCT OPERATIONS
// ----------------------------------------------------------------------

/**
 * Create a new product on-chain
 * 
 * @param merchantId Custom merchant ID (MERCH_xxx)
 * @param productId Custom product ID (prod_xxx)
 * @param price Price as string (original value, NOT motes)
 * @returns Deploy hash
 */
export async function createProduct(
  merchantId: string,
  productId: string,
  price: string
): Promise<string> {
  console.log('[Contract Service] ===== CREATE PRODUCT =====');
  console.log('[Contract Service] Input merchantId:', merchantId);
  console.log('[Contract Service] Input productId:', productId);
  console.log('[Contract Service] Input price:', price, '(original, NOT motes)');
  
  console.log('[Contract Service] Sending to contract:', {
    merchant_id: merchantId,
    product_id: productId,
    price: price
  });
  
  const args = Args.fromMap({
    merchant_id: CLValue.newCLString(merchantId),
    product_id: CLValue.newCLString(productId),
    price: CLValue.newCLUInt512(price)
  });
  
  const deployHash = await callContract('create_product', args, csprToMotes(5));
  
  console.log('[Contract Service] Product created successfully:', { merchantId, productId, price, deployHash });
  console.log('[Contract Service] =========================================');
  
  return deployHash;
}

/**
 * Update product status on-chain
 * 
 * @param productId Supabase UUID
 * @param active Boolean active status
 * @returns Deploy hash
 */
export async function updateProductStatus(
  productId: string,
  active: boolean
): Promise<string> {
  const args = createEmptyArgs();
  
  addStringArg(args, 'product_id', productId);
  addBoolArg(args, 'active', active);
  
  const deployHash = await callContract('update_product_status', args, csprToMotes(3));
  
  console.log('[Contract Service] Product status updated:', { productId, active, deployHash });
  
  return deployHash;
}

// ----------------------------------------------------------------------
// SUBSCRIPTION PLAN OPERATIONS
// ----------------------------------------------------------------------

/**
 * Create a subscription plan on-chain
 * 
 * @param merchantId Custom merchant ID (MERCH_xxx)
 * @param planId Custom plan ID (plan_xxx or generated)
 * @param price Price as string (original value, NOT motes)
 * @param interval Interval enum (0=Weekly, 1=Monthly, 2=Yearly)
 * @param intervalCount Interval count (u32)
 * @param trialDays Trial days (u32)
 * @returns Deploy hash
 */
export async function createSubscriptionPlan(
  merchantId: string,
  planId: string,
  price: string,
  interval: number,
  intervalCount: number,
  trialDays: number
): Promise<string> {
  console.log('[Contract Service] ===== CREATE SUBSCRIPTION PLAN =====');
  console.log('[Contract Service] Input merchantId:', merchantId);
  console.log('[Contract Service] Input planId:', planId);
  console.log('[Contract Service] Input price:', price, '(original, NOT motes)');
  console.log('[Contract Service] Input interval:', interval);
  console.log('[Contract Service] Input intervalCount:', intervalCount);
  console.log('[Contract Service] Input trialDays:', trialDays);
  
  console.log('[Contract Service] Sending to contract:', {
    merchant_id: merchantId,
    plan_id: planId,
    price: price,
    interval: interval,
    interval_count: intervalCount,
    trial_days: trialDays
  });
  
  const args = Args.fromMap({
    merchant_id: CLValue.newCLString(merchantId),
    plan_id: CLValue.newCLString(planId),
    price: CLValue.newCLUInt512(price),
    interval: CLValue.newCLUint8(interval), // ENUM = U8!
    interval_count: CLValue.newCLUInt32(intervalCount),
    trial_days: CLValue.newCLUInt32(trialDays)
  });
  
  const deployHash = await callContract('create_subscription_plan', args, csprToMotes(5));
  
  console.log('[Contract Service] Subscription plan created successfully:', { merchantId, planId, deployHash });
  console.log('[Contract Service] ====================================================');
  
  return deployHash;
}

/**
 * Update subscription plan status on-chain
 * 
 * @param planId Supabase UUID
 * @param active Boolean active status
 * @returns Deploy hash
 */
export async function updatePlanStatus(
  planId: string,
  active: boolean
): Promise<string> {
  const args = createEmptyArgs();
  
  addStringArg(args, 'plan_id', planId);
  addBoolArg(args, 'active', active);
  
  const deployHash = await callContract('update_plan_status', args, csprToMotes(3));
  
  console.log('[Contract Service] Plan status updated:', { planId, active, deployHash });
  
  return deployHash;
}

// ----------------------------------------------------------------------
// PAYMENT & SUBSCRIPTION OPERATIONS
// ----------------------------------------------------------------------

/**
 * Record a payment on-chain (minimal data only)
 * 
 * @param payerAddress Payer's wallet address (hex)
 * @param productId Product ID (optional)
 * @param subscriptionPlanId Subscription plan ID (optional)
 * @returns Deploy hash
 */
export async function recordPayment(
  payerAddress: string,
  productId: string | null,
  subscriptionPlanId: string | null
): Promise<string> {
  console.log('[Contract Service] ===== RECORD PAYMENT =====');
  console.log('[Contract Service] Input payerAddress:', payerAddress);
  console.log('[Contract Service] Input productId:', productId);
  console.log('[Contract Service] Input subscriptionPlanId:', subscriptionPlanId);
  
  // Convert payer address to CLKey
  const publicKey = PublicKey.fromHex(payerAddress);
  const payerKey = Key.createByType(
    publicKey.accountHash().toPrefixedString(),
    KeyTypeID.Account
  );
  
  console.log('[Contract Service] Sending to contract:', {
    payer: publicKey.accountHash().toPrefixedString(),
    product_id: productId || 'None',
    subscription_plan_id: subscriptionPlanId || 'None'
  });
  
  // Build args - use CLOption for Option<String> fields
  const argsMap: Record<string, CLValue> = {
    payer: CLValue.newCLKey(payerKey)
  };
  

  if (productId) {
    argsMap.product_id = CLValue.newCLOption(CLValue.newCLString(productId));
  } else {
    argsMap.product_id = CLValue.newCLOption(null);
  }
  
  if (subscriptionPlanId) {
    argsMap.subscription_plan_id = CLValue.newCLOption(CLValue.newCLString(subscriptionPlanId));
  } else {
    argsMap.subscription_plan_id = CLValue.newCLOption(null);
  }
  
  const args = Args.fromMap(argsMap);
  
  const deployHash = await callContract('record_payment', args);
  
  console.log('[Contract Service] Payment recorded successfully:', { deployHash });
  console.log('[Contract Service] =======================================');
  
  return deployHash;
}

/**
 * Create a subscription on-chain
 * 
 * @param subscriptionId Subscription ID (Supabase UUID)
 * @param merchantId Custom merchant ID (MERCH_xxx)
 * @param subscriberAddress Subscriber's wallet address (hex)
 * @param planId Custom plan ID (plan_xxx)
 * @returns Deploy hash
 */
export async function createSubscription(
  subscriptionId: string,
  merchantId: string,
  subscriberAddress: string,
  planId: string
): Promise<string> {
  console.log('[Contract Service] ===== CREATE SUBSCRIPTION =====');
  console.log('[Contract Service] Input subscriptionId:', subscriptionId);
  console.log('[Contract Service] Input merchantId:', merchantId);
  console.log('[Contract Service] Input subscriberAddress:', subscriberAddress);
  console.log('[Contract Service] Input planId:', planId);
  
  // Convert subscriber address to CLKey
  const publicKey = PublicKey.fromHex(subscriberAddress);
  const subscriberKey = Key.createByType(
    publicKey.accountHash().toPrefixedString(),
    KeyTypeID.Account
  );
  
  console.log('[Contract Service] Sending to contract:', {
    subscription_id: subscriptionId,
    merchant_id: merchantId,
    subscriber: publicKey.accountHash().toPrefixedString(),
    plan_id: planId
  });
  
  const args = Args.fromMap({
    subscription_id: CLValue.newCLString(subscriptionId),
    merchant_id: CLValue.newCLString(merchantId),
    subscriber: CLValue.newCLKey(subscriberKey),
    plan_id: CLValue.newCLString(planId)
  });
  
  const deployHash = await callContract('create_subscription', args, csprToMotes(5));
  
  console.log('[Contract Service] Subscription created successfully:', { subscriptionId, deployHash });
  console.log('[Contract Service] ================================================');
  
  return deployHash;
}

// ----------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------

/**
 * Convert CSPR amount to motes for prices
 */
export function priceToMotes(csprAmount: number): string {
  return csprToMotes(csprAmount);
}

/**
 * Get subscription interval enum value
 */
export function getIntervalValue(interval: 'weekly' | 'monthly' | 'yearly'): number {
  const map = { weekly: 0, monthly: 1, yearly: 2 };
  return map[interval];
}

/**
 * Wait for a deploy to complete (optional - for critical operations)
 */
export async function waitForDeployCompletion(deployHash: string): Promise<any> {
  return waitForDeploy(deployHash);
}

/**
 * Unpause the contract
 */
export async function unpauseContract(): Promise<string> {
  console.log('[Contract Service] ===== UNPAUSE CONTRACT =====');
  
  const args = Args.fromMap({});
  const deployHash = await callContract('unpause_contract', args, csprToMotes(2));
  
  console.log('[Contract Service] Contract unpaused:', deployHash);
  return deployHash;
}
