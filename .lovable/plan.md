

## Simplify Server Location to Zagreb Only + Modern Design

### What changes
Remove all server locations except Zagreb, Croatia. Replace the current grid of location buttons with a single, modern visual card that confirms Zagreb as the server location -- no selection needed since there's only one option.

### Files to change

**`src/pages/Onboarding.tsx`**

1. Remove the `serverLocations` array (lines 27-34).
2. Hardcode `serverLocation` default to `"zagreb"` and remove the setter usage for location selection.
3. Replace the server location grid (lines 296-322) with a single modern card:
   - A visually rich card with a gradient accent border (purple-to-blue, matching HP tier styling)
   - Croatian flag emoji at a larger size with a subtle glow behind it
   - "Zagreb, Croatia" as the location name, styled prominently
   - A small "Server Location" label above and a checkmark/confirmed indicator
   - A subtle map pin icon or network/signal graphic for visual interest
   - No click interaction needed -- it's informational, pre-selected

### Design details
- Card uses a gradient left-border or top-border accent (`from-primary to-secondary`)
- Inner layout: icon/flag on the left, text on the right, check badge on the far right
- Subtle background pattern or glow effect to make it feel premium/modern
- Compact single card instead of a grid, saving vertical space

