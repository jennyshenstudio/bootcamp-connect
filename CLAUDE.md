# Bootcamp Connect: how we work

Read this at the start of every session. It is decision D025 in [docs/decisions.md](docs/decisions.md).

## Before changing anything
1. Check the change against [docs/decisions.md](docs/decisions.md). If it contradicts an accepted decision, stop and ask the owner.
2. Read the feature's spec in [specs/](specs/). New features get a new numbered spec with **Acceptance Criteria** before they are built.

## Standards every change follows
- **Accessibility: WCAG 2.2 AA.** Labelled controls, keyboard access with visible focus, 4.5:1 text contrast in light and dark mode, 44px touch targets, no information by colour alone, works at 320px wide with no sideways scroll.
- **Wording: GOV.UK content style.** Plain English, British spelling, sentence case, short sentences, pounds sterling (D002). Error messages say what went wrong and how to fix it.
- **Design: Apple HIG with Liquid Glass** (D009). Use the existing tokens and components in `css/app.css`.
- **No inline code** (D027). No `<script>` blocks, `style=""` or `onclick=""` in `index.html` or in HTML written by `js/`. Use `data-on-click="fn('arg')"` (also `-submit`, `-change`, `-input`, `-keydown`); anything more than a call goes in a named function. Write Tailwind class names in full, never built from pieces.
- **Decisions are logged.** Every product, design or technical decision gets an entry in `docs/decisions.md` and a row in its summary table. A decision that changes gets a new entry, and the old one is marked **Superseded** rather than deleted.

## Tests
- `npm test` runs the browser tests in `tests/` (headless Chrome via puppeteer-core; set `CHROME_PATH` if Chrome isn't in the usual place). `npm test -- feed` runs one suite. `npm run test:dist` runs them all against the built site (`dist/`, with its CSP and service worker).
- **Every change comes with a test** for what it changes, added to the matching `tests/*.test.js` (or a new suite).
- **All tests must pass before committing.** If a test fails, fix the cause; never weaken or delete a test to get it to pass without asking the owner.
- Test files are synthetic: `npm run test:fixtures` rebuilds them. No real people's data.

## Finishing a change
1. If you added or changed classes, `npm run build:css` (and commit `css/tailwind.css`). `npm test` and `npm run test:dist` pass.
2. Add the change to **Unreleased** in `CHANGELOG.md`. Update the spec, `README.md` and `docs/decisions.md` if behaviour or a decision changed.
3. Commit to `main` with a short, descriptive message and push to `jennyshenstudio/bootcamp-connect`. The repo is public: commit with the noreply email in the repo's local git config, and never commit anything personal.
4. Republish the shared prototype: `npm run build:artifact`, then publish `build/artifact/index.html` with the files listed in `build/artifact/files.json` to the existing artifact link.
5. CI (`.github/workflows/ci.yml`) runs on the push. If GitHub Pages is turned on (D028, `docs/deployment.md`), it deploys `dist/` once CI passes.

## Codebase
- `index.html` (formerly `prototype.html`) loads `css/app.css`, then `css/tailwind.css`, then the `js/` modules in a set order: `actions.js` and `icons.js` first, `pwa.js` last. One file per feature.
- `npm run build` writes `dist/` (the publishable site, with a CSP and offline support). See `docs/deployment.md`.
- Third-party code lives in `vendor/` (pdf.js), documented in `vendor/README.md`. Mammoth still loads from cdnjs.
- Data is stored in the viewer's browser for now: `localStorage` (accounts, profiles, posts, chats) and IndexedDB `bc-attachments` (uploads). See D003 and D026.
- Claude features (CV import, chat replies) only run on the published page and fall back to built-in behaviour elsewhere (D016).
