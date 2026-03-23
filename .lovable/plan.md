

# Add Animated Background Spheres & Enhanced Visual Polish

## Overview
Add subtle animated floating spheres to the homepage background, enhance section coloring with gradient meshes, and add micro-interactions to make the site feel premium and enterprise-grade. Pure CSS animations — no heavy 3D libraries needed.

## Changes

### 1. Create `src/components/AnimatedSpheres.tsx`
A new component rendering 4-5 translucent gradient spheres using CSS `@keyframes` animations. Each sphere will:
- Float slowly in different orbits (20-40s duration, infinite loop)
- Use primary/accent/secondary colors at ~5-10% opacity
- Be `pointer-events-none` and `position: absolute` so they don't interfere with content
- Have different sizes (200px-500px) and blur levels (`blur-3xl`)
- Use subtle scale pulsing combined with translate movement

### 2. Update `src/index.css`
Add keyframe animations:
- `@keyframes float-sphere` — slow vertical/horizontal drift with scale pulse
- `@keyframes float-sphere-reverse` — counter-direction variant
- `@keyframes glow-pulse` — subtle opacity pulsing for accent glows
- Add a gradient mesh background pattern for the hero section (radial gradients layered)

### 3. Update `src/pages/Index.tsx`
- Import and place `<AnimatedSpheres />` in the hero section background layer
- Add a subtle animated gradient mesh behind the hero (layered radial gradients with animation)
- Add colored gradient dividers between sections (soft purple-to-transparent fades)
- Enhance service cards with subtle hover glow effect (colored shadow on hover matching card gradient)
- Add a faint grid/dot pattern overlay to the services section for depth
- Enhance CTA section with animated gradient background (shifting colors)

### 4. Update `tailwind.config.ts`
Add custom animation utilities:
- `animate-float-slow`, `animate-float-slower`, `animate-float-reverse`
- `animate-glow-pulse`

## Design Approach
- All animations are CSS-only (no JS animation loops, no Three.js) — lightweight and performant
- Spheres are large, blurred, low-opacity blobs that drift slowly — enterprise/modern feel like Vercel, Linear, Stripe
- Colors use existing palette (primary purple, accent pink, secondary blue)
- `prefers-reduced-motion` media query will disable animations for accessibility

