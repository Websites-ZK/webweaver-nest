

# Wavy Animated Background — More Visible & Conversion-Focused

## What Changes

### 1. Replace sphere blobs with animated wave layers (`src/components/AnimatedSpheres.tsx`)
- Replace current static blurred circles with **3 SVG wave layers** that loop infinitely
- Each wave uses a different color (primary, accent, secondary) at **15-25% opacity** (much more visible than current 5-7%)
- Waves move horizontally in a continuous loop at different speeds (15s, 20s, 25s) creating a fluid, living feel
- SVG `<path>` elements with smooth bezier curves for organic wave shapes
- Waves span the full width and stack at the bottom/middle of the hero

### 2. Add wave keyframes (`src/index.css`)
- `@keyframes wave-drift` — continuous horizontal translate loop (`0% → -50% translateX` on a doubled-width SVG)
- `@keyframes wave-drift-reverse` — opposite direction for visual depth
- Keep existing `glow-pulse` and `gradient-shift` keyframes
- Remove unused `float-sphere` keyframes

### 3. Add persistent gradient glow behind waves (`src/components/AnimatedSpheres.tsx`)
- Keep 2 large radial gradient blobs (primary + accent) at **15-20% opacity** behind the waves for color richness
- These pulse slowly with `glow-pulse` animation

### 4. Update `tailwind.config.ts`
- Add `animate-wave`, `animate-wave-slow`, `animate-wave-reverse` utilities
- Remove old float-sphere utilities

### 5. Update `src/pages/Index.tsx`
- No structural changes needed — `AnimatedSpheres` is already placed in the hero
- Add waves to the testimonials section background too for consistency

## Design Intent
- Wavy motion = fluid, professional, trustworthy (used by Stripe, Linear, Hostinger)
- Higher opacity (15-25%) makes the brand colors pop and creates visual energy
- Continuous looping animation keeps the page feeling alive without being distracting

