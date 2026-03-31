

## Plan: Differentiate HP Discounts + Returning User Pricing (20% Markup)

### What changes

**`src/pages/Pricing.tsx`**:

1. **Separate discount matrices for Standard vs High Performance** — `getDiscountPct` will check the current `tier` and use a different matrix for HP (slightly different values, e.g. 2-5% offset from standard) so discounts don't look identical across tiers.

2. **Detect first-time vs returning user via `localStorage`** — On mount, check for a `ww-pricing-visited` flag in localStorage. If absent, set it (first-time user → show discounted pricing). If present (returning user → no discount, prices raised 20%).

3. **Returning user pricing logic**:
   - No strikethrough original price or discount badge shown
   - Base price × billing multiplier × 1.20 (20% markup on all plans/periods)
   - The `getPrice` function will accept a `isReturning` flag and apply the multiplier

4. **Conditionally hide discount UI** — The strikethrough price and green badge only render when `!isReturning`.

### Visual result
```text
First-time user:
  €2.71  -45%
  €1.49/mo

Returning user:
  €1.79/mo   (no badge, no strikethrough, price = 1.49 × 1.20)
```

### Technical detail

- Add `const [isReturning, setIsReturning] = useState(false)` + `useEffect` checking `localStorage.getItem('ww-pricing-visited')`
- HP discount matrix example: `monthly: [18, 20, 21, 23]` vs standard `[20, 22, 23, 25]`
- Single file change only, no database involved

