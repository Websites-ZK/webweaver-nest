

## Referral System

### Business Logic
- Each user gets a unique referral code (stored in DB)
- When a referred friend makes a purchase, the referrer earns **10%** of the amount as site credits
- Once a referrer reaches **10 referrals** OR their referrals spend **€1,000 total**, the commission upgrades to **15%** permanently
- Credits can be applied toward future hosting purchases

### Database Changes (3 new tables + 1 migration)

1. **`referral_profiles`** — one row per user
   - `user_id`, `referral_code` (unique 8-char code), `commission_rate` (default 10), `total_referrals` (int), `total_referred_revenue` (numeric), `credits_balance` (numeric), `created_at`

2. **`referrals`** — tracks each referred user
   - `id`, `referrer_id`, `referred_user_id`, `status` (pending/active), `created_at`

3. **`referral_earnings`** — log of each credit earned
   - `id`, `referrer_id`, `referred_user_id`, `invoice_id`, `amount` (purchase amount), `commission_rate`, `credits_earned`, `created_at`

4. **DB function** `process_referral_earning` — called when a purchase is made; calculates credits, updates balance, and auto-upgrades rate to 15% when thresholds are met

RLS: users can only read their own referral data.

### Frontend Changes

1. **`src/components/dashboard/ReferralsTab.tsx`** — new tab with:
   - Referral code display + copy button
   - Shareable referral link (`?ref=CODE` appended to homepage)
   - Current commission rate (10% or 15%) with progress toward upgrade
   - Credits balance
   - Table of referrals (name/email, status, earnings)
   - Progress bars: X/10 referrals, €X/€1,000 revenue

2. **`src/components/dashboard/DashboardSidebar.tsx`** — add "Referrals" item (Users icon) between Billing and Settings

3. **`src/pages/Dashboard.tsx`** — add referrals tab case, fetch referral data

4. **`src/pages/Register.tsx`** — capture `ref` query param and store in `referrals` table on signup

5. **`src/contexts/LanguageContext.tsx`** — add `dash.referrals`, `dash.referralsDesc`, `dash.referralCode`, `dash.copyLink`, `dash.creditsBalance`, `dash.commissionRate`, `dash.referralProgress`, etc. for EN and HR (other languages get EN fallback)

### Referral Flow
```text
User A shares link → Friend signs up with ?ref=CODE → 
referrals row created (pending) → Friend purchases plan → 
process_referral_earning() runs → credits added to User A → 
if thresholds met → commission_rate upgraded to 15%
```

### Technical Notes
- Referral code auto-generated on first visit to Referrals tab (or on profile creation via trigger)
- The `create-checkout` edge function will be updated to pass referral metadata to Stripe, and on successful payment, call `process_referral_earning`
- Credits display in billing tab as well

