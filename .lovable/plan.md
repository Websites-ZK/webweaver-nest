

## Add Standard / High Performance Tier Filter to Pricing Page

### Overview
Add a "Standard" / "High Performance" toggle filter above the pricing cards (similar to Bluehost's approach). Both tiers keep the same 4 plan names (Basic, Standard, Business, Agency) with the same base pricing, but High Performance plans offer upgraded specs like NVMe storage, more resources, CDN, staging environments, and enhanced security features.

### Tier Comparison

**Standard tier** (current plans, unchanged):

| | Basic €1.49 | Standard €2.49 | Business €4.99 | Agency €8.99 |
|---|---|---|---|---|
| Websites | 1 | 5 | 20 | Unlimited |
| Storage | 10 GB SSD | 30 GB SSD | 60 GB SSD | 120 GB SSD |
| Visits/mo | ~30k | ~100k | ~200k | ~400k |
| SSL | Yes | Yes | Yes | Yes |
| cPanel | Yes | Yes | Yes | Yes |
| Backup | No | Weekly | Daily | Daily |
| CDN | No | No | No | No |
| Staging | No | No | No | No |
| Support | Email | Priority | Phone + chat | Dedicated |

**High Performance tier** (same prices, upgraded specs):

| | Basic €1.49 | Standard €2.49 | Business €4.99 | Agency €8.99 |
|---|---|---|---|---|
| Websites | 5 | 25 | 100 | Unlimited |
| Storage | 20 GB NVMe | 60 GB NVMe | 120 GB NVMe | 250 GB NVMe |
| Visits/mo | ~50k | ~200k | ~400k | ~800k |
| SSL | Yes | Yes | Yes | Yes |
| cPanel | Yes | Yes | Yes | Yes |
| Backup | Weekly | Daily | Daily + on-demand | Daily + on-demand |
| CDN | Yes | Yes | Yes | Yes |
| Staging | No | Yes | Yes | Yes |
| DDoS Protection | No | Yes | Yes | Yes |
| Malware Scan | No | No | Yes | Yes |
| SSH Access | No | No | Yes | Yes |
| Support | Priority | Phone + chat | Dedicated | Dedicated + SLA |

### Changes

1. **`src/pages/Pricing.tsx`**
   - Add `tier` state: `"standard" | "highPerformance"`
   - Add a toggle UI above the billing period selector (pill-style, matching existing design)
   - Define two separate plan arrays for each tier with the appropriate features
   - Show the active tier's plans; keep billing period toggle and discount logic unchanged
   - Add new feature rows: CDN, Staging, DDoS Protection, Malware Scan, SSH Access

2. **`src/contexts/LanguageContext.tsx`** - Add new translation keys across all 9 languages:
   - `pricing.tier.standard` / `pricing.tier.highPerformance`
   - `pricing.feature.cdn`, `pricing.feature.staging`, `pricing.feature.ddos`, `pricing.feature.malware`, `pricing.feature.ssh`
   - Updated backup labels: `pricing.backup.weekly`, `pricing.backup.daily`, `pricing.backup.dailyOnDemand`
   - Updated support label: `pricing.support.dedicatedSla`

3. **`src/pages/Onboarding.tsx`** - Add tier selection to the onboarding flow so the checkout captures which tier the user chose. Pass the tier info through to the checkout function.

4. **`supabase/functions/create-checkout/index.ts`** - Add High Performance plan variants to the plans map so Stripe receives the correct pricing metadata.

### UI Layout
The tier toggle appears as a segmented control above the billing period toggle:

```text
[ Standard ]  [ High Performance ]

    [ Monthly ]  [ 12 Months ]  [ 24 Months ]

    ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
    │  Basic  │  │Standard │  │Business │  │ Agency  │
    │  €1.49  │  │  €2.49  │  │  €4.99  │  │  €8.99  │
    └─────────┘  └─────────┘  └─────────┘  └─────────┘
```

