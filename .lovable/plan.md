

## Generate Standalone Node.js Express API Server

Since Lovable cannot host a persistent Node.js server, I will **generate the complete Express project as a downloadable artifact** you can deploy to your server at `api.serverus.cloud`.

### Also: Fix remaining `/api/` bug in stripe-webhook

The `stripe-webhook` edge function (line 23) still appends `/api/` to `FOSSBILLING_API_URL`, causing the same double-path bug we fixed in `fossbilling-proxy`. This will be fixed too.

### What gets generated

A complete Express project at `/mnt/documents/serverus-api/` with:

```text
serverus-api/
├── package.json
├── .env.example
├── server.js
├── routes/
│   ├── stripe.js        # POST /api/create-payment-intent, POST /api/webhook/stripe
│   ├── fossbilling.js    # POST /api/client/create, GET /api/domain/check,
│   │                     # POST /api/domain/register, POST /api/order/create
│   └── health.js         # GET /api/health (for server-monitor)
└── lib/
    └── fossbilling.js    # Shared FOSSBilling API helper
```

### Endpoint details (aligned with existing edge functions)

| Endpoint | Method | Logic source |
|---|---|---|
| `/api/create-payment-intent` | POST | Mirrors `create-checkout` — same plan pricing, extras, period multipliers |
| `/api/webhook/stripe` | POST | Mirrors `stripe-webhook` — provisions hosting plan, creates FOSSBilling order |
| `/api/client/create` | POST | Mirrors `fossbilling-proxy` `create_client` action |
| `/api/domain/check` | GET | Mirrors `check_domain` — FOSSBilling TLDs + Google DNS |
| `/api/domain/register` | POST | Mirrors `register_domain` — find/create client, create domain order |
| `/api/order/create` | POST | Mirrors `create_order` — find/create client, create hosting order |
| `/api/health` | GET | Simple health check endpoint |

### Key alignment points

- **Stripe**: Same plan definitions (basic/standard/business/agency), same pricing multipliers, same extras, same metadata structure
- **FOSSBilling**: Same URL construction fix (`baseUrl` already includes `/api/`), same `findOrCreateClient` logic, same Bearer token auth
- **CORS**: Configured for `*.serverus.cloud` origins
- **Environment variables**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FOSSBILLING_ADMIN_TOKEN`, `PORT=4000`

### Steps

1. Fix `/api/` duplication in `stripe-webhook` edge function (line 23)
2. Generate the complete Express project as downloadable files
3. Include `.env.example` with all required variables
4. Include `README.md` with deployment instructions

### Deployment (for your reference)

```bash
cd serverus-api
npm install
cp .env.example .env   # fill in your keys
node server.js         # runs on port 4000
```

Then point `api.serverus.cloud` to your server via Cloudflare/nginx.

