

## Domain Search in Onboarding Wizard

### What changes

**Step 1 (Domain setup) in `src/pages/Onboarding.tsx`:**
- When "Register a new domain" is selected, change the heading to "Choose your free domain" instead of the current generic label
- Add a "Search" button next to the domain input
- On search, call a backend function that checks domain availability via a DNS/WHOIS lookup
- Show results: green checkmark + "Domain is available!" or red X + "This domain already exists, please try another"
- Add loading state during search

**New edge function `supabase/functions/check-domain/index.ts`:**
- Accepts `{ domain: string }` in POST body
- Validates the domain format
- Performs a DNS lookup (using Deno's `fetch` against a public DNS API like `dns.google/resolve?name=...`) to check if the domain has existing records
- Returns `{ available: boolean, domain: string }`

**Translation keys in `src/contexts/LanguageContext.tsx`:**
- `onboarding.chooseFreeDomain` — "Choose your free domain" / "Odaberite svoju besplatnu domenu"
- `onboarding.searchDomain.btn` — "Search" / "Pretraži"
- `onboarding.domain.available` — "Domain is available!" / "Domena je dostupna!"
- `onboarding.domain.taken` — "This domain already exists. Please try another." / "Ova domena već postoji. Pokušajte drugu."
- `onboarding.domain.checking` — "Checking availability..." / "Provjera dostupnosti..."
- `onboarding.domain.invalid` — "Please enter a valid domain" / "Unesite valjanu domenu"

### Technical approach

The edge function uses Google's public DNS API (`https://dns.google/resolve?name=DOMAIN&type=A`) — no API key needed. If DNS records exist (Status === 0 and Answer array is non-empty), the domain is taken. Otherwise it's available.

The UI shows inline feedback below the input with an icon and colored text. The search button has a spinner while checking. The "existing domain" path stays unchanged — only the "new domain" path gets the search + availability check.

### Files to create/edit
1. **Create** `supabase/functions/check-domain/index.ts` — domain availability checker
2. **Edit** `src/pages/Onboarding.tsx` — update domain step UI with search, loading, and result states
3. **Edit** `src/contexts/LanguageContext.tsx` — add new translation keys

