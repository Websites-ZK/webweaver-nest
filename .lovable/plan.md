

## Plan: Add "Transfer Domain" tab + Admin "Domain Management" tab

### Overview
Add a new "Transfer Domain" sidebar item in the client dashboard and a new "Domain Management" tab in the admin panel. Both call external API endpoints on `api.serverus.cloud`.

### Security Note
The `VITE_ADMIN_SECRET` is a **publishable** environment variable exposed in the client bundle. Since the admin page is already role-gated, this is acceptable per the user's request — but this secret will be visible in browser source. If stronger protection is needed later, it should move to an edge function.

### Changes

**1. New file: `src/components/dashboard/TransferDomainTab.tsx`**
- Input field for domain name + "Transfer Domain" button
- On submit: `POST https://api.serverus.cloud/api/client/transfer-domain` with `x-client-token` from `localStorage.getItem("fossbilling_token")`, body `{ domain }`
- Success state: show nameservers (`grant.ns.cloudflare.com`, `sonia.ns.cloudflare.com`) + instructions
- Error handling: 403 → no active package message, 402 → additional domain cost message, other → show API error text
- Uses existing Card, Input, Button, Alert components

**2. Edit: `src/components/dashboard/DashboardSidebar.tsx`**
- Add `{ id: "transfer-domain", icon: ArrowRightLeft, label: "Transfer Domain" }` to sidebar items (after "domains")

**3. Edit: `src/pages/Dashboard.tsx`**
- Import `TransferDomainTab`
- Add `case "transfer-domain"` to `renderTab()` switch

**4. New file: `src/components/admin/AdminDomainManagementTab.tsx`**
- Form with 3 fields: domain, client email, client name
- On submit: `POST https://api.serverus.cloud/api/admin/add-domain` with `x-api-secret` header from `import.meta.env.VITE_ADMIN_SECRET`
- Success: show nameservers + domain details
- Note banner: "Admin bypass - no package check performed"
- Uses existing Card, Input, Button, Label components

**5. Edit: `src/pages/Admin.tsx`**
- Add new "Domain Management" tab trigger (Globe icon) and TabsContent rendering `AdminDomainManagementTab`

**6. Store `VITE_ADMIN_SECRET`**
- Since this is a `VITE_` prefixed env var, it needs to be added to the codebase. Will ask the user to provide the value or add it as a build-time variable.

