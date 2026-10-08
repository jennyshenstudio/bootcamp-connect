# Feature spec 08: installable web and mobile app

Decisions: D027 (code organisation), D028 (installable app and deployment).

## Purpose
Members can open Bootcamp Connect from a normal web address and add it to their phone's home screen, where it opens full screen like an app and keeps working without a signal. The code is ready to publish from the GitHub repository without changes.

## What members get
- **On a computer:** the app at a web address. Chrome and Edge offer **Install** in the address bar.
- **On iPhone or iPad (Safari):** Share, then **Add to Home Screen**. It opens full screen with the Bootcamp Connect icon.
- **On Android (Chrome):** the **Install app** prompt, or the menu, then **Add to Home screen**.
- **Offline:** once opened online, the app opens without a connection and the member stays signed in. Everything is stored in the browser (D003), so the feed, profile and messages work as before. Reading a Word (.docx) CV still needs a connection until Mammoth is self-hosted (see `vendor/README.md`).
- **Updates:** a new version is used as soon as the member next opens the app online.

## How it's built
- `index.html` holds markup only: no inline scripts, styles or event handlers. Buttons use `data-on-click="…"` (and `data-on-submit`, `-change`, `-input`, `-keydown`), run by `js/actions.js` without `eval`.
- Styles: `css/app.css` (design tokens and components), then `css/tailwind.css`, compiled from `tailwind.config.js` with `npm run build:css`. Class names must be written out in full in `index.html` or `js/`, never assembled from pieces.
- Icons for the interface are in `js/icons.js`; app icons are in `assets/icons/`.
- `manifest.webmanifest` describes the app for installing; `sw.js` (service worker) keeps the app's files for offline use.
- `npm run build` creates `dist/`, the site to publish. It adds a Content Security Policy and turns the service worker on. `npm run preview` serves it at http://localhost:8080.
- pdf.js is self-hosted in `vendor/`.

## Acceptance criteria
1. `index.html` and `js/` contain no inline script, `<style>` block, `style=""` attribute or inline event handler, and nothing uses `eval` or `new Function`.
2. Every class name on screen has a CSS rule after the Tailwind build (checked across sign-up, Profile, Feed, the composer, Connect, a profile sheet and Messages).
3. The interface looks the same as the version that used the Tailwind CDN (pixel comparison of 8 screens, desktop and phone).
4. The sign-up page fits one screen at 1280×650, 1366×768 and 390×844 even when the Apple system font isn't available.
5. `npm run build` produces `dist/` with a Content Security Policy that allows no inline script; the whole test suite passes against `dist/` (`npm run test:dist`) and nothing is blocked by the policy.
6. The manifest has a name, short name, start page, standalone display, theme colour, British English language, 192px and 512px icons and a maskable icon, and each icon loads at its stated size.
7. On the built site the service worker installs, controls the page after a reload, caches the app's files, and the app opens offline with the member still signed in and fully styled.
8. The service worker is not used when `index.html` is opened from disk, from `npm start`, or on the claude.ai artifact.
9. PDFs (CV import and attachments) work with the self-hosted pdf.js, with eval turned off.
10. The archived v1 prototype (`legacy/prototype-v1/`) is split the same way and still works.
