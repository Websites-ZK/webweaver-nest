

## Goal
Add an aaPanel-style "Sys Status" widget to admin Overview that shows: **Load average · CPU % + cores · RAM used/total MB · Per-mount Disk %** — refreshing every 5 seconds.

## Data flow

```text
aaPanel-style widget (React, refresh 5s)
        │
        ▼
useServerMonitor("system_health", undefined, 5000)
        │
        ▼
supabase.functions.invoke("server-monitor")  ← admin JWT check
        │  action: "system_health"
        ▼
Edge Function proxies to:
GET https://api.serverus.cloud/metrics/server
Auth: Bearer SERVERUS_API_TOKEN
        │
        ▼
Node/Express VPS API reads via `os` + `df` + `/proc`
returns JSON → bubbles back to React
```

## Current vs needed payload

The serverus API today returns only:
```json
{ "cpu": "0.1", "mem": "1441/15653", "disk": "28%" }
```

To match the aaPanel widget we need it to return:
```json
{
  "cpu_percent": 0.1,
  "cpu_cores": 12,
  "load_avg": [0.00, 0.00, 0.00],
  "mem_used_mb": 1441,
  "mem_total_mb": 15653,
  "disks": [
    { "mount": "/",     "used_gb": 19.42, "total_gb": 69.93, "percent": 28 },
    { "mount": "/home", "used_gb": 3.31,  "total_gb": 158.97,"percent": 3  }
  ],
  "status": "smooth"
}
```

The serverus API is a **separate Node/Express project on the VPS** (not in this repo), so the upstream code change happens there. On the Lovable side we just need to:
1. Make the proxy pass-through the richer payload (already does — no change needed in `server-monitor/index.ts`).
2. Build the React widget that consumes it, with a graceful fallback to the old `{cpu, mem, disk}` strings if the upstream hasn't been upgraded yet.

## What to build in this repo

**New file: `src/components/admin/SysStatusWidget.tsx`** — aaPanel look-alike with 4 sections:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Sys Status                                          ● refreshes every 5s │
├─────────────┬──────────────┬──────────────┬─────────────────────────────┤
│   Load      │   CPU        │   RAM        │   Disk (per mount)          │
│   ◯ 0%      │   ◯ 0.1%     │   ◯ 9.2%     │   /     ◯ 28%   19.4/69.9GB │
│   Smooth op │   12 Core(s) │ 1441/15653MB │   /home ◯  3%    3.3/159 GB │
│   0.00/0/0  │   CPU usage  │   RAM usage  │                             │
└─────────────┴──────────────┴──────────────┴─────────────────────────────┘
```

- Uses circular SVG progress rings (lightweight, no extra deps) styled with `text-emerald-500 / amber / destructive` based on threshold (matching existing convention).
- Color thresholds: green <70%, amber 70–85%, red >85%.
- "Smooth operation" label when load_avg[0] < cpu_cores * 0.7.
- Refresh cadence: `useServerMonitor("system_health", undefined, 5000)` — already supported.

**Edit: `src/components/admin/AdminOverviewTab.tsx`** — replace the current 3-bar "Live Server Resources" block with `<SysStatusWidget />` at the top of the cockpit (above Ops Pulse) so it's the first thing admins see.

**Edit: `src/hooks/useServerMonitor.ts`** — no change needed (already supports refresh intervals).

**No edge function code change required** — proxy is already pass-through.

## What you (or we) need to ship on the VPS side

The serverus Node API at `api.serverus.cloud` needs `/metrics/server` upgraded to return the richer JSON above. Quick recipe (the API is in a separate project, not this repo):

```js
// /metrics/server
import os from "os";
import { execSync } from "child_process";

app.get("/metrics/server", (_req, res) => {
  const cpus = os.cpus();
  const totalMem = os.totalmem() / 1024 / 1024;
  const freeMem  = os.freemem()  / 1024 / 1024;
  const load     = os.loadavg();

  // CPU % via 1s sample (or use `top -bn1`)
  const cpuPct = Number(execSync(`top -bn1 | grep 'Cpu(s)' | awk '{print $2+$4}'`).toString().trim());

  // Per-mount disk
  const dfOut = execSync("df -BG --output=target,used,size,pcent / /home").toString();
  const disks = dfOut.trim().split("\n").slice(1).map(line => {
    const [mount, used, size, pcent] = line.trim().split(/\s+/);
    return {
      mount,
      used_gb: parseFloat(used),
      total_gb: parseFloat(size),
      percent: parseInt(pcent),
    };
  });

  res.json({
    cpu_percent: cpuPct,
    cpu_cores: cpus.length,
    load_avg: load,
    mem_used_mb: Math.round(totalMem - freeMem),
    mem_total_mb: Math.round(totalMem),
    disks,
    status: load[0] < cpus.length * 0.7 ? "smooth" : "busy",
  });
});
```

The widget will gracefully degrade: if `cpu_percent` is missing it falls back to parsing the legacy `cpu` string, so we can ship the React side now and roll the VPS update independently.

## Files touched (Lovable side)
- **New** `src/components/admin/SysStatusWidget.tsx` (~150 lines, SVG rings + 4 columns)
- **Edit** `src/components/admin/AdminOverviewTab.tsx` (swap the existing 3-gauge block for the new widget)

