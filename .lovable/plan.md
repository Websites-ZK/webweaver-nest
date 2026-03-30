

## Add Balkan + Italian + German Languages with Modern Selector

### Languages to add
- **Croatian (HR)** — already exists
- **English (EN)** — already exists
- **Serbian (SR)**
- **Bosnian (BS)**
- **Slovenian (SL)**
- **Macedonian (MK)**
- **Montenegrin (ME)**
- **Italian (IT)**
- **German (DE)**

### Changes

**1. `src/contexts/LanguageContext.tsx`**
- Expand `Language` type to union of all 9 language codes
- Add full translation objects for sr, bs, sl, mk, me, it, de (based on the existing en/hr structure — each language gets all ~300 keys translated)
- Update `useState<Language>("en")` to keep defaulting to English

**2. `src/components/Navbar.tsx` — Modern language dropdown**
Replace the simple toggle button with a styled `DropdownMenu` language picker:
- Trigger: a pill-shaped button showing the current language flag emoji + 2-letter code (e.g. 🇬🇧 EN)
- Dropdown content: a grid or list of languages, each showing flag emoji + native language name (e.g. 🇩🇪 Deutsch, 🇮🇹 Italiano, 🇷🇸 Srpski, 🇧🇦 Bosanski, 🇸🇮 Slovenščina, 🇲🇰 Македонски, 🇲🇪 Crnogorski)
- Active language gets a check icon and highlighted background
- Smooth hover/focus states matching the existing design system
- Same dropdown pattern used in the mobile menu (stacked list)

**3. Mobile menu update** — replace the simple language toggle in the mobile drawer with a similar list of all languages, styled as selectable items.

### Technical details
- Uses existing `DropdownMenu` component from Radix — no new dependencies
- Flag emojis used instead of image assets (zero-cost, universal support)
- Each language config stored as a constant array: `{ code, flag, nativeName }`
- Translation files will be comprehensive — all keys translated for each language

