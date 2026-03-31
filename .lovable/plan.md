

## Mark Priority Support as "Included Free" for Standard, Business & Agency Plans

### What's wrong
In the onboarding extras step (step 2), Priority Support is shown as a paid add-on (+€3.09/mo) for all plans, even though Standard, Business, and Agency already include priority-level support or better. Only the Basic plan should see it as a paid option.

### Changes — `src/pages/Onboarding.tsx`

1. **Conditionally render Priority Support add-on based on selected plan:**
   - If `selectedPlan` is `"standard"`, `"business"`, or `"agency"`: show the priority extra card as pre-checked/ticked, non-interactive, with a green "Included Free" badge instead of the price. It should not be toggleable or add to the total.
   - If `selectedPlan` is `"basic"`: show it as a normal paid add-on (current behavior).

2. **Update the extras rendering loop** in the Step 2 section (~line 336):
   - For each extra, check if it's `"priority"` and the plan already includes it.
   - If included: render the card with a permanent checkmark, a "✓ Included in your plan" or "Free" label replacing the price, visually styled as selected but with a subtle "included" appearance (e.g., `border-green-500/50 bg-green-500/5`), and `pointer-events-none` so it can't be toggled.
   - Ensure the priority extra is NOT counted in `extrasTotal` when included free.

3. **Update the review step (step 3)** (~line 418): If priority is included free, either skip it from paid extras list or show it with "€0.00" / "Included" label.

### Translation keys
- Add `onboarding.extra.includedFree` → "Included in your plan" (+ translations for all languages) in `src/contexts/LanguageContext.tsx`.

### Files modified
- `src/pages/Onboarding.tsx`
- `src/contexts/LanguageContext.tsx`

