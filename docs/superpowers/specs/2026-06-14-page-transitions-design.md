# Page Transitions — Design Spec

**Date**: 2026-06-14
**Status**: Approved (brainstorming)
**Scope**: Synchronize page-to-page navigation feel across the Smartfolio SPA, in 4 user flows: Landing → Register → Login → Home, Home → Interview, Home → Templates, Home → User Profile (and any sub-tab inside the dashboard).

## Problem

The Smartfolio frontend is a React 19 + Vite + Tailwind 4 + react-router-dom 7 SPA. Today, route changes happen with no visual feedback: the previous page disappears, the new page appears, scroll position is preserved per route (sometimes correct, sometimes wrong), and the dashboard sub-tabs (Personal Info ↔ Security ↔ Pricing ↔ History ↔ My CVs) feel detached from each other. The only motion in the app is `fadeIn` used by the toast and the avatar dropdown.

The user wants navigation to feel **synchronized across all flows** without changing the existing visual design. The intent is "no extra changes, just make it sync to others" — meaning every route change should look and feel the same.

## Goals

- One consistent enter animation on every route change.
- Scroll to top on every route change (browser default is per-route, which feels broken in a SPA).
- A small top-of-screen progress bar so the user sees feedback even before the page-enter animation finishes.
- No new dependencies (no framer-motion, no react-spring, no View Transitions polyfill).
- Honor `prefers-reduced-motion`.
- Surgical: ~50 lines of diff across 5 files.

## Non-Goals

- Per-page custom animations.
- Exit animations (the outgoing page disappears instantly; the new page fades in).
- A real progress indicator tied to async data (the bar is purely cosmetic; it represents "navigation in progress" not "data loading").
- Staggered child fade-in.
- Link hover micro-interactions.
- Animations inside interview/recording flows (those are out of scope; they have their own canvas).

## Architecture

A single `<PageTransition>` component wraps the existing `<Routes>` block in `AppLayout.jsx`. The wrapper derives its React `key` from `location.pathname`, so the routes tree unmounts and remounts on every pathname change, replaying a CSS keyframe animation. A `<ScrollToTop>` component (no UI, just a `useEffect` that scrolls the window) sits next to the routes. A `<RouteProgressBar>` component renders the 2px blue bar at the top of the screen, also keyed on pathname.

```
<App>
  <Router>
    <AuthProvider>
      <AppProvider>
        <AppLayout>
          <PageTransition>             ← NEW: wraps the existing <Routes>
            <Routes>...</Routes>
          </PageTransition>
          <ScrollToTop />              ← NEW: no UI; useEffect on pathname
          <RouteProgressBar />         ← NEW: 2px fixed blue bar
          <FeedbackWidget />          ← unchanged
        </AppLayout>
      </AppProvider>
    </AuthProvider>
  </Router>
</App>
```

### Why one global wrapper, not per-page classes

- The user explicitly asked to "make it sync to others" — a single source of truth enforces consistency.
- Changing the duration, easing, or animation later means editing one place, not 12+ page files.
- Per-page classes defeat the "surgical change" constraint from `CLAUDE.md`.

## Components

### 1. `PageTransition.jsx`

Path: `frontend/src/components/transitions/PageTransition.jsx`

```jsx
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-enter">
      {children}
    </div>
  );
}
```

### 2. `ScrollToTop.jsx`

Path: `frontend/src/components/transitions/ScrollToTop.jsx`

```jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}
```

`behavior: 'instant'` (not `'smooth'`) so the scroll completes before the page-enter fade starts — no visible jump.

### 3. `RouteProgressBar.jsx`

Path: `frontend/src/components/transitions/RouteProgressBar.jsx`

```jsx
import { useLocation } from 'react-router-dom';

export default function RouteProgressBar() {
  const { pathname } = useLocation();
  return (
    <div
      key={pathname}
      className="route-progress-bar"
      aria-hidden="true"
    />
  );
}
```

A single 2px-tall bar, no children, no state. The CSS keyframe (defined in `index.css`) drives the entire timeline:

- 0% → 60%: `scaleX(0)` to `scaleX(0.7)`, opacity 1.
- 60% → 85%: `scaleX(0.7)` to `scaleX(1)`, opacity 1.
- 85% → 100%: `scaleX(1)`, opacity 1 → 0 (fade out).
- Total duration: 750ms with `cubic-bezier(0.16, 1, 0.3, 1)`.

### 4. `AppLayout.jsx` (edit)

Four small additions:

1. Add 3 new imports at the top.
2. Wrap the existing `<Routes>` with `<PageTransition>`.
3. Add `<ScrollToTop />` and `<RouteProgressBar />` next to the existing `<FeedbackWidget />` at the bottom of the return.

No other code in `AppLayout.jsx` changes. No imports are removed. The existing `animationStyles` `<style>` block (which defines `fadeIn` + `.animate-fade-in` for the toast/dropdown) is preserved.

## CSS

Append the following block to `frontend/src/index.css`, after the existing `fw-*` block:

```css
/* ─── Page transitions ─────────────────────────────────────────────── */

/* Page-enter: opacity 0→1 + translateY(6px → 0), 280ms, ease-out-quint. */
@keyframes pageEnter {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.page-enter {
  animation: pageEnter 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Top-of-screen progress bar — 750ms total, fades at the end. */
@keyframes routeProgress {
  0%   { transform: scaleX(0);   opacity: 1; }
  60%  { transform: scaleX(0.7); opacity: 1; }
  85%  { transform: scaleX(1);   opacity: 1; }
  100% { transform: scaleX(1);   opacity: 0; }
}
.route-progress-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--color-primary, #0b3c8f);
  transform-origin: left center;
  z-index: 9999;
  animation: routeProgress 750ms cubic-bezier(0.16, 1, 0.3, 1) both;
  pointer-events: none;
  will-change: transform, opacity;
}

/* Respect users with reduced-motion preferences. */
@media (prefers-reduced-motion: reduce) {
  .page-enter,
  .route-progress-bar {
    animation: none !important;
  }
}
```

The easing `cubic-bezier(0.16, 1, 0.3, 1)` matches the existing `fadeIn` definition in `AppLayout.jsx`, so the new animation feels native to the design system rather than bolted on.

## Files Changed

| Path | Action | Lines |
|---|---|---|
| `frontend/src/components/transitions/PageTransition.jsx` | New | ~10 |
| `frontend/src/components/transitions/ScrollToTop.jsx` | New | ~10 |
| `frontend/src/components/transitions/RouteProgressBar.jsx` | New | ~12 |
| `frontend/src/components/layout/AppLayout.jsx` | Edit | +5 (1 import group, 1 wrap, 2 sibling renders) |
| `frontend/src/index.css` | Edit | +30 (append-only) |

Total diff: ~67 lines (3 new files, 2 edits). No new dependencies. No package.json change.

## Edge Cases

| Case | Handling |
|---|---|
| `prefers-reduced-motion: reduce` | Both animations are disabled via `@media` block in `index.css`. The page still mounts; the user just doesn't see the fade. |
| Sticky `Header` (z-50) | Progress bar uses `z-index: 9999` and is 2px tall, so it sits above the header without shifting content. |
| Sticky `Header` (interview flow) | Same as above. The progress bar is `position: fixed`, not `sticky`, so it doesn't conflict. |
| Login redirect / `<Navigate replace>` | The new path triggers its own animation. No special handling needed. |
| Back / forward buttons | `useLocation` reflects the new path; the wrapper re-keys; animation replays. |
| Initial page load | Animation plays on first render. Gives a "boot-up" feel; matches the user's "synchronized" intent. |
| Strict mode double-render | `useEffect` in `ScrollToTop` is idempotent (sets scroll position to 0 each time). No side effects. |
| Same path, different search params | Wrapper re-keys only on `pathname`, not `search`. Re-mounts on search change, replaying animation. Acceptable. |
| Data-heavy pages (e.g. CV editor) | The 280ms enter is on the page root; it doesn't block async data loading. The page may show skeleton + then content; the fade applies to the page root, not the data. |
| Mobile (no `md:` breakpoint in the design) | The animation is viewport-agnostic. The progress bar spans full width and is 2px tall. The 6px translateY is small enough to feel good on any screen. |

## Performance

- 3 small new files. Total new code: ~32 lines of JSX + ~30 lines of CSS + ~5 lines added to AppLayout.
- No new dependencies. No bundle size impact.
- Animations use `transform` and `opacity` (GPU-accelerated; no layout thrash).
- `will-change: transform, opacity` on the progress bar hints the browser to composite.
- `pointer-events: none` on the progress bar means it never intercepts clicks.

## Testing

Manual verification (per `CLAUDE.md` "Verify" step):

1. `npm run dev` and open `localhost:5173`.
2. Click through these flows and confirm the page-enter fade + scroll-to-top + progress bar all play:
   - Landing → "Đăng ký" → Register page
   - Register → "Đăng nhập" link → Login page
   - Login → Home (after auth)
   - Home → Interview nav link → InterviewLanding
   - Home → Templates nav link → TemplateList
   - Home → avatar dropdown → Personal Info → Security → Pricing → History (sub-tab transitions)
3. Browser back button: confirm animation replays on every backward step.
4. Toggle OS "Reduce motion" on (macOS: System Settings → Accessibility → Display → Reduce motion) and reload — animations should be off.
5. `npm run build` and confirm the production build still succeeds with no warnings.

No automated tests are added (the project has no test runner configured; this is purely a UX-layer change).

## Out of Scope (for clarity)

- Per-page custom animations.
- Exit animations.
- Staggered child reveals.
- A real top progress bar tied to data fetching (e.g. NProgress with axios interceptors).
- Animations inside the interview room or CV editor canvas.
- Link hover micro-interactions (existing hover states are preserved as-is).
