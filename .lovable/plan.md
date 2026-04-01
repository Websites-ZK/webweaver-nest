

## Admin Dashboard

A separate `/admin` route accessible only to users with an `admin` role, featuring real-time monitoring, analytics, and alerting across multiple categories.

### Database Changes

1. **`user_roles` table** — role-based access (as per security guidelines)
   - `id`, `user_id` (FK auth.users), `role` (enum: admin, moderator, user)
   - RLS via `has_role()` security definer function
   - Assign admin role to your account via insert tool after migration

2. **`server_health_checks` table** — stores periodic uptime/health pings
   - `id`, `target_url`, `status_code`, `response_time_ms`, `is_up` (bool), `checked_at`
   - No RLS needed (admin-only reads via function)

3. **`admin_alerts` table** — stores triggered alerts
   - `id`, `alert_type` (downtime/high_cpu/high_ram/threshold), `severity` (info/warning/critical), `message`, `is_resolved`, `created_at`, `resolved_at`

4. **`onboarding_events` table** — tracks user funnel progression
   - `id`, `user_id`, `step` (int 0-4), `action` (entered/completed/abandoned), `metadata` (jsonb), `created_at`

5. **DB function** `get_admin_stats()` — security definer returning: total users, total revenue, active plans, active domains, MRR, churn indicators, onboarding completion rates

6. **DB function** `get_onboarding_funnel()` — returns step-by-step drop-off counts

### Edge Function

**`health-check`** — scheduled via pg_cron every 60 seconds
- Pings configured URLs, records response time + status in `server_health_checks`
- If a check fails, inserts alert into `admin_alerts`
- Returns current health status for on-demand calls

### Frontend — New Pages & Components

**`src/pages/Admin.tsx`** — main admin page
- Checks `has_role(uid, 'admin')` via RPC on mount; redirects non-admins
- Sidebar with tabs: Overview, Server Health, Users, Analytics, Onboarding Funnel, Alerts, Revenue

**Admin tab components** (all under `src/components/admin/`):

1. **`AdminOverviewTab.tsx`** — KPI cards
   - Total users, active hosting plans, total domains, MRR, total revenue
   - Quick health status indicator (green/yellow/red)
   - Recent alerts list

2. **`ServerHealthTab.tsx`** — uptime monitoring
   - Current status per monitored URL (up/down badge, response time)
   - Uptime percentage (24h, 7d, 30d) — calculated from `server_health_checks`
   - Response time chart (line chart via recharts, already installed)
   - Check interval: 60 seconds (industry standard; competitors use 1-5 min)
   - Live auto-refresh every 30s via polling

3. **`UsersTab.tsx`** — user management
   - Paginated table of all users (profiles joined with hosting_plans count)
   - Search/filter by email, plan, status
   - User detail: plans, domains, invoices, referral stats

4. **`AnalyticsTab.tsx`** — site-wide analytics
   - Signups over time (bar chart)
   - Revenue over time (area chart)
   - Plan distribution (pie chart)
   - Geographic distribution by server location

5. **`OnboardingFunnelTab.tsx`** — conversion tracking
   - Step-by-step funnel visualization (plan select → extras → domain → review → checkout)
   - Drop-off rates per step with percentages
   - Requires instrumenting Onboarding.tsx to log events to `onboarding_events`

6. **`AlertsTab.tsx`** — alert history & management
   - List of all alerts, filterable by type/severity/resolved status
   - Resolve/acknowledge buttons
   - Alert configuration (thresholds for CPU, RAM, response time)

7. **`RevenueTab.tsx`** — financial overview
   - Total revenue, MRR, average revenue per user
   - Invoice status breakdown (paid/pending)
   - Referral credits issued vs redeemed

### Onboarding Instrumentation

Update `src/pages/Onboarding.tsx` to insert rows into `onboarding_events` when users enter/complete/abandon each step. This powers the funnel analytics.

### Route & Navigation

- Add `/admin` route in `App.tsx`
- Admin link visible in Navbar only for admin users (check role via RPC)
- Separate sidebar from user dashboard (admin-specific navigation)

### Uptime Check Intervals — Competitive Context

| Provider | Free Tier | Paid Tier |
|----------|-----------|-----------|
| UptimeRobot | 5 min | 1 min |
| Better Uptime | 3 min | 30 sec |
| Pingdom | 1 min | 1 min |

Our approach: **60-second intervals** via pg_cron, which matches or beats most competitors. Health data auto-refreshes in the dashboard every 30 seconds.

### Technical Notes

- All admin queries use security definer functions to bypass per-user RLS safely
- Charts use the existing recharts/chart.tsx infrastructure
- Admin role check happens server-side (RPC `has_role`), never client-side storage
- Translations added to LanguageContext for all admin UI strings (EN + HR)
- ~10 new files total; no changes to existing user dashboard

