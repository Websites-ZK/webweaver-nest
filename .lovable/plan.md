

## Add Zagreb, Croatia as a Server Location

### Changes

**`src/pages/Onboarding.tsx`** — Add Zagreb to the `serverLocations` array:
```
{ id: "zagreb", flag: "🇭🇷" }
```

**`src/contexts/LanguageContext.tsx`** — Add the translation key `onboarding.serverLocation.zagreb` across all 9 languages with value like "Zagreb, Croatia (EU)".

