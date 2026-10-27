# browser Studio 1026

browser Studio 1026 is an original browser extension for turning a handful of open tabs into a calm, contextual research trail. It is designed for the moment after a useful browsing session: before the signals disappear into bookmarks, screenshots, and memory.

The included demo trail makes the product understandable immediately, even when it is viewed as a normal web app outside Chrome.

## What it does

- Captures eligible tabs from the current Chrome window, with a polished demo capture when Chrome APIs are unavailable.
- Organizes sources as a deliberately small “trail” rather than an endless bookmark list.
- Supports quick written breadcrumbs, source detail panels, local persistence, search, and restore-demo control.
- Offers accessible modal dialogs, visible keyboard focus, mobile-friendly layouts, reduced-motion support, and useful empty/loading/error states.
- Keyboard shortcuts: `/` search, `C` capture current window, `N` add a thought, `F` toggle focus view, and `Esc` close a panel.

## Stack and architecture

- React + TypeScript + Vite
- Manifest V3 Chrome extension configuration in `public/manifest.json`
- Browser-local state in `localStorage`; no backend, account, or paid service required
- The app detects `chrome.tabs.query` when loaded as an extension. In a standard browser preview, it falls back to realistic sample tabs.

Key files:

- `src/App.tsx` — interaction model and component tree
- `src/data.ts` — typed demo content
- `src/styles.css` — visual system, responsive layout, state styling, and motion preferences
- `public/manifest.json` — Chrome MV3 manifest

## Local setup

```bash
npm install
npm run dev
```

For a production extension build:

```bash
npm run build
```

Then visit `chrome://extensions`, turn on **Developer mode**, select **Load unpacked**, and choose the generated `dist` directory. The toolbar action opens the Studio popup.

## Validation

```bash
npm test
npm run build
```

The test suite checks the initial demo trail, search empty state, and Chrome-independent capture flow. Build validation type-checks the project and produces the loadable extension output.

## Representation and screenshot guidance

For a strong portfolio screenshot, use a desktop viewport wider than 1180px and capture the default North Star trail. The desired composition includes the warm-grey navigation column, the five colored material cards, and the pale green question card at right. A second useful frame is the “Make a trail from this window” capture modal, which makes the extension behavior clear at a glance.

## Deployment notes

This project is intentionally static and does not need a server. Vite emits all deployment files to `dist/`. For web hosting, deploy that directory with SPA fallback. For Chrome distribution, upload the packaged `dist` contents through the Chrome Web Store developer dashboard after replacing the placeholder extension icons if store branding requires them. No secrets are used; `.env.example` documents the optional integration convention.
