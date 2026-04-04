

# Add High-Load Automatic Alerts to Admin Dashboard

## Current State
Downtime alerts work end-to-end (health-check → admin_alerts → user_notifications → WhatsApp). But there are NO alerts for high resource usage (CPU, RAM, disk exceeding thresholds). The hosting_plans table already stores `ram_used_mb`, `storage_used_gb`, `bandwidth_used_gb` etc.

## What We'll Build

### 1. Database: `alert_thresholds` table
Stores configurable thresholds for resource alerts.

```
id, metric (cpu | ram | disk | bandwidth), threshold_percent (default 90),
severity (warning | critical), is_enabled (default true), created_at, updated_at
```

- RLS: admin-only SELECT/INSERT/UPDATE
- Seed default rows: CPU 90% critical, RAM 85% warning, RAM 95% critical, Disk 90% critical

### 2. Edge function: `check-resource-alerts`
- Queries all active `hosting_plans` and compares usage against `alert_thresholds`
- For each breach: inserts into `admin_alerts` (type: "high_load") and `user_notifications`
- Avoids duplicate alerts: only fires if no unresolved alert exists for the same plan + metric in the last hour
- Can be called on a schedule (cron) or manually

### 3. Admin UI: Alert Thresholds Config
Add a new section in `AlertsTab.tsx`:
- Card showing current thresholds in a small table
- Inline edit to toggle enabled/disabled and adjust percentage
- Visual indicator of which thresholds are active

### 4. Admin UI: High-Load Alerts Display
The existing `AlertsTab` already displays all `admin_alerts` — new high_load alerts will appear automatically with appropriate severity badges.

### 5. Translation keys
Add EN/HR keys for: threshold settings, high load alert messages, metric names.

## Files Changed
- **New migration**: `alert_thresholds` table + seed defaults
- **New edge function**: `supabase/functions/check-resource-alerts/index.ts`
- `src/components/admin/AlertsTab.tsx` — add threshold configuration section
- `src/contexts/LanguageContext.tsx` — add translation keys
- `supabase/functions/health-check/index.ts` — optionally call `check-resource-alerts` after uptime check

## Technical Notes
- Thresholds are percentage-based: `(used / total) * 100 >= threshold`
- CPU doesn't have a "total" in the current schema, so we'll use `cpu_cores` as capacity and add a `cpu_used_percent` column to `hosting_plans` (or compute from simulated data)
- Alert deduplication prevents spam: one alert per metric per plan per hour

