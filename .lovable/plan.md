

## User Dashboard with Hosting Management

### Overview
Build a full user dashboard accessible from the profile icon dropdown. Modeled after Bluehost/Hostinger: sidebar navigation, hosting overview cards, domain management, storage usage, and account settings.

### Changes

**1. Database — New tables via migration**

- `hosting_plans`: id, user_id, plan_name, billing_period, status (active/expired/cancelled), domain, server_location, storage_limit_gb, storage_used_gb, bandwidth_limit, bandwidth_used, cpu_cores, created_at, expires_at
- `domains`: id, user_id, domain_name, status (active/pending/expired), dns_provider, ssl_enabled, registered_at, expires_at
- `invoices`: id, user_id, amount, currency, status (paid/pending/overdue), description, created_at, due_date

RLS policies so users can only read/update their own records. Seed demo data via a trigger on profile creation for demonstration purposes.

**2. New pages**

- **`/dashboard`** — Main dashboard with sidebar layout using existing `Sidebar` component:
  - **Overview tab**: Welcome banner with user name, quick stats cards (active plans count, domains count, storage usage %, next invoice), hosting plan cards showing plan name/status/domain/server location/expiry with progress bars for storage and bandwidth
  - **Domains tab**: Table of domains with status badges, SSL toggle indicator, expiry dates, "Add Domain" button
  - **Billing tab**: Invoice history table, current plan details, upcoming renewal info
  - **Settings tab**: Profile form (name, email), password change, notification preferences

- **`/dashboard/hosting/:id`** — Single hosting plan detail page: resource usage gauges (CPU, RAM, Storage, Bandwidth), quick actions (File Manager, Backups, DNS, SSL), recent activity log

**3. Update Navbar profile dropdown**

Expand the user dropdown menu to include:
- Dashboard (links to `/dashboard`)
- My Hosting (links to `/dashboard` with hosting tab)
- Domains (links to `/dashboard` with domains tab)  
- Billing (links to `/dashboard` with billing tab)
- Settings (links to `/dashboard` with settings tab)
- Divider
- Log out

**4. Update routing — `src/App.tsx`**

Add routes: `/dashboard`, `/dashboard/hosting/:id`. Wrap in auth guard (redirect to `/login` if not authenticated).

**5. Translations — `src/contexts/LanguageContext.tsx`**

Add dashboard-related keys for all 9 languages: sidebar labels, card titles, status labels, table headers, settings form labels.

**6. New components**

- `src/components/dashboard/DashboardSidebar.tsx` — Sidebar with icon nav items (Overview, Hosting, Domains, Billing, Settings)
- `src/components/dashboard/OverviewTab.tsx` — Stats cards + hosting plan cards with usage bars
- `src/components/dashboard/DomainsTab.tsx` — Domains table with status badges
- `src/components/dashboard/BillingTab.tsx` — Invoice table + plan renewal info
- `src/components/dashboard/SettingsTab.tsx` — Profile edit form + password change
- `src/components/dashboard/HostingDetail.tsx` — Resource gauges + quick actions
- `src/components/dashboard/UsageBar.tsx` — Reusable progress bar with label and percentage

### Technical Details
- Dashboard uses the existing `SidebarProvider` + `Sidebar` components
- Tab routing via URL search params (`?tab=domains`) for shareability
- Storage/bandwidth displayed as percentage progress bars with color coding (green < 70%, yellow < 90%, red >= 90%)
- All data fetched from database via Supabase client with proper RLS
- Responsive: sidebar collapses on mobile, cards stack vertically
- Login redirect after sign-in changed from `/` to `/dashboard`

