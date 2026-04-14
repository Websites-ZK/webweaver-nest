

## Fix FOSSBilling Proxy & Add Domain Endpoints

### Current State
- `fossbilling-proxy` already has `create_client` and `create_order` actions
- `check-domain` exists but uses Google DNS only — not FOSSBilling
- **Bug**: `fossbillingRequest()` appends `/api/` to `FOSSBILLING_API_URL`, but your base URL is already `https://fossbilling.serverus.cloud/api/` — this would produce double `/api/api/`

### Changes

**1. Fix URL construction in `fossbilling-proxy`**

Remove the `/api/` append in `fossbillingRequest()` since the env var already includes it:
```
// Before: `${baseUrl}/api/${endpoint}`
// After:  `${baseUrl}/${endpoint}`
```

**2. Add two new actions to `fossbilling-proxy`**

| Action | FOSSBilling Endpoint | Purpose |
|---|---|---|
| `check_domain` | `guest/servicedomain/tlds` + WHOIS lookup | Check if domain is available for registration |
| `register_domain` | `admin/order/create` with domain product | Create order for domain registration |

- `check_domain`: Calls FOSSBilling's TLD listing and/or uses the existing Google DNS check as fallback. Accepts `{ domain, tld }`.
- `register_domain`: Finds/creates client, then creates an order with the domain product config. Accepts `{ domain, tld, period, product_id }`.

**3. Update `check-domain` edge function**

Add a FOSSBilling TLD price lookup alongside the existing DNS availability check, so the response includes both availability and pricing.

### Steps
1. Fix `fossbillingRequest` URL construction (remove `/api/` duplication)
2. Add `check_domain` action — query FOSSBilling for TLD availability/pricing
3. Add `register_domain` action — create domain order via FOSSBilling admin API
4. Update `check-domain` to also return TLD pricing from FOSSBilling
5. Deploy both functions and test with `curl_edge_functions`

