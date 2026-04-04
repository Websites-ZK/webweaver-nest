

## Auto-Aggregate Monthly Metrics from Daily Data

### Overview
Remove manual entry for metrics that can be computed from daily data. When the Monthly Dashboard loads (or when server/month changes), it automatically queries `server_daily_metrics` for that month, computes aggregations, and displays them. No button needed — it happens on every load. The 10 metrics without daily equivalents remain manually editable.

### Mapping: Daily → Monthly (auto-computed, read-only display)

| Monthly Metric | Daily Source Key | Aggregation |
|---|---|---|
| `monthly_uptime` | `uptime` | AVG |
| `avg_cpu_month` | `cpu_usage` | AVG |
| `avg_ram_month` | `ram_usage` | AVG |
| `total_traffic_gb` | `network_traffic_gb` | SUM |
| `disk_growth_gb` | `disk_usage` | MAX − MIN |
| `total_incidents` | `uptime` | COUNT where uptime < 100 |
| `hw_temp_trend` | `cpu_temp` | Compare first-half vs second-half avg → "RISING"/"STABLE"/"FALLING" |
| `capacity_ram_pct` | `ram_usage` | Last recorded value |
| `capacity_disk_pct` | `disk_usage` | Last recorded value |

### Remaining manual-only metrics (10)
`avg_mttr_min`, `backup_restore_test`, `ram_ecc_errors`, `smart_status`, `active_clients`, `hosting_revenue_eur`, `ssl_cert_review`, `security_scan`, `log_archive_review`, `hw_upgrade_assessment`

### Implementation (single file change)

**Modify `ServerMonthlyDashboardTab.tsx`:**

1. Add a `useEffect` that fetches all `server_daily_metrics` rows for the selected server + month range whenever server/month changes
2. Compute the 9 aggregations client-side from daily rows
3. Mark each metric config with `autoFromDaily: true` for the 9 auto-computed metrics
4. For auto-computed metrics: display the calculated value directly (no edit button, show "Auto" badge)
5. For manual metrics: keep existing inline edit behavior unchanged
6. Auto-compute `hw_upgrade_assessment` text based on `capacity_ram_pct` and `capacity_disk_pct` values (making it 10 auto-computed)
7. Optionally persist auto-calculated values to `server_monthly_metrics` via upsert (with `recorded_by: "auto"`) so there's a historical record

### UI Changes
- Auto-computed rows show a small "Auto" badge next to the value
- No edit button on auto-computed rows (or allow override with a toggle)
- No "Auto-calculate" button — data appears automatically on load

### Translation Keys
- `admin.autoCalculated` → "Auto" / "Auto"

