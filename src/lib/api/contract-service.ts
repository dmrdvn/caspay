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

export async function registerMerchant(
  merchantId: string,
  walletAddress: string
): Promise<string> {
  const publicKey = PublicKey.fromHex(walletAddress);
  
  const addressKey = Key.createByType(
    publicKey.accountHash().toPrefixedString(),
    KeyTypeID.Account
  );
  
  const args = Args.fromMap({
    merchant_id: CLValue.newCLString(merchantId),
    wallet_address: CLValue.newCLKey(addressKey)
  });
  
  const deployHash = await callContract('register_merchant', args, csprToMotes(5));
  
  return deployHash;
}

export async function updateMerchantStatus(
  merchantId: string,
  newStatus: number
): Promise<string> {
  const args = createEmptyArgs();
  
  addStringArg(args, 'merchant_id', merchantId);
  addU32Arg(args, 'new_status', newStatus);
  
  const deployHash = await callContract('update_merchant_status', args, csprToMotes(3));
  
  return deployHash;
}

export async function createProduct(
  merchantId: string,
  productId: string,
  price: string
): Promise<string> {
  const args = Args.fromMap({
    merchant_id: CLValue.newCLString(merchantId),
    product_id: CLValue.newCLString(productId),
    price: CLValue.newCLUInt512(price)
  });
  
  const deployHash = await callContract('create_product', args, csprToMotes(5));
  
  return deployHash;
}

export async function updateProductStatus(
  productId: string,
  active: boolean
): Promise<string> {
  const args = createEmptyArgs();
  
  addStringArg(args, 'product_id', productId);
  addBoolArg(args, 'active', active);
  
  const deployHash = await callContract('update_product_status', args, csprToMotes(3));
  
  return deployHash;
}

export async function createSubscriptionPlan(
  merchantId: string,
  planId: string,
  price: string,
  interval: number,
  intervalCount: number,
  trialDays: number
): Promise<string> {
  const args = Args.fromMap({
    merchant_id: CLValue.newCLString(merchantId),
    plan_id: CLValue.newCLString(planId),
    price: CLValue.newCLUInt512(price),
    interval: CLValue.newCLUint8(interval),
    interval_count: CLValue.newCLUInt32(intervalCount),
    trial_days: CLValue.newCLUInt32(trialDays)
  });
  
  const deployHash = await callContract('create_subscription_plan', args, csprToMotes(5));
  
  return deployHash;
}

export async function updatePlanStatus(
  planId: string,
  active: boolean
): Promise<string> {
  const args = createEmptyArgs();
  
  addStringArg(args, 'plan_id', planId);
  addBoolArg(args, 'active', active);
  
  const deployHash = await callContract('update_plan_status', args, csprToMotes(3));
  
  return deployHash;
}

export async function recordPayment(
  payerAddress: string,
  productId: string | null,
  subscriptionPlanId: string | null
): Promise<string> {
  const publicKey = PublicKey.fromHex(payerAddress);
  const payerKey = Key.createByType(
    publicKey.accountHash().toPrefixedString(),
    KeyTypeID.Account
  );
  
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
  
  return deployHash;
}

export async function createSubscription(
  subscriptionId: string,
  merchantId: string,
  subscriberAddress: string,
  planId: string
): Promise<string> {
  const publicKey = PublicKey.fromHex(subscriberAddress);
  const subscriberKey = Key.createByType(
    publicKey.accountHash().toPrefixedString(),
    KeyTypeID.Account
  );
  
  const args = Args.fromMap({
    subscription_id: CLValue.newCLString(subscriptionId),
    merchant_id: CLValue.newCLString(merchantId),
    subscriber: CLValue.newCLKey(subscriberKey),
    plan_id: CLValue.newCLString(planId)
  });
  
  const deployHash = await callContract('create_subscription', args, csprToMotes(5));
  
  return deployHash;
}

export function priceToMotes(csprAmount: number): string {
  return csprToMotes(csprAmount);
}

export function getIntervalValue(interval: 'weekly' | 'monthly' | 'yearly'): number {
  const map = { weekly: 0, monthly: 1, yearly: 2 };
  return map[interval];
}

export async function waitForDeployCompletion(deployHash: string): Promise<any> {
  return waitForDeploy(deployHash);
}

export async function unpauseContract(): Promise<string> {
  const args = Args.fromMap({});
  const deployHash = await callContract('unpause_contract', args, csprToMotes(2));
  
  return deployHash;
}
