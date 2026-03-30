

## Fix Pricing: Differentiate High Performance Tier Properly

### Problem
Currently, Standard and High Performance tiers share identical base prices (€1.49, €2.49, €4.99, €8.99). The comparison table also shows all 8 columns (both tiers) at once instead of following the tier toggle. This doesn't match Hostinger/Bluehost's approach where High Performance is a distinctly premium tier with higher pricing.

### Changes

**`src/pages/Pricing.tsx`**:

1. **Give High Performance plans higher base prices** to reflect the premium tier:
   - Basic: €2.99 (was €1.49)
   - Standard: €4.99 (was €2.49)  
   - Business: €8.99 (was €4.99)
   - Agency: €14.99 (was €8.99)

2. **Update the comparison table to respect the tier toggle** — only show 4 columns for the currently selected tier instead of all 8 side-by-side. The table title updates to match (e.g., "Standard Plans Comparison" or "High Performance Plans Comparison").

3. Keep the existing tier toggle at the top that switches both the pricing cards AND the comparison table simultaneously.

### Result
Switching between Standard and High Performance changes everything on the page — cards show different features/prices, and the comparison table below shows only the 4 plans for that tier. This matches the Hostinger/Bluehost pattern.

