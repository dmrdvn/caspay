# CasPay - Complete Payment Gateway for Casper Network

CasPay is a complete payment gateway and subscription platform built on Casper Network. Accept CSPR payments directly in your dApp with built-in wallet integration, manage subscriptions on-chain, and track all payment analytics transparently.

**Every subscription, purchase, and payment is recorded instantly and transparently on Casper Network, providing immutable proof of all transactions.**

## What We Do

**Complete Payment Solution for Casper dApps**

CasPay provides everything you need to accept payments and manage subscriptions on Casper Network:

- **Direct Payment Processing** - Accept CSPR payments with built-in Casper Wallet integration
- **Subscription Management** - Monitor and manage recurring billing on-chain
- **Payment Analytics** - Comprehensive statistics and financial reporting
- **Invoice Management** - Automated billing history and records
- **PayLink** - One-time payment links for ad-hoc payments
- **On-Chain Transparency** - All data immutably recorded on Casper Network
- **Zero Setup Complexity** - No need for external Casper SDK or RPC configuration

## Quick Start

### Prerequisites

- Node.js >= 20
- Yarn (recommended) or npm

### Installation

```bash
# Clone repository
git clone https://github.com/dmrdvn/caspay.git
cd caspay

# Install dependencies
yarn install
# or
npm install

# Start development server
yarn dev
# or
npm run dev
```

The application will run at [http://localhost:8082](http://localhost:8082)

### Production Build

```bash
yarn build
yarn start
```

## CasPay SDK - Accept Payments in Minutes

Our SDK provides complete payment gateway functionality with built-in Casper Wallet integration. No blockchain expertise required.

### Platform Support

✅ **JavaScript/TypeScript** - React, Next.js, Vue, Angular, vanilla JS  
✅ **Native HTML** - Works in any static website  
✅ **Node.js** - Server-side integration  
✅ **PHP** - CDN integration available  
🚧 **WordPress Plugin** - Coming soon

### Installation

```bash
npm install @caspay/sdk
```

### Quick Start Examples

**Accept Payment (Recommended):**

```javascript
import CasPay from '@caspay/sdk';

const caspay = new CasPay({
  apiKey: 'cp_live_...',
  merchantId: 'MERCH_...',
  walletAddress: '01ab...', // Your wallet to receive payments
  network: 'testnet'
});

const result = await caspay.payments.makePayment({
  productId: 'prod_abc123',
  amount: 10.5
});

if (result.success) {
  console.log('Payment successful:', result.transactionHash);
}
```

**Subscription Payment:**

```javascript
const result = await caspay.payments.makePayment({
  subscriptionPlanId: 'plan_monthly',
  amount: 29.99
});

const status = await caspay.subscriptions.checkStatus({
  subscriberAddress: '0145ab...',
  planId: 'plan_monthly'
});

console.log('Is subscribed:', status.active);
```

**WordPress & Static Sites:**

```html
<script src="https://cdn.jsdelivr.net/npm/@caspay/sdk@1.1.5/dist/caspay.min.js"></script>

<button id="payBtn">Pay 10 CSPR</button>

<script>
  const caspay = new CasPay({
    apiKey: 'cp_live_...',
    merchantId: 'MERCH_...',
    walletAddress: '01ab...',
    network: 'testnet'
  });

  document.getElementById('payBtn').onclick = async () => {
    const result = await caspay.payments.makePayment({
      productId: 'prod_abc',
      amount: 10
    });
    
    if (result.success) {
      alert('Payment successful!');
    }
  };
</script>
```

### SDK Advantages

- **Complete Payment Gateway** - Wallet connection, transfer, and recording in one SDK
- **Universal Compatibility** - Works everywhere JavaScript runs
- **TypeScript Ready** - Full type safety and autocomplete
- **Lightweight** - Minified bundle < 30KB
- **Production Ready** - Built-in error handling and validation
- **CDN Distribution** - Fast global delivery via jsDelivr
**No blockchain expertise required. No Casper SDK setup. Just install and start accepting payments.**

## Live Demos

Try CasPay integration in action with real wallet connections on testnet:

### NFT Marketplace Example
Complete NFT gallery demonstrating full payment gateway integration.
- **Live Demo**: [https://caspay-sample-nft.vercel.app](https://caspay-sample-nft.vercel.app)
- **Source Code**: [https://github.com/dmrdvn/caspay-example-1](https://github.com/dmrdvn/caspay-example-1)
- **Features**: One-time purchases, recurring subscriptions, real-time status tracking

### HTML Demo
Simple vanilla JavaScript integration example.
- **Live Demo**: [https://caspay.link/demo.html](https://caspay.link/demo.html)

### Next.js Demo
Modern React integration example.
- **Live Demo**: [https://caspay.link/demo-next/](https://caspay.link/demo-next/)

### How to Use Demos

**For NFT Marketplace Demo:**
1. Visit [caspay-sample-nft.vercel.app](https://caspay-sample-nft.vercel.app)
2. Connect your Casper Wallet (testnet)
3. Make a purchase or subscribe to a plan
4. See real-time transaction on Casper blockchain

**For HTML/Next.js Demos:**

**Get Your Credentials from Dashboard:**

1. **Merchant ID** - Go to Dashboard > Merchant page
2. **API Key** - Go to Dashboard > Merchant page > API Integration section
3. **Wallet Address** - Your Casper wallet address to receive payments
4. **Product ID** - Go to Dashboard > Products > Create a product
5. **Plan ID** - Go to Dashboard > Subscription Plans > Create a plan

**Demo Parameters:**

- `senderAddress` - Any wallet address (for testing)
- `transactionHash` - Mock hash in demo, real payment hash in production
- `productId` - Get from Products page after creating a product
- `planId` - Get from Subscription Plans page after creating a plan

**Check Subscription:**

Use the "Check Subscription" feature to query existing subscription status by merchant ID and sender address.

## Key Features

### For Merchants

- **Direct Payment Processing** - Accept CSPR payments with built-in wallet integration
- **Subscription Management** - Create flexible billing cycles, track active subscribers in real-time
- **Payment & Statistics Tracking** - Real-time transaction monitoring, revenue analytics, financial reports
- **Invoice Management** - Automated generation and payment history tracking
- **PayLink** - Generate one-time payment links, send payment requests to anyone
- **Multi-Network Support** - Works on both Casper Mainnet and Testnet

### For Developers

- **Zero Setup Complexity** - No need to install Casper SDK or configure RPC endpoints
- **Universal SDK** - Works across all JavaScript environments
- **Built-in Wallet Integration** - Casper Wallet connection handled automatically
- **Pre-transaction Validation** - API key validation prevents wasted gas fees
- **Complete Type Safety** - Full TypeScript support with type definitions
- **On-Chain Verification** - All records immutably stored on Casper Network

### Full Transparency

- All transactions recorded on Casper Network
- Verifiable payment history
- Immutable subscription tracking
- Real-time on-chain confirmation

## Documentation

- **Live Demo**: [https://caspay.link](https://caspay.link)
- **Documentation**: [https://docs.caspay.link](https://docs.caspay.link)
- **API Reference**: [https://docs.caspay.link/api-reference](https://docs.caspay.link/api-reference)
- **Integration Guide**: [https://docs.caspay.link/docs/sdk/javascript/](https://docs.caspay.link/docs/sdk/javascript/)

## SDK & Contract Links

- **NPM Package**: [@caspay/sdk](https://www.npmjs.com/package/@caspay/sdk)
- **CDN**: https://cdn.jsdelivr.net/npm/@caspay/sdk@1.1.5/dist/caspay.min.js
- **SDK Documentation**: [SDK README](https://github.com/dmrdvn/caspay-sdk#readme)
- **Example Source (NFT Gallery)**: https://github.com/dmrdvn/caspay-example-1
- **GitHub (Contract Source)**: https://github.com/dmrdvn/caspay-contract
- **CasPay Contract**: https://testnet.cspr.live/contract-package/8948983c771b919fa7776de54002834a857f7265c6722094728f2688a8c804c0

## Platform Links

- **Dashboard**: https://caspay.link/dashboard
- **API**: https://caspay.link/api
- **Website**: https://caspay.link

## 📝 License

MIT License

---

**CasPay** - Complete payment gateway for Casper Network  
Every payment tracked on CasPay creates transparent, verifiable on-chain records.

Built for Casper Hackathon 2026 | Powered by Odra Framework | Secured by Casper Network
