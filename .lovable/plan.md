

# KPI Dashboard + Automated Reports for User Dashboard

## What We're Building

Adding a new **KPI** tab to the user dashboard that consolidates key metrics (users/plans, revenue, uptime) with conversion tracking, churn analysis, and automated email/download reports.

## Plan

### 1. New sidebar tab: "KPI"
- Add a "KPI" entry to `DashboardSidebar.tsx` with a `BarChart3` icon
- Add the route case in `Dashboard.tsx` to render the new `KPITab` component

### 2. Create `src/components/dashboard/KPITab.tsx`

This single component contains three sections:

**Section A — KPI Cards (top row)**
- **Active Plans** — count of user's active hosting plans
- **Total Revenue** — sum of user's paid invoices
- **Uptime** — pulled from `server_health_checks` (last 30 days average, calculated client-side from the user's linked domains)

**Section B — Conversion Tracking & Revenue Dashboard**
- **Revenue over time** — area chart (recharts) showing monthly invoice totals from the user's invoice history
- **Plan conversion** — simple visual showing which plans the user upgraded/downgraded (based on invoice history pattern)

**Section C — Churn Analysis**
- **Expiring plans** — list of plans expiring within 30 days with warning badges
- **Renewal rate** — percentage of plans that were renewed vs expired

### 3. Automated Reports Section
- **"Download Report" button** — generates a PDF/CSV summary of the user's KPIs (plans, revenue, uptime) using client-side generation
- **Report includes**: current plan status, storage/bandwidth usage, invoice summary, uptime stats
- Uses a simple CSV export (no extra dependencies needed)

### 4. Translation keys
- Add EN + HR keys for all new labels in `LanguageContext.tsx`: `dash.kpi`, `dash.kpiDesc`, `dash.totalRevenue`, `dash.uptimeAvg`, `dash.churnAnalysis`, `dash.expiringPlans`, `dash.renewalRate`, `dash.downloadReport`, `dash.conversionTracking`, `dash.revenueOverTime`

### Files Changed
- `src/components/dashboard/DashboardSidebar.tsx` — add KPI menu item
- `src/pages/Dashboard.tsx` — add KPI tab case + pass data
- `src/components/dashboard/KPITab.tsx` — **new file**, main KPI dashboard
- `src/contexts/LanguageContext.tsx` — add translation keys

### Technical Notes
- Revenue and churn data comes from existing `invoices` and `hosting_plans` tables (already fetched in Dashboard.tsx)
- Uptime data fetched from `server_health_checks` filtered by user's domains
- Charts use existing recharts infrastructure
- CSV export uses browser-native Blob download, no extra libraries

