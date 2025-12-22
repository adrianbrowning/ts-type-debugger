# Layout Updates Task Progress

## Branch: `feature/layout-updates`

## Completed Tasks

1. ✅ **Add Tailwind CSS** - Installed `tailwindcss` and `@tailwindcss/vite`, configured in vite.config.ts
2. ✅ **Update CSS Variables** - Updated styles.css with new slate/indigo palette to match mockup
3. ✅ **Create LandingPage** - New component with:
   - Hero section with gradient background
   - "Try It" section with code input and examples
   - "Why TS Debugger" sidebar
   - "See It in Action" video placeholder
   - "Features" grid
   - Footer
4. ✅ **Update App.tsx** - Added view state to switch between landing/debugger
5. ✅ **Update index.html** - New title and meta description
6. ✅ **Add URL Routing** - `/` for landing, `/debugger` for debugger view
7. ✅ **Tests** - Type check and lint pass, build succeeds
8. ✅ **Theme Dropdown** - Consolidated theme switcher into icon dropdown
9. ✅ **Light Mode Support** - Added CSS for landing page light/dark themes
10. ✅ **3-Panel Debugger Layout** - Refactored debugger view:
    - Editor | Eval Target | Call Stack (3 panels)
    - Debug panes disabled/faded until Debug clicked
    - Editor collapses left with chevron indicator on Debug
    - Debug panes enable when editor collapsed
    - Expanding editor disables debug panes (stale)

## Key Files Changed

- `vite.config.ts` - Added Tailwind plugin + SPA fallback
- `src/web/styles.css` - New slate/indigo color palette + landing page styles
- `src/web/components/LandingPage.tsx` - New landing page component
- `src/web/components/ThemeDropdown.tsx` - Theme dropdown (Tailwind)
- `src/web/components/ThemeDropdownInline.tsx` - Theme dropdown (inline styles)
- `src/web/components/Header.tsx` - Uses ThemeDropdownInline
- `src/web/App.tsx` - 3-panel layout with collapsible editor
- `index.html` - Updated title/meta

## URL Routes

- `/` - Landing page with hero, try-it section, features
- `/debugger` - Full debugger view (bookmarkable)
- `/debugger?code=...&typeName=...` - Shared code links

## How It Works

### Landing Page
1. User lands on `/` (LandingPage) by default
2. "Evaluate" button navigates to `/debugger` with pre-filled code
3. Users can bookmark `/debugger` to skip landing page
4. Header "← Back" button returns to `/`
5. Browser back/forward navigation works correctly
6. URL sharing still works (preserves query params)

### Debugger View (3-Panel)
1. Initial state: Editor expanded | Eval Target (disabled) | Call Stack (disabled)
2. Debug panes show "Click Debug to enable" with overlay
3. Click "Debug" button → Editor collapses, debug panes enable
4. Collapsed editor shows "›" chevron to expand
5. Clicking chevron expands editor, disables debug panes (stale)
6. Edit code and click Debug again → re-evaluates and updates panes
