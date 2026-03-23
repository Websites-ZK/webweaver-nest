

# Global Full-Page Animated Background

## What Changes

Move the animated wave background from individual sections to a **single fixed layer** behind the entire website. The waves continuously play as one large animation — as you scroll through pages, the waves are always visible behind all content.

### 1. Move `AnimatedSpheres` to `App.tsx` as a fixed background
- Place `<AnimatedSpheres />` inside the main layout `div`, using `fixed inset-0 z-0` positioning so it covers the full viewport and stays in place while scrolling
- All page content sits above it with `relative z-10`

### 2. Update `AnimatedSpheres.tsx`
- Change from `absolute inset-0` to `fixed inset-0` so waves fill the entire screen permanently
- Increase wave heights to cover more of the viewport (not just bottom-anchored)
- Add a 4th wave layer for more visual richness across the full page

### 3. Remove per-section `AnimatedSpheres` from `Index.tsx`
- Remove the two `<AnimatedSpheres />` instances (hero + testimonials sections)
- Remove the import since it's now global

### Files Modified
- **`src/App.tsx`** — Import and render `AnimatedSpheres` as fixed background layer
- **`src/components/AnimatedSpheres.tsx`** — Switch to `fixed` positioning, taller waves
- **`src/pages/Index.tsx`** — Remove local `AnimatedSpheres` usage

