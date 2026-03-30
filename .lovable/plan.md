

## Create Privacy Policy and Terms of Service Pages

Modeled after Bluehost's layout: a hero header with "Agreements & Policies" title, a left sidebar with policy links, and the full legal text on the right.

### Pages to Create

**1. `/terms` — Terms of Service page (`src/pages/Terms.tsx`)**

Layout mirrors Bluehost's terms page:
- Hero section: centered "Agreements & Policies" subtitle + large "Terms of Service" heading
- Two-column layout below: left sidebar with quick-links (User Agreement, Acceptable Use, Privacy Notice, Domain Registration, Anti-SPAM, etc.) and right column with the full Terms of Service content
- Content sections adapted for WebWeaver: Eligibility & Registration, Subscriber Responsibilities, Payment, Term & Auto-Renewal, Termination, Refund Policy (30-day money-back), Resource Usage, IP Address Ownership, Governing Law, GDPR Compliance, Limitation of Liability, Indemnification
- All Bluehost-specific references replaced with "WebWeaver" branding

**2. `/privacy` — Privacy Policy page (`src/pages/Privacy.tsx`)**

Layout mirrors Newfold/Bluehost privacy center:
- Hero section with "Privacy Center" heading
- Summary paragraph about WebWeaver's data practices
- Three collapsible accordion sections: "Where does data go?", "What do we collect?", "How is data used?"
- Cards grid below: Data Requests, Cookie Notice, Security Practices, GDPR Rights
- Full privacy notice text covering: data collection types, data sharing, cookies, security measures, user rights (GDPR), data retention, children's privacy, contact info

**3. Update routing and navigation**

- `src/App.tsx`: Add routes for `/terms` and `/privacy`
- `src/components/Footer.tsx`: Update the Privacy and Terms links from `href="#"` to `<Link to="/privacy">` and `<Link to="/terms">`
- `src/contexts/LanguageContext.tsx`: Add translation keys for both pages (EN + HR) — page titles, section headers, and legal content

### Technical Details

- Both pages use the existing `ScrollReveal` component for entrance animations
- Privacy page uses the existing `Accordion` component for the collapsible FAQ-style sections
- Sidebar links on Terms page use anchor scrolling (`#section-id`) to jump within the page
- All legal text is WebWeaver-branded (not copy-pasted from Bluehost) but follows the same structure and covers the same topics
- Responsive: sidebar collapses to stacked layout on mobile

