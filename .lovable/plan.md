

## Replace Em Dashes (—) with Hyphens (-) Across All Files

### Overview
Find and replace every occurrence of the em dash character `—` with a regular hyphen `-` in all source files.

### Files to modify

1. **`src/contexts/LanguageContext.tsx`** — 105 occurrences across all 9 language translation blocks (EN, HR, SR, BS, SL, MK, ME, IT, DE). These appear in hero titles, feature descriptions, privacy text, and other translation strings.

2. **`src/components/dashboard/OverviewTab.tsx`** — 1 occurrence: fallback `"—"` for missing domain display.

3. **`src/components/dashboard/HostingTab.tsx`** — 1 occurrence: fallback `"—"` for missing domain display.

4. **`src/components/Navbar.tsx`** — 1 occurrence in a code comment (`Desktop Links — centered`).

5. **`src/components/AnimatedSpheres.tsx`** — 4 occurrences in code comments (wave layer labels).

### Approach
Simple global find-and-replace of `—` → `-` in each file. No logic changes.

