# Building, deploying and installing

How Bootcamp Connect goes from this repository to a web address and onto phones. Decisions D027 and D028; spec [08](../specs/08-installable-app.md).

## Quick reference

| Command | What it does |
| --- | --- |
| `npm install` | Installs the test tools (once). |
| `npm start` | Serves the source at http://localhost:8080. Service worker off, so edits show on refresh. |
| `npm run build:css` | Rebuilds `css/tailwind.css` after you add or change classes. Add `-- --watch` to rebuild as you type. |
| `npm run build` | Rebuilds the CSS, then writes the publishable site to `dist/`. |
| `npm run preview` | Builds, then serves `dist/` at http://localhost:8080 exactly as it will run live (CSP and offline support on). |
| `npm test` | All browser tests against the source. |
| `npm run test:dist` | Builds, then all browser tests against `dist/` over http. |
| `npm run build:artifact` | Builds the copy for the claude.ai artifact link (`build/artifact/`). |

You need Node 18 or later (`.nvmrc` says 24) and Google Chrome for the tests. Opening `index.html` straight from disk still works for a quick look.

## How the code fits together

```
index.html               markup only (no inline scripts, styles or handlers)
manifest.webmanifest     app name, icons and colours for installing
sw.js                    service worker: offline support (only active in dist/)
css/app.css              design tokens and components (Apple HIG, Liquid Glass)
css/tailwind.css         compiled Tailwind utilities (generated, committed)
js/actions.js            runs data-on-click="…" and similar attributes (loads first)
js/icons.js              SVG icon sprite
js/*.js                  one plain script per feature, in the order set in index.html
js/pwa.js                registers the service worker (loads last)
assets/icons/            app icons
vendor/pdfjs/            self-hosted pdf.js (see vendor/README.md)
tailwind.config.js       Tailwind theme (colours, type scale)
src/styles/tailwind.css  Tailwind input
scripts/                 build, build-css, serve, build_artifact
legacy/prototype-v1/     archived first design
```

### Rules that keep it working
- **No inline JavaScript.** Write `data-on-click="openPerson('p1')"`, not `onclick="…"`. Arguments can be quoted strings, numbers, `true`, `false`, `null`, or `this…`/`event…` paths. Need more than a call? Write a named function in the feature's `js/` file and call that. The live site's Content Security Policy blocks inline script, and `tests/structure.test.js` fails if any appears.
- **Write class names in full.** `'bg-appleBlue/10'` is fine; `'bg-' + colour` is not, because the Tailwind build can't see it and the class will have no CSS. The structure test checks every class on screen.
- **Rebuild the CSS** with `npm run build:css` after adding classes, and commit `css/tailwind.css`. CI fails if you forget (`scripts/check-css.mjs` compares class names, so harmless byte differences between machines don't count).

## Deploying the web app

`dist/` is a plain static site: copy it to any static host. Paths are relative, so it works at a domain's root or in a sub-folder (like GitHub Pages' `/bootcamp-connect/`). Hosting must be **https** (or localhost) for installing and offline support to work.

### GitHub Pages (set up in this repo, off by default)
Turning this on makes the app public at `https://jennyshenstudio.github.io/bootcamp-connect/`. Today the app is shared through a private claude.ai link instead (D004), so this is the owner's decision.

1. In the repository: **Settings > Pages > Build and deployment > Source**, choose **GitHub Actions**.
2. **Settings > Secrets and variables > Actions > Variables**, add `DEPLOY_PAGES` with the value `true`.
3. Push to `main`. When CI passes, **Deploy to GitHub Pages** builds and publishes `dist/`. The address appears on the workflow run and under Settings > Pages.

To publish once without step 2, open **Actions > Deploy to GitHub Pages > Run workflow**.

### Other hosts
- **Netlify or Cloudflare Pages:** build command `npm run build`, publish folder `dist`.
- **Vercel** (D026, parked): framework preset "Other", build command `npm run build`, output folder `dist`.

### Updates
Every build gets a new version number (a hash of the files). Members' browsers pick it up the next time they open the app online; the page itself is always fetched fresh when online, so nobody is stuck on an old version.

## Installing on phones and computers

Once the app is live on https:

- **iPhone or iPad:** open it in Safari, tap **Share**, then **Add to Home Screen**.
- **Android:** open it in Chrome and tap **Install app** (or the menu, then **Add to Home screen**).
- **Mac, Windows, ChromeOS:** in Chrome or Edge, use the install icon in the address bar. On a Mac with Safari, **File > Add to Dock**.

It opens full screen with the Bootcamp Connect icon and works offline once it has been opened online. Data stays on that device (D003), so a member's phone and laptop don't share accounts or messages until there's a backend (D026).

## App Store and Google Play

Not set up. The proposed route (D029) is to wrap `dist/` with Capacitor after the backend (D026) exists.

## The claude.ai artifact

Still the private demo link (D004). After a change: `npm run build:css` (if classes changed), `npm run build:artifact`, then publish `build/artifact/index.html` with the files in `build/artifact/files.json` to the existing artifact link. Install and offline features don't apply there.

## Checklist before a release
1. `npm run build:css` and commit `css/tailwind.css` if it changed.
2. `npm test` and `npm run test:dist` pass.
3. Add the changes to **Unreleased** in [CHANGELOG.md](../CHANGELOG.md), then turn it into the new version; bump `version` in `package.json` and `package-lock.json`.
4. Log any decision in [decisions.md](decisions.md); update specs and the README.
5. Push to `main`. CI runs; Pages deploys if it's turned on. Republish the artifact.
