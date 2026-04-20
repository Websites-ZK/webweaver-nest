
## Translation audit results

I scanned `LanguageContext.tsx` (574 EN keys baseline):

| Lang | Keys present | Missing |
|------|-------------:|--------:|
| EN | 574 | 0 (baseline) |
| HR | 490 | **84** |
| SR | 389 | **185** |
| BS | 389 | **185** |
| SL | 389 | **185** |
| MK | 389 | **185** |
| ME | 389 | **185** |
| IT | 389 | **185** |
| DE | 389 | **185** |

The 185 missing keys are identical across SR/BS/SL/MK/ME/IT/DE → recent features (admin dashboard, monthly/daily server reports, referrals, KPI tab, domain claim, uptime pill, pricing features, threshold settings, etc.) were only added in EN and partially in HR.

User-visible result: anyone on a non-EN language sees raw keys like `admin.mrr`, `dash.uptimeUp`, `pricing.feature.ddos` instead of translated text.

## Plan: Backfill all missing translations

**One file touched:** `src/contexts/LanguageContext.tsx`

1. **HR** — add the 84 missing keys (Croatian).
2. **SR / BS / ME** — add 185 keys each (Serbian / Bosnian / Montenegrin — close cognates, hand-translated per language).
3. **SL** — add 185 keys (Slovenian).
4. **MK** — add 185 keys (Macedonian, Cyrillic).
5. **IT** — add 185 keys (Italian).
6. **DE** — add 185 keys (German).

Keys are mostly admin/dashboard strings:
- `admin.*` (overview, MRR, alerts, thresholds, funnel, referral economics, monthly metrics, server locations…)
- `dash.*` (KPI, referrals, uptime pill…)
- `pricing.feature.*` (ddos, ssh, storageNvme, featureLabel…)
- A handful of recently added domain-claim & sys-status keys.

**Approach for accuracy:** I'll group keys by feature area and translate them per language using the existing translated strings as a style/voice reference (e.g., HR uses "Domena" not "Domain"). Brand names (WebWeaver, MRR, KPI, RAM, CPU, SSL, NVMe, DDoS, SSH) stay untranslated.

**Verification after build:** I'll diff key counts again — every language must hit 574/574.

## Out of scope
- No new feature keys.
- No code logic changes — `t()` already falls back to the key string, so behavior is unchanged for any string I don't touch.
- No JSX file edits.

## Risk
File grows from ~3,879 → ~5,200 lines. Single mechanical edit per language block, low risk of regression.
