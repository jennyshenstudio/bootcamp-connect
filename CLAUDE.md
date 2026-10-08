@../Foundation/software.md

# Bootcamp Connect: project rules

This project follows Foundation's software rules (imported above), adopted in D030 in [docs/decisions.md](docs/decisions.md). The rules below are specific to Bootcamp Connect, and win where they're more specific.

- **Stage:** alpha (made-up data only, D036). **Client work:** no. Commits go straight to `main`. Moving to beta needs the personal data, online safety, running a service and expert review triggers met first (D034).
- **Specs:** [specs/](specs/), one numbered file per feature, with **Acceptance Criteria**.
- **Decisions:** [docs/decisions.md](docs/decisions.md). **Handover:** [docs/handover.md](docs/handover.md).
- **Personal data:** the live site will store real people's data (D034). Follow [docs/personal-data.md](docs/personal-data.md), and update it and the privacy notice before collecting anything new.

## Standards every change follows
- **Accessibility: WCAG 2.2 AA.** Labelled controls, keyboard access with visible focus, 4.5:1 text contrast in light and dark mode, 44px touch targets, no information by colour alone, works at 320px wide with no sideways scroll.
- **Wording: GOV.UK content style.** Plain English, British spelling, sentence case, short sentences, pounds sterling (D002). Error messages say what went wrong and how to fix it.
- **Design: Apple HIG with Liquid Glass** (D009). Use the existing tokens and components in `css/app.css`.
- **No inline code** (D027). No `<script>` blocks, `style=""` or `onclick=""` in `index.html` or in HTML written by `js/`. Use `data-on-click="fn('arg')"` (also `-submit`, `-change`, `-input`, `-keydown`); anything more than a call goes in a named function. Write Tailwind class names in full, never built from pieces.

## Tests
- `npm test` runs the browser tests in `tests/` (headless Chrome via puppeteer-core; set `CHROME_PATH` if Chrome isn't in the usual place). `npm test -- feed` runs one suite. `npm run test:dist` runs them all against the built site (`dist/`, with its CSP and service worker).
- New tests go in the matching `tests/*.test.js`, or a new suite.
- Test files are synthetic: `npm run test:fixtures` rebuilds them. No real people's data.
- The pre-commit check (`.githooks/pre-commit`) runs the secret scan and `npm test` before every commit. On a new copy of the repo, switch it on with `git config core.hooksPath .githooks`.

## Finishing a change
1. If you added or changed classes, `npm run build:css` (and commit `css/tailwind.css`). `npm run test:dist` passes as well as `npm test`.
2. Add the change to **Unreleased** in `CHANGELOG.md`.
3. Push to `jennyshenstudio/bootcamp-connect`. The repo is public: commit with the noreply email in the repo's local git config, and never commit anything personal.
4. If the app changed, republish the shared prototype: `npm run build:artifact`, then publish `build/artifact/index.html` with the files listed in `build/artifact/files.json` to the existing artifact link.
5. CI (`.github/workflows/ci.yml`) runs on the push. If GitHub Pages is turned on (D028, `docs/deployment.md`), it deploys `dist/` once CI passes.

## Codebase
- `index.html` (formerly `prototype.html`) loads `css/app.css`, then `css/tailwind.css`, then the `js/` modules in a set order: `actions.js` and `icons.js` first, `pwa.js` last. One file per feature.
- `npm run build` writes `dist/` (the publishable site, with a CSP and offline support). See `docs/deployment.md`.
- Third-party code lives in `vendor/` (pdf.js), documented in `vendor/README.md`. Mammoth still loads from cdnjs.
- Data is stored in the viewer's browser for now: `localStorage` (accounts, profiles, posts, chats) and IndexedDB `bc-attachments` (uploads). See D003 and D026.
- Claude features (CV import, chat replies) only run on the published page and fall back to built-in behaviour elsewhere (D016).
