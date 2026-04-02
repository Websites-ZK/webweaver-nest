

# Auto-Healing Actions for Dashboard

## Current State
All 4 system monitoring metrics (CPU, RAM, Disk, Uptime) are already implemented. Auto-healing (restart service, reboot server) is missing.

## What We'd Build

Since this is a hosting management dashboard (not connected to real servers), we implement auto-healing as **simulated action buttons + audit logging** — the UI triggers the action, logs it to a new table, and shows feedback. When real infrastructure is connected later, these become real API calls.

### 1. Database: `auto_heal_actions` table
- `id`, `user_id`, `hosting_plan_id`, `action_type` (restart_service | reboot_server), `status` (pending | completed | failed), `created_at`, `completed_at`
- RLS: users can INSERT and SELECT their own records

### 2. Backend function: `auto-heal` edge function
- Accepts `{ hosting_plan_id, action_type }` 
- Validates user owns the plan
- Inserts record with status "pending", waits 2-3s (simulated), updates to "completed"
- Returns result

### 3. UI Changes in `HostingTab.tsx`
- Add two new quick action buttons: "Restart Service" and "Reboot Server" (with `RotateCcw` and `Power` icons)
- Clicking opens a confirmation dialog (destructive action)
- Shows loading spinner during execution, toast on success/failure
- Add a small "Recent Actions" log section below quick actions showing last 5 auto-heal actions with timestamps and status

### 4. Translation keys
- `dash.restartService`, `dash.rebootServer`, `dash.confirmRestart`, `dash.confirmReboot`, `dash.actionSuccess`, `dash.actionFailed`, `dash.recentActions`

### Files Changed
- **New migration**: create `auto_heal_actions` table with RLS
- **New edge function**: `supabase/functions/auto-heal/index.ts`
- `src/components/dashboard/HostingTab.tsx` — add buttons, dialog, action log
- `src/contexts/LanguageContext.tsx` — add EN/HR keys

