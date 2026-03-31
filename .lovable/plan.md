

## Plan: Add Strikethrough "Original" Prices to Pricing Cards

Show inflated "original" prices crossed out above the current prices, creating a 40-45% discount appearance while keeping actual prices unchanged.

### Changes

**`src/pages/Pricing.tsx`**:
1. Add a helper function `getOriginalPrice(base)` that calculates a fake original price ~75-80% higher (so the current price appears ~40-45% off)
2. Add a discount badge (e.g. "-45%") next to the price
3. Render the original price with `line-through` styling above the current price in both standard and high-performance card layouts
4. Also update the comparison table header area if prices are shown there

The original price calculation: `originalPrice = currentPrice / 0.55` (making current price ~45% off) — adjusted per plan to vary between 40-45% for realism.

### Visual Result
```
 €2.71  -45%
€1.49/mo
```

No new files, no database changes — purely a UI/copy update in the Pricing component.

