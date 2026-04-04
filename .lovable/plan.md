

## Monthly Dashboard Tab for Admin Panel

### Overview
Add a new "Monthly Dashboard" tab to the admin panel that displays aggregated monthly server metrics. This is a higher-level reporting view compared to the existing daily dashboard, focusing on monthly summaries, SLA compliance, capacity planning, and operational health.

### New Metrics (20 items)
The monthly dashboard will track these metrics with thresholds matching the user's specification:

| Metric | Threshold | Source/Note |
|--------|-----------|-------------|
| Ukupni uptime mjesec (%) | SLA >99.9% | From monitoring log |
| Prosječni CPU mjesec (%) | Warn >55% | Monthly average |
| Prosječni RAM mjesec (%) | Warn >65% | Monthly average |
| Ukupni promet (GB/mj) | Track growth | Compare with ISP plan |
| Disk rast (GB/mj) | Warn >50 GB | Capacity planning |
| Ukupni broj incidenata | Target 0, max 2 | With description/duration |
| Prosječno MTTR (min) | Target <30 min | Mean time to recover |
| Backup restore test | Must be successful | Full restore test |
| Hardware temperatura trend | Rising? | Compare with previous month |
| RAM error check (ECC) | Zero ECC errors | mcelog / edac-util |
| SMART status diskova | All PASSED | smartctl |
| Broj aktivnih klijenata | Track growth | +/- from last month |
| Prihodi od hostinga (€) | — | Compare with forecast |
| Kapacitet RAM iskorištenost (%) | Warn >70% | Signal for new server |
| Kapacitet disk iskorištenost (%) | Warn >75% | Plan disk |
| SSL certifikati pregled | None expiring <30 days | All domains list |
| Sigurnosni penetration pregled | No open ports | nmap scan |
| Pregled log arhive | Archive and delete old | Free disk space |
| Procjena za novi hardver | If RAM >70% or disk >75% | Capacity flag |

### Implementation Steps

**Step 1: Database migration**
- Create `server_monthly_metrics` table with columns: `id`, `server_id`, `month` (date, first of month), `metric`, `value`, `status`, `notes`, `recorded_by`, `recorded_at`
- Add RLS policies for admin access (same pattern as `server_daily_metrics`)

**Step 2: Create `ServerMonthlyDashboardTab.tsx`**
- Follow the same pattern as `ServerDailyDashboardTab.tsx` (server selector, month picker instead of date picker, metrics table with inline editing)
- Month picker using a simple month/year selector
- Each metric row: icon, metric name, threshold description, recorded value, auto-evaluated status badge, notes, recorded_by, edit button
- Color-coded rows (green/yellow/red) based on status
- Summary cards at top showing overall server health score for the month

**Step 3: Add tab to Admin page**
- Add a new "Monthly Dashboard" tab with a `CalendarDays` icon to `Admin.tsx`
- Wire the new component

**Step 4: Add translation keys**
- Add all necessary translation keys to `LanguageContext.tsx` for the 20 metrics and UI labels

### Technical Details
- Reuses the same `servers` table for server selection
- New `server_monthly_metrics` table mirrors `server_daily_metrics` structure but uses a `month` date field (always first of month)
- Month picker will use a dropdown for month + year selection (simpler than calendar)
- The METRICS config array will define all 20 monthly metrics with evaluation functions matching the specified thresholds
- Text-based metrics (backup test, SMART, ECC, penetration scan, etc.) use the same `isTextMetric` pattern from the daily dashboard

