
User wants a ready-to-use prompt (in Croatian/English) describing the feature: add domain registration as a product on the site + free domain on 36-month plans + a "claim your free domain" screen in onboarding before billing.

I'll just deliver the prompt itself — no code changes needed in this turn.

---

## Prompt za sljedeći zahtjev (kopiraj i pošalji)

**Feature: Domain registration kao proizvod + besplatna domena na 36-mjesečnom planu**

Dodaj na WebWeaver sljedeće:

### 1. Domeni kao kupovni proizvod
- Na `/pricing` (ili nova sekcija "Domains") dodaj karticu "Register a Domain" sa search inputom (`example.com`) koja koristi postojeći `check-domain` edge function.
- Rezultat prikazuje: dostupnost, cijenu registracije/obnove (iz FOSSBilling TLD pricing), i "Add to cart / Register" button.
- Ako korisnik nije logiran → redirect na `/register?next=/onboarding?domain=...`.
- Ako je logiran → pokreni `register_domain` action u `fossbilling-proxy` i upiši rezultat u `domains` tabelu.

### 2. Free domain na 3-godišnjem planu
- U `src/pages/Onboarding.tsx` step "Plan & Period": kad korisnik odabere `36mo`, prikaži zeleni badge "🎁 FREE domain included (.com / .net / .eu / .hr — 1 year)".
- U `create-checkout` edge function: ako `period === "36mo"`, postavi `metadata.free_domain = "true"` i preskoči naplatu domene.
- U `stripe-webhook`: kad subscription postane `active` i `metadata.free_domain === "true"`, automatski pozovi `register_domain` u FOSSBilling-u za odabranu domenu (period `1Y`, price `0`).

### 3. Novi onboarding korak "Claim your free domain"
- Umetni **prije billing/checkout koraka** novi step koji se prikazuje **samo ako je odabran 36mo plan**.
- Layout:
  - Veliki naslov: "🎁 Claim your free domain"
  - Subtitle: "Included free for 1 year with your 3-year plan"
  - Search input + TLD dropdown (.com, .net, .eu, .hr) + "Check availability" button
  - Ako dostupno → zeleni state + "Claim & Continue" button (sprema domain u onboarding state, ide na billing)
  - Ako zauzeto → crveni state + prijedlozi alternativa
  - Mali link "Skip — I'll add a domain later" (dolje, manjim fontom)
- Koristi postojeći `check-domain` edge function za provjeru.
- Sačuvaj odabranu domenu u `metadata.domain` koja se već šalje u `create-checkout`.

### 4. Translations
- Dodaj sve nove stringove u `LanguageContext.tsx` za svih 9 jezika (EN, HR, SR, BS, SL, MK, SQ, IT, DE).

### 5. Testing
- Verify end-to-end: odaberi 36mo plan → pojavi se "Claim free domain" screen → claim domain → checkout → webhook registrira domenu u FOSSBillingu i upiše u `domains` tabelu → vidljivo u Dashboard → Domains tab.

---

Pošalji ovaj prompt kad budeš spreman da krenemo s implementacijom.

<lov-actions>
<lov-suggestion message="Implementiraj feature po gornjem promptu: domain kao proizvod, free domena na 36mo planu, i 'Claim your free domain' onboarding korak prije billinga.">Krenimo s implementacijom</lov-suggestion>
<lov-suggestion message="Add a standalone /domains marketing page with TLD pricing table, search bar, and FAQ — separate from the dashboard.">Add public /domains page</lov-suggestion>
<lov-suggestion message="Extend the free domain offer: also give a free .eu or .hr domain on 24-month plans (but only ccTLDs, no .com).">Tier the free domain offer</lov-suggestion>
</lov-actions><lov-plan>
Korisnik želi da napravim **prompt** (ne samu implementaciju) za feature koji uključuje:
1. Domain registration kao proizvod na stranici
2. Besplatna domena uz 3-godišnji (36mo) paket
3. Novi onboarding screen "Claim your free domain" prije billinga

Plan je samo da isporučim gotov, jasan prompt koji korisnik može iskoristiti u sljedećoj poruci za implementaciju.

---

## Prompt za sljedeći zahtjev (kopiraj i pošalji)

**Feature: Domain registration kao proizvod + besplatna domena na 36-mjesečnom planu**

Dodaj na WebWeaver sljedeće:

### 1. Domeni kao kupovni proizvod
- Na `/pricing` (ili nova sekcija "Domains") dodaj karticu "Register a Domain" sa search inputom (npr. `example.com`) koja koristi postojeći `check-domain` edge function.
- Rezultat prikazuje: dostupnost, cijenu registracije/obnove (iz FOSSBilling TLD pricing), i "Add to cart / Register" button.
- Ako korisnik nije logiran → redirect na `/register?next=/onboarding?domain=...`.
- Ako je logiran → pokreni `register_domain` action u `fossbilling-proxy` i upiši rezultat u `domains` tabelu.

### 2. Free domain na 3-godišnjem planu
- U `src/pages/Onboarding.tsx`, kad korisnik odabere `36mo` period, prikaži zeleni badge: **"🎁 FREE domain included (.com / .net / .eu / .hr — 1 year)"**.
- U `create-checkout` edge function: ako `period === "36mo"`, postavi `metadata.free_domain = "true"` i preskoči naplatu domene.
- U `stripe-webhook`: kad subscription postane `active` i `metadata.free_domain === "true"`, automatski pozovi `register_domain` u FOSSBilling-u za odabranu domenu (period `1Y`, cijena `0`).

### 3. Novi onboarding korak "Claim your free domain"
- Umetni **prije billing/checkout koraka** novi step koji se prikazuje **samo ako je odabran 36mo plan**.
- Layout:
  - Veliki naslov: **"🎁 Claim your free domain"**
  - Subtitle: "Included free for 1 year with your 3-year plan"
  - Search input + TLD dropdown (.com / .net / .eu / .hr) + "Check availability" button
  - Ako dostupno → zeleni state + "Claim & Continue" button (sprema domain u onboarding state, ide na billing)
  - Ako zauzeto → crveni state + prijedlozi alternativa
  - Mali link "Skip — I'll add a domain later" dolje, manjim fontom
- Koristi postojeći `check-domain` edge function za provjeru.
- Sačuvaj odabranu domenu u `metadata.domain` koja se već šalje u `create-checkout`.

### 4. Translations
- Dodaj sve nove stringove u `LanguageContext.tsx` za svih 9 jezika (EN, HR, SR, BS, SL, MK, SQ, IT, DE).

### 5. Testing
- Verify end-to-end: odaberi 36mo plan → pojavi se "Claim free domain" screen → claim domain → checkout → webhook registrira domenu u FOSSBillingu i upiše u `domains` tabelu → vidljivo u Dashboard → Domains tab.

---

Pošalji ovaj prompt kad budeš spreman da krenemo s implementacijom.
