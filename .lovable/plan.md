

## Trust & Guarantee Section - Hostinger/Bluehost Style

### What we're building

A dedicated full-width "Trust & Guarantee" section placed between the pricing cards and the "Why Choose Us" section. Inspired by Hostinger's hero guarantee badge and Bluehost's trust strip (30-day money-back guarantee, Trustpilot rating, security badges), this replaces the current minimal `TrustBadges` component with a visually prominent, conversion-focused trust block.

### Design

Two rows inside a visually distinct section:

**Row 1 - Guarantee Cards (3 large cards, horizontal on desktop)**
1. **30-Day Money-Back Guarantee** - Large shield icon, bold heading, short reassurance text, green accent border
2. **99.9% Uptime SLA** - Activity/pulse icon, uptime percentage prominently displayed, "Guaranteed by contract" subtext
3. **Free SSL & Daily Backups** - Lock icon, explains automatic SSL provisioning and backup schedule

**Row 2 - Security & Compliance Strip (inline badges, similar to Bluehost's below-CTA strip)**
- DDoS Protection
- GDPR Compliant
- EU Data Centers
- 24/7 Monitoring
- Encrypted Transfers

Each guarantee card has a subtle colored left border (green for guarantee, blue for uptime, purple for SSL) and a large icon, matching the premium feel of Hostinger/Bluehost.

### Files changed

1. **`src/components/TrustBadges.tsx`** - Complete redesign from simple inline badges to a full section with guarantee cards + security strip
2. **`src/pages/Index.tsx`** - Replace the small `<TrustBadges />` usages with the new prominent section placed after pricing and before "Why Choose Us". Keep a smaller inline version near the CTA band.
3. **`src/contexts/LanguageContext.tsx`** - Add new translation keys for guarantee headings, descriptions, and security badge labels across all 9 languages

### Technical detail

- Reuse `ScrollReveal` for entrance animations on each card
- Cards use existing `bg-card`, `border-border` tokens with colored left-border accents
- Responsive: 3 columns on desktop, stacked on mobile
- Security strip uses flex-wrap with small icon+text pairs
- No new dependencies needed; all icons from `lucide-react`

