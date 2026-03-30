

## Fix Background Animations — Ensure Continuous Looping

### Problem
The wave and glow-pulse animations may appear to freeze or stutter because:
1. The CSS `@keyframes` in `src/index.css` and the Tailwind config both define these animations, potentially conflicting
2. The wave SVGs are `width: 200%` translating by `-50%`, which is correct for seamless looping, but the `linear infinite` timing needs to be consistent
3. The `glow-pulse` keyframe uses `opacity` + `scale` transitions that can trigger layout repaints

### Changes

**1. `tailwind.config.ts`** — Move all animation keyframes into Tailwind config (single source of truth) and add `will-change` hint animations:
- Add `wave-drift`, `wave-drift-reverse`, and `glow-pulse` keyframes here (they're currently only in `index.css`)

**2. `src/index.css`** — Remove the duplicate `@keyframes` blocks (`wave-drift`, `wave-drift-reverse`, `glow-pulse`, `gradient-shift`) since they'll live in Tailwind config. Keep only the `prefers-reduced-motion` media query.

**3. `src/components/AnimatedSpheres.tsx`** — Add GPU-acceleration hints to prevent paint stalls:
- Add `will-change-transform` class to all wave SVGs
- Add `will-change-[opacity,transform]` to glow blobs
- Ensure all animated elements use `translate3d(0,0,0)` or `transform: translateZ(0)` to force GPU compositing

These changes consolidate animation definitions, eliminate duplication that could cause conflicts, and force GPU compositing to prevent freezing/stuttering.

