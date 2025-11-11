# Face Reading App - Complete Backup

**Backup Date:** November 6, 2024  
**Version:** 2.3.0 (with Stripe Payment Integration)  
**Latest Commit:** 9727e2b - Add Stripe payment integration with credits system

## What's Included

This backup contains the complete Face Reading web application with all the latest features:

### ✨ Features
- AI-powered face reading analysis (Gemini 2.5 Pro, GPT-5, Grok 4)
- Mystical animated hero icon with sacred geometry
- **Stripe payment integration** (NEW!)
- Credits-based purchasing system
- 4 pricing tiers with automatic savings calculation
- Payment history and order tracking
- Admin dashboard with AI monitoring
- PDF report generation (11-page comprehensive reports)
- Mobile-responsive design
- User authentication via Manus OAuth

### 💳 Stripe Integration (Version 2.3.0)
- Complete payment flow with Stripe Checkout
- Webhook handler for automatic credit fulfillment
- 4 pricing packages: $9.97, $19.97, $29.97, $49.97
- Credits system integrated with user accounts
- Order history page
- Payment success confirmation page
- Test mode enabled (card: 4242 4242 4242 4242)

### 📁 Project Structure
```
face-reading-app/
├── client/              # React frontend (Vite + React 19)
│   ├── src/
│   │   ├── pages/      # Page components
│   │   │   ├── Pricing.tsx          # NEW: Pricing page
│   │   │   ├── PaymentSuccess.tsx   # NEW: Payment confirmation
│   │   │   ├── Orders.tsx           # NEW: Order history
│   │   │   └── ...
│   │   ├── components/ # Reusable UI components
│   │   └── lib/        # tRPC client
├── server/              # Express + tRPC backend
│   ├── routers/        # tRPC routers
│   │   └── paymentRouter.ts  # NEW: Payment endpoints
│   ├── webhooks/       # Webhook handlers
│   │   └── stripeWebhook.ts  # NEW: Stripe webhook
│   ├── dbPayments.ts   # NEW: Payment database helpers
│   ├── products.ts     # NEW: Pricing configuration
│   └── ...
├── drizzle/            # Database schema & migrations
│   ├── schema.ts       # Updated with orders, subscriptions, credits
│   └── 0007_*.sql      # NEW: Payment tables migration
└── package.json        # Dependencies (includes stripe@19.3.0)
```

### 🗄️ Database Schema Updates
- Added `credits` field to `users` table
- New `orders` table for transaction tracking
- New `subscriptions` table for future subscription features
- Migration file: `drizzle/0007_luxuriant_red_ghost.sql`

### 🔧 Environment Variables Required
```
# Stripe (automatically injected by Manus platform)
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=mysql://...

# OAuth
VITE_APP_ID=...
OAUTH_SERVER_URL=...
JWT_SECRET=...

# AI APIs
OPENAI_API_KEY=...
BUILT_IN_FORGE_API_KEY=...
BUILT_IN_FORGE_API_URL=...
```

## 🚀 How to Restore

### 1. Extract the Archive
```bash
tar -xzf face-reading-app-backup-20251106-045632.tar.gz
cd face-reading-app
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Set Up Environment Variables
Create a `.env` file with all required variables (see above)

### 4. Set Up Database
```bash
# Push schema to database
pnpm db:push
```

### 5. Run Development Server
```bash
pnpm dev
```

### 6. Configure Stripe Webhook (Production)
When deploying to production, configure the Stripe webhook endpoint:
- URL: `https://your-domain.com/api/stripe`
- Events to listen for: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`

## 📝 Git History

Latest commits included in this backup:
- `9727e2b` - Add Stripe payment integration with credits system
- `4807a03` - Release v2.2.0 with mystical hero icon and feature updates
- `26470d7` - Version 2.2.0: Mystical hero icon, admin fixes, mobile responsive
- `f97a4e7` - AI monitoring system
- `a6be777` - Multi-model AI ensemble integration

## 🔗 Push to Your GitHub

```bash
cd face-reading-app

# Initialize git (if needed)
git init
git add -A
git commit -m "Initial commit: Face Reading App v2.3.0 with Stripe integration"

# Add your GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## ⚠️ Important Notes

1. **Stripe Test Sandbox**: Claim at https://dashboard.stripe.com/claim_sandbox/YWNjdF8xU1FCaGVQdndGaGxUWG9XLDE3NjI5OTM1MzQv100OT6ZvREe (expires Jan 5, 2026)

2. **Test Card**: Use `4242 4242 4242 4242` with any future expiry and any 3-digit CVC

3. **Webhook Signature**: The webhook handler uses `stripe.webhooks.constructEvent()` for security - make sure `STRIPE_WEBHOOK_SECRET` is set correctly

4. **Database**: Make sure to run `pnpm db:push` to create the new payment tables

5. **Node Modules**: Not included in backup (saves space). Run `pnpm install` after extraction.

## 📞 Support

For issues with the Manus platform checkpoint system, contact: https://help.manus.im

---

**Backup created by:** Manus AI Agent  
**Platform:** Manus Web Development Environment  
**Backup Size:** 7.5 MB (compressed, excludes node_modules)
