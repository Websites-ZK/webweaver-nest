

## Why verdia.space is missing
The Domains tab queries Postgres `domains` table only. aaPanel is never consulted. Anything created directly in aaPanel (like `verdia.space`) stays invisible to our app.

## Fix: two-part sync from aaPanel → our DB

### Part A — VPS side (api.serverus.cloud, outside Lovable repo)
Add one endpoint that proxies aaPanel's site list:

```
GET /aapanel/sites   → Bearer auth
returns: [{ name, status, ssl, created, expire, path }, ...]
```

Use aaPanel's built-in API (`POST /data?action=getData&table=sites` with the panel's API key + md5 timestamp signature). I'll give you the exact Node snippet when we implement.

### Part B — Lovable side
1. **New edge function** `sync-aapanel-domains` (admin-only, callable on demand + via cron)
   - Calls `GET https://api.serverus.cloud/aapanel/sites`
   - Upserts into `domains` table by `domain_name` (so re-runs are idempotent)
   - Assigns ownership: matches site name against existing FOSSBilling client emails; unmatched sites get assigned to admin user (`791336be…`) with `dns_provider = 'aaPanel'` so they're visible
   - Returns `{ added, updated, total }`

2. **Sync button in admin** — small "Sync from aaPanel" button in `AdminDomainManagementTab.tsx` (and optionally in `DomainsTab.tsx` for the admin user) that invokes the function and toasts the result.

3. **Optional cron** — pg_cron entry to run the sync every 15 min so new aaPanel sites appear automatically.

### Files
- **New** `supabase/functions/sync-aapanel-domains/index.ts` (~80 lines)
- **Edit** `src/components/admin/AdminDomainManagementTab.tsx` — add Sync button + result panel
- **Migration** (optional cron) — `cron.schedule('sync-aapanel', '*/15 * * * *', ...)`

## Result
After Part A is deployed and we click Sync, `verdia.space` plus every other aaPanel site appears in the Domains tab and stays in sync going forward.

