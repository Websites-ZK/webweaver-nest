

## Why a Node.js Express Backend Won't Work Here

Lovable is a **client-side React platform**. It does not support running persistent Node.js/Express servers. There is no way to host a long-running backend process in this environment.

However, your project **already has backend capabilities** via Lovable Cloud (Edge Functions). You currently have 6 edge functions including `create-checkout` which already handles Stripe payments.

## Recommended Approach: Edge Functions

Instead of an Express server, we create additional **Edge Functions** that provide the same capabilities:

### What to Build

1. **`fossbilling-proxy` Edge Function** — Proxies requests to your FOSSBilling API
   - Accepts authenticated requests from the frontend
   - Forwards them to your FOSSBilling instance with the API key
   - Handles order creation, account provisioning, plan management

2. **`stripe-webhook` Edge Function** — Handles Stripe webhook events
   - Listens for `checkout.session.completed`, `invoice.paid`, `subscription.deleted`
   - Triggers FOSSBilling provisioning on successful payment
   - Updates database records

3. **Secrets needed:**
   - `FOSSBILLING_API_URL` — Your FOSSBilling instance URL
   - `FOSSBILLING_API_KEY` — API key for FOSSBilling
   - `STRIPE_SECRET_KEY` — Already configured ✓

4. **CORS** — Already handled in all edge functions (allows `*`, which covers `serverus.cloud`)

### Technical Details

```text
Frontend (React)
    │
    ├── supabase.functions.invoke('create-checkout')   ← Already exists
    ├── supabase.functions.invoke('fossbilling-proxy')  ← New
    │       │
    │       └── Calls FOSSBilling API (server-side, secure)
    │
    └── Stripe Checkout redirect
            │
            └── stripe-webhook Edge Function ← New
                    │
                    ├── Updates DB (invoices, hosting_plans)
                    └── Calls FOSSBilling to provision hosting
```

### Steps

1. Add `FOSSBILLING_API_URL` and `FOSSBILLING_API_KEY` as secrets
2. Create `fossbilling-proxy` edge function with endpoints for: list orders, create order, get client details, provision hosting
3. Create `stripe-webhook` edge function to handle payment events and trigger provisioning
4. Update `create-checkout` to include FOSSBilling product metadata if needed
5. Wire frontend to call the new functions where needed

### If You Need a Separate Express Server

If you specifically need a standalone Node.js Express server (e.g., to deploy on your own VPS alongside FOSSBilling), that would need to be built **outside** of Lovable as a separate project. Lovable can build the frontend that calls it, but cannot host the server itself.

