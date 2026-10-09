# Changelog

Every release of Bootcamp Connect, newest first. Each entry says what changed for members, for people working on the code, and how it was tested. The reasons behind changes are in [docs/decisions.md](docs/decisions.md).

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions follow [Semantic Versioning](https://semver.org/) (`package.json`).

## How to add an entry
1. Add your changes under **Unreleased** as you work, in the sections below (Added, Changed, Fixed, Removed, Security).
2. When you release, rename **Unreleased** to the new version and date, bump `version` in `package.json` and `package-lock.json`, and start a new empty **Unreleased**.

## Unreleased

### Added
- **Live site sign-up screen** (spec 09, D033): when Supabase settings are present, the sign-up and log-in screen offers Continue with Google only. Sign up asks for the track and the terms agreement first; log in is just the Google button; a note says what Google shares and that email sign-in is coming later. The demo is unchanged. Google sign-in itself isn't connected yet. New `js/backend.js` decides which version runs.
- **Plans for real members** (not built yet): decisions D032 to D034, spec 09 (real accounts and profiles), personal data rules and risks (`docs/personal-data.md`), a draft privacy notice (`docs/privacy-notice.md`) and draft terms of service (`docs/terms-of-service.md`). Members must be 18 or over, and the Google photo becomes their starting profile photo. D026 is superseded.
- **Licence:** `LICENSE` makes the code "all rights reserved" (D031). It can be read on GitHub but not copied or reused without permission.

### Changed
- **Sign-up screen:** the Google button uses Google's official "G" and button colours, in light and dark mode (Google's sign-in branding guidelines). The terms checkbox now reads "I agree to the Terms of Service and have read the Privacy notice", and both links open the draft documents on GitHub until they become pages in the app. Wording follows GOV.UK style: "Create account", "Agree to the Terms of Service to continue" and a shorter demo note.
- **How we work:** the project now follows Foundation's shared software rules (D030). `CLAUDE.md` imports them; each session ends with a note in `docs/handover.md`.
- **Spec 09 reviewed** (not built yet): launching to real members now means moving to beta first, with backups, an incident plan, DPIA screening and an expert review. Log out and Delete my account must clear the member's data from the browser. The Content Security Policy allows Google's photo address so the starting photo can be copied. The draft privacy notice adds data handled outside the UK and 2 more rights. `docs/personal-data.md` adds the shared computer risk.
- **Project folder:** the project now lives in `~/code/bootcamp-connect`, next to `~/code/foundation` (D037). `CLAUDE.md` and the setup test point at `../foundation`.

### Security
- A pre-commit check (`.githooks/pre-commit`) blocks commits containing passwords, API keys or tokens (gitleaks), or with failing tests.
- `.env` files are ignored by git, and Claude Code is stopped from reading or editing them (`.claude/settings.json`), and asks before the usual ways of skipping the pre-commit check. These rules match the wording of commands, so they catch the usual cases, not every one.
- GitHub secret scanning, push protection and Dependabot security alerts are on (D035), and CI scans the whole history for secrets (D036).
- The pre-commit check skips the tests when only Markdown files change, and warns when changes aren't staged (D036).
- Updated to Foundation 1.0 (Foundation F017): the pre-commit check blocks changes to the secret scanner's settings files (`.gitleaks.toml`, `.gitleaksignore`), renaming code to `.md` no longer skips the tests, and more `.env` file names are blocked.

### Fixed
- **Tests:** the profile suite sometimes failed on CI. After a blocked save, the app smooth-scrolls to the error for up to a second, and the next click could land while the page was still moving. Tests now wait for scrolling to stop (`waitForScrollToStop` in `tests/helpers.js`).

### Tested
- New `setup` suite checks the Foundation import, stage, `.gitignore`, Claude Code settings, the pre-commit check, and that the check matches Foundation's copy.

## 0.11.0 – 2026-10-08

Ready to deploy as a web app and as an installable phone app. Decisions D027 and D028, spec 08.

### Added
- **Installable app (PWA).** `manifest.webmanifest`, app icons in `assets/icons/` (192px, 512px, maskable, Apple touch icon, favicon) and phone home-screen tags. Members can add Bootcamp Connect to the home screen on iPhone, Android and desktop; it opens full screen.
- **Works offline.** `sw.js` service worker keeps the app's files, so the installed app opens without a connection. New versions are picked up the next time it's opened online.
- **Production build.** `npm run build` creates `dist/`, a static site for any host, with a Content Security Policy and the service worker turned on. `npm run preview` serves it locally.
- **Local server.** `npm start` serves the source at http://localhost:8080 (`scripts/serve.mjs`, no dependencies).
- **Continuous integration.** `.github/workflows/ci.yml` runs every test on each push and pull request, against the source and against the built site, and fails if the committed `css/tailwind.css` is missing or has extra classes compared with a fresh build (`scripts/check-css.mjs`).
- **GitHub Pages deployment.** `.github/workflows/deploy-pages.yml` publishes `dist/` after CI passes on `main`. Off until the owner turns it on; see [docs/deployment.md](docs/deployment.md).
- **Docs.** This changelog, [docs/deployment.md](docs/deployment.md), [specs/08-installable-app.md](specs/08-installable-app.md), [vendor/README.md](vendor/README.md), decisions D027 to D029.
- **Tests.** `tests/structure.test.js` (21 checks: no inline code, every class on screen has CSS, handler behaviour, sign-up fits one screen with non-Apple fonts), `tests/pwa.test.js` (20 checks: build, manifest, icons, service worker, CSP, offline), `tests/legacy.test.js` (9 checks). `npm run test:dist` runs the whole suite against the built site.
- `.editorconfig` and `.nvmrc` (Node 24, the current LTS) so editors and CI use the same settings.

### Changed
- **`prototype.html` is now `index.html`**, so web hosts serve it at the site's address. It holds markup only.
- **Tailwind is compiled** instead of loaded from `cdn.tailwindcss.com` (which Tailwind says not to use in production). The configuration moved from an inline script to `tailwind.config.js`; `npm run build:css` writes `css/tailwind.css` (29 KB, minified, committed). Same version (3.4.17) and same stylesheet order, so the interface is pixel-identical on the 8 screens compared.
- **No inline JavaScript.** About 115 inline `onclick`/`onsubmit`/`onchange`/`oninput`/`onkeydown` handlers in `index.html` and `js/` became `data-on-*` attributes, run by the new `js/actions.js` (no `eval`). Four handlers that held several statements became named functions: `importFromInput`, `addComposerFilesFromInput`, `onPayTypeChange`, `openVerifiedExperience`.
- The SVG icon sprite moved from `index.html` to `js/icons.js`; the two `style=""` attributes became CSS (`.app-header`, `w-0`).
- **pdf.js is self-hosted** in `vendor/pdfjs/3.11.174/` instead of loaded from cdnjs, so PDF import and PDF attachments work offline.
- `prototype-v1.html` moved to `legacy/prototype-v1/` and is split into `index.html`, `css/style.css`, `css/tailwind.css` and `js/app.js` (`npm run build:legacy-css`).
- The claude.ai artifact build (`npm run build:artifact`) uses `index.html` and includes the compiled CSS and pdf.js.
- Page language is `en-GB` (was `en`).
- Tests open `index.html`, start Chrome with `--no-sandbox` when run as root (Docker, some CI), and find `/usr/bin/chromium-browser`.
- `CLAUDE.md` and `README.md` describe the new structure, build, release and changelog steps.
- `app.css` header comment corrected: it loads before Tailwind's utilities, not after.

### Fixed
- The sign-up page overflowed one screen at 1280×650 when the Apple system font wasn't available (Windows, Linux): the desktop brand panel's headline wrapped to 4 lines. On screens 700px tall or less the panel's padding and headline now shrink.
- A script that failed to load (for example offline) was remembered as loaded, so trying again did nothing. It is now removed so the next attempt retries.

### Security
- The built site sends a Content Security Policy that blocks inline script and only allows scripts from the site itself and cdnjs (Mammoth). Checked by test: nothing in the app is blocked, and injected inline handlers don't run.
- pdf.js runs with `isEvalSupported: false`, closing CVE-2024-4367 (code execution through crafted PDF fonts) in pdf.js 3.11.174.
- Handler arguments are parsed as data, not run as code, so an ID can no longer break out into script.

### Test results
- Source (`npm test`) and built site (`npm run test:dist`): 146 passed in each. Before these changes, 88 of 95 passed in the same environment.
- GitHub Actions CI (Ubuntu, Chrome, normal internet access): every check passes, against both the source and the built site.
- In the offline environment where this release was built, 4 checks failed for reasons outside the app:
  - Word CV import needs Mammoth from cdnjs, which that environment blocks (the app shows "Couldn't load the file reader. Check your internet connection and try again."). This stops the rest of the import suite; run with the Word step skipped, the other 12 import checks pass.
  - Sign-up at 390×844: that environment swaps in the wider Inter font for Helvetica Neue. It fits with Arial-metric fonts, which `structure.test.js` checks.
- Visual check: 8 screens (sign-up, Profile, Feed, Messages; desktop and phone) are pixel-identical to the Tailwind CDN version.

## 0.10.0 and earlier

Before this changelog. See the git history and [docs/decisions.md](docs/decisions.md) (D001 to D026).
