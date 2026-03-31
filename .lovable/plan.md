

## Make Navbar Text White When Transparent Over Hero

### Approach
Use the existing `isTransparent` state to conditionally apply white/light text classes to all navbar elements when the navbar is transparent over the dark hero.

### Changes — `src/components/Navbar.tsx`

1. **Logo text** (line 72): `text-foreground` → conditional `text-white` when transparent
2. **Nav links** (lines 81-85): When transparent, active links get `text-white` instead of `text-primary`, inactive get `text-white/70 hover:text-white` instead of `text-muted-foreground`
3. **Language button** (around line 98): When transparent, swap `border-border/60 bg-muted/50 text-foreground` to `border-white/20 bg-white/10 text-white`
4. **Get Started button**: Keep as-is (already has solid `bg-primary` background)
5. **User avatar button**: Keep as-is (solid background)
6. **Mobile hamburger icon** (around line 163): `text-foreground` → conditional `text-white`

All changes are simple ternaries on `isTransparent` — no new state or dependencies needed.

