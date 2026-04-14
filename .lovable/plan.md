

## Admin Dashboard: Real Server Monitoring Integration

Currently the admin dashboard uses synthetic/demo data from the database. This plan connects it to your real server at `https://api.serverus.cloud` to display live system metrics, service statuses, nginx logs, FOSSBilling stats, and Backblaze B2 backup status.

### Prerequisites

A new secret `SERVERUS_API_TOKEN` is needed for authenticating with `https://api.serverus.cloud`. You will be prompted to enter it.

### Architecture

```text
Admin Dashboard (React)
  → supabase.functions.invoke('server-monitor')
      → fetch('https://api.serverus.cloud/...', { Authorization: Bearer TOKEN })
      → Returns live data to frontend
```

A single new edge function `server-monitor` acts as a secure proxy to your API, keeping the Bearer token server-side.

### What to Build

**1. Edge Function: `server-monitor`**

Accepts an `action` parameter and proxies to your API:

| Action | Upstream Endpoint (assumed) | Returns |
|---|---|---|
| `system_health` | `/api/system/health` | CPU, RAM, Disk usage |
| `services_status` | `/api/services/status` | nginx, cloudflared, ttyd up/down |
| `nginx_logs` | `/api/logs/nginx?domain=X&lines=50` | Last 50 nginx log lines per domain |
| `fossbilling_stats` | `/api/fossbilling/stats` | Total clients, orders, revenue |
| `backup_status` | `/api/backup/status` | Last Backblaze B2 backup info |

The function validates JWT, checks admin role via `has_role`, then forwards the request.

**2. Updated `ServerHealthTab` Component**

Replace the current DB-only view with a richer layout:

- **System Resources section**: Three gauges (CPU, RAM, Disk) with percentage bars, auto-refreshing every 30s
- **Services Status section**: Green/red dot indicators for nginx, cloudflared, ttyd
- **Keep existing**: Response time charts and uptime percentages from `server_health_checks` table

**3. New Admin Tab: "Server Logs"**

- Domain selector dropdown
- Displays last 50 nginx log lines in a monospace scrollable container
- Manual refresh button

**4. Enhanced Admin Overview**

Add two new cards:
- **FOSSBilling Stats**: Total clients, active orders, revenue pulled from your API
- **Backup Status**: Last backup time, size, status from Backblaze B2

### Steps

1. Add `SERVERUS_API_TOKEN` secret
2. Create `server-monitor` edge function with all 5 actions
3. Deploy and test the edge function
4. Update `ServerHealthTab` with live CPU/RAM/Disk gauges and services status indicators
5. Create `ServerLogsTab` component for nginx logs
6. Add FOSSBilling stats and backup status cards to `AdminOverviewTab`
7. Add "Logs" tab to Admin page

### Important Note

I need to know your exact API endpoint paths. The ones above are assumed. If your API uses different routes (e.g., `/v1/stats/system` instead of `/api/system/health`), let me know and I will adjust.

