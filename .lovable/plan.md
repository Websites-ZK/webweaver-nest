

## Plan: Scale Discount by Billing Period + Green Badge

### What changes

**`src/pages/Pricing.tsx`**:

1. **Scale discount % by billing period** — longer commitments get bigger fake discounts:
   - Monthly: ~20-25% off
   - 12 months: ~35-40% off  
   - 24 months: ~45-50% off
   - 36 months: ~55-60% off
   
   Update `getOriginalPrice` and `getDiscountPct` to accept `period` and return higher values for longer terms.

2. **Change discount badge color to green** — green is the highest-converting color for discount badges (signals savings/positive action). Replace `bg-destructive/90` with a green like `bg-emerald-500` / `text-white` on both standard and high-performance card variants.

3. **Keep per-plan variation** for realism (±2-3% between plans within same period).

### Visual result
```text
Monthly:      €1.86  -20%    →  €1.49/mo
12 months:    €2.48  -40%    →  €1.49/mo  
24 months:    €2.54  -50%    →  €1.27/mo
36 months:    €2.79  -60%    →  €1.12/mo
```

Badge style: green rounded pill with white text.

### Technical detail

Replace the fixed `discountPercents` array with a function `getDiscountPct(planIndex, period)` that uses a base matrix, and update `getOriginalPrice` accordingly. Touch ~15 lines total, same file only.

