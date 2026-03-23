

## Update Pricing Page

### Changes

**1. Update pricing structure from 3 plans to 4 plans, and from monthly/yearly toggle to 3-period toggle (Monthly, 12 Months, 24 Months).**

Four plans with these specs:

| Feature | Basic | Standard | Business | Agency |
|---------|-------|----------|----------|--------|
| Desc | Small sites | Most popular | Growing companies | Resellers & agencies |
| Monthly | €1.49 | €2.49 | €4.99 | €8.99 |
| 12mo | €1.27 (save 15%) | €2.12 (save 15%) | €4.24 (save 15%) | €7.64 (save 15%) |
| 24mo | €1.12 (save 25%) | €1.87 (save 25%) | €3.74 (save 25%) | €6.74 (save 25%) |
| Websites | 1 | 5 | 20 | Unlimited |
| Storage | 10 GB SSD | 30 GB SSD | 60 GB SSD | 120 GB SSD |
| Visits/mo | ~30k | ~100k | ~200k | ~400k |
| Free SSL | ✓ | ✓ | ✓ | ✓ |
| cPanel | ✓ | ✓ | ✓ | ✓ |
| EU servers | ✓ | ✓ | ✗ | ✗ |
| Daily backups | ✗ | ✗ | ✓ | ✓ |

**2. Files to modify:**
- `src/pages/Pricing.tsx` — Replace toggle with 3-option selector (Monthly / 12 Months / 24 Months), add 4th plan (Agency), update all feature rows to match the screenshots, change grid to `lg:grid-cols-4`. Standard is "Recommended".
- `src/contexts/LanguageContext.tsx` — Add new translation keys for the 4th plan (Agency), new billing periods (12mo, 24mo, save 15%, save 25%), and new features (Websites, Visits/mo, cPanel, EU servers, Daily backups) in both EN and HR.

**3. Design approach:** The toggle becomes a 3-button segmented control. The "Standard" plan keeps the "Recommended" badge (equivalent to current "Most Popular"). Cards show the discount percentage for 12mo and 24mo periods below the price.

