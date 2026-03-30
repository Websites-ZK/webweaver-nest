

## Add Payment Method Selection Step to Onboarding

### Overview
Add a new step 4 "Choose payment method" between the current extras step and the review step, expanding the wizard from 4 to 5 steps. Users select either Stripe (card) or Coinbase Commerce (crypto).

### What changes

**1. Enable Stripe integration**
- Use the Stripe enablement tool to set up Stripe for this project
- This will handle API key collection and provide payment tools

**2. Expand onboarding to 5 steps (`src/pages/Onboarding.tsx`)**
- Add new step between extras (step 2) and review (now step 4)
- Step 3 = "Choose payment method" — two selectable cards:
  - **Credit/Debit Card** (Stripe icon) — "Pay securely with Visa, Mastercard, etc."
  - **Cryptocurrency** (Bitcoin icon) — "Pay with BTC, ETH, USDC via Coinbase Commerce"
- New state: `paymentMethod: "stripe" | "crypto"`
- Update step numbering (review becomes step 4)
- Show selected payment method in the review summary
- On "Confirm & activate":
  - If Stripe: create a Stripe Checkout session via edge function and redirect
  - If Crypto: create a Coinbase Commerce charge via edge function and redirect

**3. Create edge function `supabase/functions/create-checkout/index.ts`**
- Accepts plan details, extras, domain, and payment method
- For Stripe: creates a Checkout Session with line items matching the selected plan + extras
- For Crypto: creates a Coinbase Commerce charge via their API
- Returns the redirect URL

**4. Add Coinbase Commerce secret**
- Use the secrets tool to request the user's Coinbase Commerce API key

**5. Translation keys (`src/contexts/LanguageContext.tsx`)**
- `onboarding.step4` — "Payment method" / "Način plaćanja"
- `onboarding.step4.desc` — "Choose how you'd like to pay"
- `onboarding.paymentCard` — "Credit/Debit Card"
- `onboarding.paymentCrypto` — "Cryptocurrency"
- Step 5 labels for the review step (renumbered)

### Technical details
- Stripe integration uses Lovable's built-in Stripe tools for creating products/prices/checkout sessions
- Coinbase Commerce uses their REST API (`POST https://api.commerce.coinbase.com/charges`) from an edge function, requiring a `COINBASE_COMMERCE_API_KEY` secret
- The payment method selection UI follows the same card-style pattern used for domain type and extras selection (border-primary highlight, scale animation)

