

# Fix Top Waves & Add Montreal Font

## Issues
1. The top wave (layer 4, line 48-59) is `rotate-180` which causes the SVG path to get clipped at the top edge — the wave crests extend beyond the SVG viewBox boundary
2. Font is currently system default; needs to be changed to **Montreal** (PP Neue Montreal or similar geometric sans-serif — likely means the Google Font "Inter" or we can use the free "General Sans" / "Plus Jakarta Sans" as Montreal alternatives, or import PP Neue Montreal if they have a CDN link)

## Changes

### 1. Fix top wave clipping (`src/components/AnimatedSpheres.tsx`)
- Instead of `rotate-180` on the SVG, redraw the top wave path so it flows naturally from the top edge downward — no rotation needed
- Change the path to draw waves hanging from the top: start at `M0,0`, curve down, then close back to `L2880,0 L0,0 Z`
- This eliminates any clipping from rotation

### 2. Add Montreal font (`index.html` + `tailwind.config.ts` + `src/index.css`)
- Add Google Fonts link for **Plus Jakarta Sans** (closest free alternative to PP Neue Montreal — geometric, modern, clean) in `index.html`
- Or if they specifically want "Neue Montreal": use a `@font-face` import. Most likely they mean the general modern geometric sans style.
- Set as default `font-family` in `tailwind.config.ts` via `fontFamily.sans`
- Apply to `body` in `src/index.css`

### Files Modified
- **`index.html`** — Add Google Fonts `<link>` for the font
- **`tailwind.config.ts`** — Add `fontFamily: { sans: [...] }`
- **`src/index.css`** — Apply font to body
- **`src/components/AnimatedSpheres.tsx`** — Redraw top wave path without `rotate-180`, use a downward-hanging wave path instead

