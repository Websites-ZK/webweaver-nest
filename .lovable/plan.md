

## Smooth Background Animations - Remove Lag & Stuttering

### Problem
The background animations (wave drifts, glow pulses) may experience jank due to animating properties that trigger layout/paint rather than using GPU-composited properties exclusively. The `will-change` hints are partially applied but the CSS can be optimized further.

### Changes

**1. `src/components/AnimatedSpheres.tsx`**
- Add `will-change-[opacity,transform]` to all SVG wave layers (currently only on glow blobs)
- Add `backface-visibility: hidden` and `perspective` to force GPU compositing on all animated elements
- Wrap the entire component in a container with `contain: layout style paint` to isolate it from main thread reflows

**2. `tailwind.config.ts`**
- Ensure all wave/glow keyframes use only `translate3d`, `scale3d`, and `opacity` (already mostly done, just verify glow-pulse)
- Increase wave animation durations slightly for smoother perception (e.g., 15s → 20s, 25s → 35s, 20s → 28s) to reduce visual speed and perceived stuttering

**3. `src/index.css`**
- Add a global `.gpu-accelerate` utility class with `transform: translateZ(0); backface-visibility: hidden;` for reuse
- Update `hp-glow` and `hp-btn-pulse` keyframes to use `transform: translateZ(0)` alongside box-shadow changes to keep them on GPU layer

### Technical detail
- All animations will exclusively use `transform` and `opacity` (compositor-only properties)
- `will-change` declarations ensure the browser pre-promotes layers
- Longer durations make transitions feel seamless rather than rushed
- `contain` on the wrapper prevents animation repaints from affecting the rest of the DOM

