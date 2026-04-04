

## Plan: Server Daily Dashboard for Admin Panel

### Overview
Add a new "Server Dashboard" tab to the Admin panel that provides a comprehensive daily monitoring view per server. A dropdown at the top lets the admin select a server, and the dashboard displays all 18 metrics from the provided table with their thresholds, current values, and status indicators.

### Database Changes

**New table: `servers`** — stores the list of physical/virtual servers being monitored.
- `id` (uuid, PK)
- `name` (text, unique) — e.g. "EU-Frankfurt-01"
- `location` (text)
- `created_at` (timestamptz)
- RLS: admin-only SELECT

**New table: `server_daily_metrics`** — stores daily metric snapshots per server.
- `id` (uuid, PK)
- `server_id` (uuid, FK → servers)
- `metric` (text) — one of: cpu_usage, ram_usage, disk_usage, cpu_temp, uptime, active_sites, network_traffic_gb, failed_logins, backup_status, load_average, ping_latency_ms, dns_resolution, ssl_days_remaining, apache_status, mysql_status, mail_status, free_ram_gb, swap_usage
- `value` (numeric) — the measured value
- `status` (text) — 'ok', 'warning', 'critical'
- `notes` (text, nullable) — additional context
- `recorded_by` (text, nullable) — who entered the data
- `recorded_at` (timestamptz, default now())
- `date` (date, default CURRENT_DATE)
- RLS: admin-only SELECT, INSERT, UPDATE

### Frontend Changes

**1. New component: `src/components/admin/ServerDailyDashboardTab.tsx`**
- Server selector dropdown at top (fetches from `servers` table)
- Date picker (defaults to today)
- Table with all 18 metrics showing:
  - Metric name with icon
  - Threshold/warning levels (hardcoded display based on the spec)
  - Current recorded value
  - Status badge (OK/Warning/Critical)
  - Notes column
  - Recorded by column
- "Add/Edit Reading" inline editing for manual data entry
- Color-coded rows: green (ok), amber (warning), red (critical)

**2. Update `src/pages/Admin.tsx`**
- Add new tab "Server Dashboard" with a `Monitor` icon
- Import and render `ServerDailyDashboardTab`

**3. Update `src/contexts/LanguageContext.tsx`**
- Add translation keys for the new tab and all 18 metric labels

### Metric Configuration (hardcoded in component)

Each metric will have its display config:

```text
Metric                  | Warn Threshold    | Crit Threshold    | Unit
------------------------|-------------------|-------------------|------
CPU usage               | >70%              | >90%              | %
RAM usage               | >75%              | >90%              | %
Disk usage              | >80%              | >95%              | %
CPU temperature         | >70°C             | >85°C             | °C
Uptime                  | <100%             | <100%             | %
Active websites         | any offline       | —                 | count
Network traffic         | >50 GB/day        | —                 | GB
Failed logins           | >50               | >200              | count
Backup status           | —                 | not SUCCESS        | text
Load average (1min)     | >8                | >14               | float
Ping latency            | >50ms             | >100ms            | ms
DNS resolution          | —                 | fail              | text
SSL certificates        | <14 days          | —                 | days
Apache/Nginx status     | —                 | not RUNNING        | text
MySQL/MariaDB status    | —                 | not RUNNING        | text
Mail/Postfix status     | —                 | not RUNNING        | text
Free RAM                | <50 GB            | <20 GB            | GB
Swap usage              | >30%              | >60%              | %
```

### Files to Create/Modify
1. **Migration** — create `servers` and `server_daily_metrics` tables with RLS
2. **`src/components/admin/ServerDailyDashboardTab.tsx`** — new component
3. **`src/pages/Admin.tsx`** — add tab
4. **`src/contexts/LanguageContext.tsx`** — add translation keys

