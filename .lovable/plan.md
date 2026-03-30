

## Make Navbar Invisible While on Hero Section

### Overview
Hide the navbar when the user is viewing the hero section at the top of the Index page. As the user scrolls past the hero, the navbar fades/slides in. On non-Index pages, the navbar is always visible.

### Approach
Use an `IntersectionObserver` on the hero section to detect when it's in view, and conditionally apply transparency/hidden styles to the navbar.

### Changes

1. **`src/components/Navbar.tsx`**
   - Add a `visible` prop (default `true`) that controls opacity and pointer-events
   - When `visible` is false: `opacity-0 -translate-y-full pointer-events-none`; when true: `opacity-100 translate-y-0` with a smooth transition

2. **`src/App.tsx`**
   - Add state `navbarVisible` (default `true`)
   - Pass `visible={navbarVisible}` to `<Navbar />`
   - Expose `navbarVisible` + `setNavbarVisible` via a simple context or callback prop to child routes

3. **`src/pages/Index.tsx`**
   - Add a `ref` to the hero `<section>` element
   - Use `IntersectionObserver` (threshold ~0.1) to detect when hero is intersecting
   - When hero is visible → set navbar invisible; when hero scrolls out → set navbar visible

### Alternative (simpler, self-contained)
Instead of prop-drilling through App, handle everything inside the Navbar itself:
- Navbar checks if current path is `/` (home page)
- On the home page, use a scroll listener: if `window.scrollY < heroHeight` (roughly 600px or read from a sentinel element), hide the navbar
- On other pages, always show it
- This avoids modifying App.tsx or Index.tsx

**Recommended: the simpler scroll-based approach in Navbar alone.**

### Implementation Detail
In `Navbar.tsx`:
- Add `useEffect` with scroll listener when on `/`
- Track `isHeroVisible` state; set true when `scrollY < threshold` (~500px)
- Apply transition classes: `transition-all duration-300` + conditional `opacity-0 -translate-y-full` vs `opacity-100 translate-y-0`
- Keep `sticky top-0` positioning but add the visibility transition

