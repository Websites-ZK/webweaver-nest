

## Add Waving Flag Animation to Language Selector

### Overview
Apply a subtle CSS "waving in the wind" animation to the flag emoji icons in both the desktop dropdown and mobile language selector.

### Approach
Since flag emojis are rendered as text/images by the OS, we can animate the container element with a gentle oscillating rotation + skew to simulate a flag fluttering in the wind.

### Changes

1. **`tailwind.config.ts`** - Add a `flag-wave` keyframe and animation:
   - Keyframe: gentle oscillation using `rotate` and `skewX` transforms (e.g., -3deg to 3deg rotation, slight skew)
   - Animation: `flag-wave 1.5s ease-in-out infinite`

2. **`src/components/Navbar.tsx`** - Add the `animate-flag-wave` class to all flag emoji `<span>` elements (4 locations: desktop dropdown trigger, desktop dropdown items, mobile selector button, mobile selector items). Use `inline-block` on the spans so transforms apply, with `transform-origin: left center` so the flag waves from the "pole" side.

