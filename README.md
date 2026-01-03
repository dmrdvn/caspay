# CasPay - Decentralized Payment & Subscription Platform

CasPay is a subscription and payment tracking platform built on Casper Network. Unlike traditional payment gateways, our primary focus is to help dApps and businesses **track subscriptions, manage billing, and analyze payment statistics** - all recorded transparently on-chain.

While users can accept payments through their own smart contracts, **CasPay's core value is simplifying subscription management** for the Casper ecosystem. We're building the infrastructure that makes recurring billing as easy for blockchain applications as it is for Web2 services.

**Every subscription, purchase, and payment is recorded instantly and transparently on Casper Network, providing immutable proof of all transactions.**

## 🎯 What We Do

**Subscription-First Platform**

CasPay solves a critical gap in the Casper ecosystem by making subscription-based business models possible for dApps. Our core features:

- **Subscription Tracking** - Monitor and manage all recurring billing on-chain
- **Payment Analytics** - Comprehensive statistics and financial reporting
- **Invoice Management** - Automated billing history and records
- **PayLink** (In Development) - One-time payment links for ad-hoc payments
- **On-Chain Transparency** - All data immutably recorded on Casper Network

While PayLink enables one-time payments, **our main focus is subscription management and billing cycle tracking**.

## 🚀 Quick Start

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

## 📦 CasPay SDK - Lightning Fast Integration

Our SDK makes it incredibly easy to integrate payment tracking into any application. Built for speed and simplicity.

### Platform Support

✅ **JavaScript/TypeScript** - React, Vue, Angular, vanilla JS  
✅ **Native HTML** - Works in any static website  
✅ **Node.js** - Server-side integration  
🚧 **PHP** - Coming very soon  
🚧 **WordPress Plugin** - Coming very soon

### Installation

```bash
npm install @caspay/sdk
# or
yarn add @caspay/sdk
```

### Quick Start Examples

**Modern Web Apps (React, Next.js, Vue):**

```javascript
import CasPay from '@caspay/sdk';

const caspay = new CasPay({
  apiKey: 'your_api_key',
  merchantId: 'your_merchant_id'
});

// Track a payment - that's it!
const payment = await caspay.payments.create({
  senderAddress: '0123...',
  productId: 'prod_abc',
  amount: 100
});
```

**WordPress & Static Sites:**

```html
<script src="https://cdn.jsdelivr.net/npm/@caspay/sdk/dist/caspay.min.js"></script>

<script>
  const caspay = new CasPay({
    apiKey: 'your_api_key',
    merchantId: 'your_merchant_id'
  });

  // One function call to track payment
  caspay.payments.create({ 
    senderAddress: '0123...', 
    amount: 50 
  });
</script>
```

### SDK Advantages

- ⚡ **Single Line Integration** - Minimal code, maximum functionality
- 🌐 **Universal Compatibility** - Works everywhere JavaScript runs
- 📘 **TypeScript Ready** - Full type safety and autocomplete
- 🪶 **Lightweight** - Minified bundle < 10KB
- 🛡️ **Production Ready** - Built-in error handling and retry logic
- 🚀 **CDN Distribution** - Fast global delivery via jsDelivr

**No blockchain expertise required. No complex setup. Just install, configure, and start tracking.**

## 🎮 Live Demos

Try CasPay SDK in action with our interactive demos:

- **HTML Demo**: [https://caspay.link/demo.html](https://caspay.link/demo.html)
- **Next.js Demo**: [https://caspay.link/demo-next/](https://caspay.link/demo-next/)

### How to Use Demos

**Get Your Credentials from Dashboard:**

1. **Merchant ID** - Go to Dashboard > Merchant page
2. **API Key** - Go to Dashboard > Merchant page > API Integration section
3. **Product ID** - Go to Dashboard > Products > Create a product
4. **Plan ID** - Go to Dashboard > Subscription Plans > Create a plan

**Demo Parameters:**

- `senderAddress` - Any wallet address (for testing)
- `transactionHash` - Mock hash in demo, real payment hash in production
- `productId` - Get from Products page after creating a product
- `planId` - Get from Subscription Plans page after creating a plan

**Check Subscription:**

Use the "Check Subscription" feature to query existing subscription status by merchant ID and sender address.

## 🎯 Key Features

### For Merchants

- **Subscription Management (Core Feature)** - Create flexible billing cycles, track active subscribers in real-time
- **Payment & Statistics Tracking** - Real-time transaction monitoring, revenue analytics, financial reports
- **Invoice Management** - Automated generation and payment history tracking
- **PayLink** (In Development) - Generate one-time payment links, send payment requests to anyone
- **Custom Contract Support** - Accept payments through your own contracts, CasPay tracks everything

### For Developers

- **Lightning Fast Integration** - From zero to tracking payments in under 10 minutes
- **Universal SDK** - Works across all JavaScript environments
- **Custom Contract Support** - Integrate with your existing smart contracts
- **On-Chain Verification** - All records immutably stored on Casper Network

### Full Transparency

- All transactions recorded on Casper Network
- Verifiable payment history
- Immutable subscription tracking
- Real-time on-chain confirmation

## 📚 Documentation

- **Live Demo**: [https://caspay.link](https://caspay.link)
- **Documentation**: [https://docs.caspay.link](https://docs.caspay.link)
- **API Reference**: [https://docs.caspay.link/api-reference](https://docs.caspay.link/api-reference)
- **Integration Guide**: [https://docs.caspay.link/docs/sdk/javascript/](https://docs.caspay.link/docs/sdk/javascript/)

## 🔗 SDK & Contract Links

- **NPM Package**: [@caspay/sdk](https://www.npmjs.com/package/@caspay/sdk)
- **CDN**: https://cdn.jsdelivr.net/npm/@caspay/sdk/dist/caspay.min.js
- **GitHub (SDK)**: https://github.com/dmrdvn/caspay-sdk
- **GitHub (Contract Source)**: https://github.com/dmrdvn/caspay-contract
- **CasPay Contract**: https://testnet.cspr.live/contract-package/8948983c771b919fa7776de54002834a857f7265c6722094728f2688a8c804c0

## 🌐 Platform Links

- **Dashboard**: https://caspay.link/dashboard
- **API**: https://api.caspay.link
- **Website**: https://caspay.link

## 📝 License

MIT License

---

**CasPay** - Building the subscription infrastructure for Casper Network  
Every subscription tracked on CasPay creates transparent, verifiable on-chain records.

Built for Casper Hackathon 2026 | Powered by Odra Framework | Secured by Casper Network
