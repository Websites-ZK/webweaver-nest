

# Redesign: High-Converting Hosting Landing Page

## Overview
Complete restructure of the homepage (Index.tsx), navbar, and footer into a conversion-focused hosting landing page. All existing colors, fonts, and brand styling preserved. The animated wave background remains untouched.

## Files to Modify

### 1. `src/contexts/LanguageContext.tsx` — Add all new translation keys
Add ~80 new translation keys for both `en` and `hr` covering:
- Updated nav labels (Hosting, Support instead of Home, Knowledge Base)
- New hero copy: badge "Servers in Croatia · Built for the Balkans", headline, subheadline, CTA "Start for €1.49/mo"
- Hero stats row: €1.49, 99.9%, 50%, <20ms with labels
- Trust bar: 5 trust signals (Free SSL, 24/7 monitoring, GDPR, cPanel, Daily backups)
- Features grid: 6 feature cards (Croatian data center, 99.9% uptime, Free SSL + GDPR, cPanel, SSD storage, 1-click WordPress)
- Updated pricing copy: new subtitle "No hidden fees. No surprise renewals. What you see is what you pay."
- "Why choose us" section: 4 cards (Servers in Croatia, Half the price, Support in your language, GDPR by default)
- Country pills: Croatia, Serbia, Bosnia, Slovenia, Germany, Austria, Hungary
- CTA band copy: "Ready to switch to faster, cheaper hosting?" + migration subtext
- Updated footer copy: "© 2026 WebWeaver · Hosted in Croatia, EU"

### 2. `src/components/Navbar.tsx` — Restructure navigation
- Change logo text from "HostPro" to "WebWeaver"
- Center links: Hosting (/), Pricing (/pricing), About (/about), Support (/faq)
- Right side: single primary CTA "Get started" button (remove separate login/register, keep language toggle)
- Keep sticky behavior and mobile menu

### 3. `src/pages/Index.tsx` — Complete rewrite with 6 sections
All sections use existing components (Button, ScrollReveal) and existing Tailwind classes.

**Section 1 — Hero**
- Pill badge: "Servers in Croatia · Built for the Balkans"
- Large headline (2 lines max): "Fast, affordable hosting for Central & Southeast Europe"
- Muted subheadline about 50% cheaper, EU data, faster loads
- Two buttons: primary "Start for €1.49/mo" + outline "See all plans"
- Horizontal stats row: 4 stats with vertical dividers (€1.49, 99.9%, 50%, <20ms)

**Section 2 — Trust bar**
- Thin horizontal strip with muted background
- 5 trust signals in a row with small icons: Shield (SSL), Activity (monitoring), Globe (GDPR), Monitor (cPanel), Database (backups)

**Section 3 — Features grid**
- Heading + subheading centered
- 3x2 grid of cards, each with icon, bold title, 1-sentence description
- Cards use existing `border-border bg-card` styling

**Section 4 — Pricing** (inline, not separate page)
- Heading + subheading
- Billing period toggle (existing pill switcher pattern)
- 4 pricing cards side by side, Standard highlighted with primary border + "Most popular" badge
- Base prices: Basic €1.49, Standard €2.49, Business €4.99, Agency €8.99
- 12mo = base × 0.85, 24mo = base × 0.75
- Features: websites, storage, SSL, visits, backup, support info per card
- "Get started" buttons (primary for Standard, outline for others)

**Section 5 — Why choose us**
- 2x2 grid with numbered cards (01-04)
- Large number, bold title, 2-sentence description
- Below cards: row of country pill tags

**Section 6 — CTA band**
- Full-width muted background
- Centered heading, subtext about free migration, primary CTA button

### 4. `src/pages/Pricing.tsx` — Update base prices back to pre-10% values
- Basic: €1.49, Standard: €2.49, Business: €4.99, Agency: €8.99
- 12mo = ×0.85, 24mo = ×0.75
- Update feature lists to match spec (add priority support, phone+chat, dedicated support line descriptions)

### 5. `src/components/Footer.tsx` — Simplified footer
- Logo "WebWeaver" left
- Center links: Pricing, Support, Privacy, Terms
- Right: "© 2026 WebWeaver · Hosted in Croatia, EU"
- Single row layout, no multi-column grid

### 6. `src/components/AnimatedSpheres.tsx` — No changes
Waves stay exactly as they are.

## Design Principles
- One CTA per section — no competing actions
- €1.49 price anchored in hero AND final CTA
- Standard plan visually dominant (primary border, "Most popular" badge, filled button)
- Regional feel: mention Zagreb, Belgrade, Sarajevo, Ljubljana by name
- Icons and numbers only — no stock photos
- Clean, flat, generous whitespace throughout

