

## Make High Performance Tier More Impactful for Conversions

### Approach
When the "High Performance" tier is active, visually elevate the entire pricing section to feel premium and differentiated from Standard. This includes the tier toggle, pricing cards, and comparison table.

### Changes

**`src/pages/Pricing.tsx`**

1. **Tier toggle** - When High Performance is selected, give it a gradient background (purple-to-blue) with a subtle glow instead of plain `bg-primary`. Add a small "⚡ Recommended" badge above the toggle when HP is active.

2. **Pricing cards in HP mode** - Apply a subtle gradient border or top-accent bar (purple-to-blue gradient) to all HP cards. The "Most Popular" card gets an elevated treatment: gradient background (dark purple-to-blue), white text, and a pulsing glow effect on the CTA button.

3. **HP badge on each card** - Show a small "High Performance" chip with Zap icon at the top of each card when in HP tier, reinforcing the premium positioning.

4. **CTA buttons in HP mode** - Use a gradient background (primary-to-secondary) on all HP plan buttons instead of outline/default, making them more action-oriented. The popular plan's button gets a subtle scale animation on hover.

5. **Value callout** - Add a small "Up to 3x faster" or similar performance tagline beneath the price on HP cards (using a new translation key).

**`src/contexts/LanguageContext.tsx`**

- Add translation keys:
  - `pricing.hp.performance` - "Up to 3x faster" (and translations)
  - `pricing.hp.recommended` - "Recommended for growth" (and translations)

**`src/index.css`**

- Add a `@keyframes` for a subtle glow/pulse animation used on the HP popular card border.

### Technical Details
- Conditional styling via `tier === "highPerformance"` checks on card container classes
- Gradient border achieved via a wrapper div with gradient background and inner div with card background (1px gap trick)
- No new dependencies needed

