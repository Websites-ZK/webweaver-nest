## Rebrand: WebWeaver → Serverus

### 1. New logo
Generate a simple, abstract mark based on the letter **S** (Hostinger-style: single-letter, geometric, monochrome-friendly, works at 32px).

- Style: clean abstract "S" — geometric, slight gradient using the project's primary color, transparent background, square format.
- Files:
  - `src/assets/serverus-logo.png` (full logo mark, ~512×512, transparent)
  - `public/favicon.png` (256×256, transparent) — replaces current `public/favicon.ico`
- Use `imagegen` with `transparent_background: true`, premium tier (logo = needs polish).

### 2. Replace "WebWeaver" text + "W" placeholder mark everywhere
Search-and-replace across the codebase. Known hits:
- `src/components/Navbar.tsx` — replace the `W` div + "WebWeaver" wordmark with an `<img>` of the new logo + "Serverus".
- `src/components/Footer.tsx` — same treatment + update `footer.description` copy if it names WebWeaver.
- `src/components/SEOHead.tsx` — `og:site_name` → "Serverus".
- `index.html` — `<title>`, meta description, og/twitter titles → "Serverus". Add `<link rel="icon" href="/favicon.png">`.
- `src/contexts/LanguageContext.tsx` — replace any "WebWeaver" string literals across all 9 languages (brand stays untranslated, just renamed).
- Any other page/component referencing "WebWeaver" (will grep: About, Pricing, FAQ, Onboarding, emails, edge function templates).

### 3. Favicon
- Delete `public/favicon.ico` (browsers default-request it and would override).
- Reference `public/favicon.png` from `index.html`.

### Out of scope
- No DB/schema changes, no edge function logic changes (only string literals if they render brand name).
- No color/theme overhaul — just logo + name swap.
- Domain/published URL stays as-is (not a code concern).

### Verification
- Grep for remaining "WebWeaver" / lone "W" logo placeholders → should be zero.
- Visual check: navbar + footer render new logo at correct size, favicon shows in tab.
