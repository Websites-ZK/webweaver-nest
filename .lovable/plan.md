

## Remove Region-Specific Wording + Add Server Location Selection to Onboarding

### What changes

**1. Update all region-specific translations (`src/contexts/LanguageContext.tsx`)**

Replace Croatia/Balkans-specific wording with global/neutral messaging in both EN and HR:

- `hero.badge`: "Servers in Croatia · Built for the Balkans" → "EU-Based Hosting · Global Coverage"
- `hero.title`: remove "Central & Southeast Europe" → "Fast, affordable hosting — worldwide"
- `hero.stat4.label`: "Latency in Balkans" → "Low Latency Worldwide"
- `features.datacenter.title`: "Croatian data center" → "EU Data Centers"
- `features.datacenter.desc`: remove country codes → "Your data stays in the EU. Choose your server location at signup."
- `why.1.title`: "Servers physically in Croatia" → "Servers close to your audience"
- `why.1.desc`: remove Zagreb/Belgrade/Sarajevo references → generic low-latency messaging
- `why.3.desc`: remove "Croatian, Serbian, Bosnian, Slovenian" → "Multilingual support team"
- `contact.info.address`: "Zagreb, Croatia" → generic or removed
- `footer.copyright`: remove "Hosted in Croatia, EU"
- Same changes mirrored for HR translations

**2. Remove country pills from Index.tsx**

Remove the countries array and the country pills section entirely from the "Why Choose Us" section — no longer relevant.

**3. Add server location selection to Onboarding step 1 or as a new sub-step (`src/pages/Onboarding.tsx`)**

Add a server location selector on the Domain Setup step (step 1) — a set of selectable cards:
- Frankfurt, Germany (EU)
- Amsterdam, Netherlands (EU)
- Helsinki, Finland (EU)
- New York, USA
- Singapore (APAC)

New state: `serverLocation: string`, shown in the review summary and passed to the checkout edge function.

**4. Add translation keys for server locations**

New keys like `onboarding.serverLocation`, `onboarding.serverLocation.desc`, and individual location labels.

**5. Update edge function metadata (`supabase/functions/create-checkout/index.ts`)**

Pass `server_location` in the Stripe checkout session metadata.

### Technical details

- Server location selection uses the same card-style UI pattern (border-primary highlight, scale animation) already used for domain type and extras
- No backend changes needed beyond passing metadata — server provisioning is outside scope
- Country pills section in Index.tsx removed entirely (the `countries` array and its rendering block)

