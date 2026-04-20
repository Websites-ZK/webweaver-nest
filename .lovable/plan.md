
Add an uptime pill in the SysStatusWidget header next to "refreshes every 5s".

**Backend (VPS — outside repo):** add `uptime_seconds: os.uptime()` to the JSON returned by `GET /metrics/server`. This is one line in their Express handler:
```js
{ ...existing, uptime_seconds: require('os').uptime() }
```

**Frontend changes (one file):**

`src/components/admin/SysStatusWidget.tsx`
1. Add `uptime_seconds?: number` to the `SysStatusPayload` interface.
2. Helper `formatUptime(seconds)` → `"12d 4h"` / `"4h 23m"` / `"23m"` (drops larger zeros, falls back to `—` if undefined).
3. Render a small badge in the header row, between the title and the "refreshes every 5s" indicator:
   ```
   ⏱ Up 12d 4h
   ```
   Using `Clock` icon from lucide-react, semantic muted-foreground colors, no new design tokens.

No new files, no new actions in `server-monitor` (reuses existing `system_health`), no DB changes. Cleanest possible addition — the field will simply read `—` until the VPS adds `uptime_seconds`, matching the existing graceful-fallback pattern already used for legacy fields.

**Files touched:** `src/components/admin/SysStatusWidget.tsx` only.
