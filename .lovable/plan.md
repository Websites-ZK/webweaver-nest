

## Assessment: Already Implemented

After reviewing `src/pages/Pricing.tsx`, the logic you described is **already in place**:

1. **Users without hosting plans** (first-time): `isReturning = false` → see discounted prices with strikethrough "original" prices and green discount badges
2. **Users with hosting plans** (returning): `isReturning = true` → see 20% higher prices, no strikethrough, no discount badges

The current code at lines 23-37 checks if the logged-in user has any `hosting_plans` records. If they don't (or aren't logged in), `isReturning` stays `false` and the full discount UI is shown. The `!isReturning` conditionals at lines 337 and 412 control badge/strikethrough visibility.

**No code changes are needed** — this is already working as described. If you're not seeing discounts, make sure you're viewing the `/pricing` page (you're currently on `/`). If you want me to verify visually, let me know.

