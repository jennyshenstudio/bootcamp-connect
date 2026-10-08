# Bootcamp Connect

A community and matching hub where bootcamp Software Developer and Business Developer students team up: post ideas and paid gigs, find complementary co-founders, and message each other.

## What's here

| Path | What it is |
| --- | --- |
| `index.html` | The app (markup only). Open it in a browser, or run `npm start`. |
| `css/` | `app.css` (design tokens and components) and `tailwind.css` (compiled Tailwind, built by `npm run build:css`). |
| `js/` | One plain script per feature, loaded in the order set in `index.html`. `actions.js` runs the `data-on-*` handlers; `icons.js` holds the icon sprite; `pwa.js` turns on offline support. |
| `manifest.webmanifest`, `sw.js`, `assets/icons/` | Installable app: name, icons, and the service worker for offline use. |
| `vendor/` | Self-hosted third-party libraries (pdf.js). See `vendor/README.md`. |
| `tailwind.config.js`, `src/styles/` | Tailwind theme and input. |
| `scripts/` | `build.mjs` (writes `dist/`), `build-css.mjs`, `check-css.mjs`, `serve.mjs` (local server), `build_artifact.py` (claude.ai artifact). |
| `.github/workflows/` | CI (tests on every push) and GitHub Pages deployment (off until turned on). |
| `legacy/prototype-v1/` | Earlier design with fuller Matchmaker, Messages, and Profile tabs. |
| `CLAUDE.md` | How we work: standards, tests, and release steps for every change. |
| `CHANGELOG.md` | What changed in each version. |
| `docs/decisions.md` | Every product, design, and technical decision. |
| `docs/deployment.md` | Building, deploying, and installing the app. |
| `tests/` | Browser tests (`npm install`, then `npm test`). Needs Google Chrome. |
| `test-data/` | Sample CV for a made-up member (Maya Okafor) as PDF, Word, and HTML, for testing the profile import. |
| `specs/` | Feature specs. `01-auth.md`: sign-up, log in, and track selection. `02-profile.md`: one-page profile setup. `03-profile-import.md`: import from CV or LinkedIn. `04-connections-messages.md`: demo community. `05-feed.md`, `06-matching.md`, `07-project-loop.md`: experience-first platform. `08-installable-app.md`: web and phone app. |

## Prototype features

Bootcamp Connect is **experience first**: members join real projects (paid, unpaid, or equity) that become verified portfolio experience.

- Typed feed: Projects, Resources, Personal projects, Support, Community, with For you ranking, likes, comments, saves, and photos, videos, documents, and links on every post type
- Matching v2: hard filters (pay type, hours, setting, track) plus skill fit, growth fit (skills you want to learn), commitment, interests, goals, and fairness, with reasons; two-way person matching; team suggestions for project owners
- Project loop: apply, manage applicants, start a project with an automatic team chat, mark complete with ratings and endorsements, and earn verified experience on your profile

- Full-page sign up / log in with Google (simulated) and email
- Mandatory track selection (Software Developer or Business Developer) and Terms agreement
- Log out, and staying logged in after a refresh
- One-page profile setup: photo, headline, track, location, About, links, work experience, skills, projects, and what you're looking for, with a live preview card and profile strength meter
- Import from a CV or LinkedIn profile PDF (PDF, .docx, or text): extracts experience, skills, projects, and more, with a review step before anything is added. Uses Claude on the published claude.ai page, or a built-in reader when opened as a local file
- New sign-ups land on profile setup; returning members land on the Project Feed
- Demo community: 8 sample members with full profiles, a ranked Connect tab (projects and people) with connection requests and profile view, 3 group chats and direct messages with unread badges, typing indicators, and replies (written by Claude on the published page)
- Project feed with upvotes
- Installable on phones and computers (Add to Home Screen) and works offline once opened, when published from `dist/`

Accounts and profiles (including photos, resized to 256px) are stored only in the viewer's browser (`localStorage`); there is no backend yet, and passwords are not stored or checked.

## Design

The interface follows Apple's Human Interface Guidelines with a **Liquid Glass** look (iOS 26 / macOS Tahoe):

- [apple-hig-designer](https://github.com/axiaoge2/apple-hig-designer) skill (MIT, © axiaoge2), installed for Claude Code at `.claude/skills/apple-hig-designer/`: system colors, iOS type scale (17px body), 8pt grid, 44px touch targets
- Liquid Glass rules from Apple's guidance: glass for the floating navigation layer (top bar, phone tab bar, buttons), thicker frosted glass for content cards so text stays legible, no glass stacked on glass
- Pure-CSS glass (backdrop blur and saturation, top-edge specular highlight, soft sheen) over an ambient color field, so it works in Safari, Chrome, and Firefox; real-refraction libraries such as [liquid-glass-react](https://github.com/rdev/liquid-glass-react) only show refraction in Chrome
- Automatic dark mode; falls back to solid surfaces when "Reduce transparency" is on

## Run it

Open `index.html` in any modern browser, or run `npm start` and go to http://localhost:8080. No internet connection is needed, except to import a Word (.docx) CV.

## Build and deploy

```
npm install          # once: test tools
npm run build        # compiles the CSS and writes the publishable site to dist/
npm run preview      # serves dist/ at http://localhost:8080 as it runs live
npm test             # browser tests (npm run test:dist tests the built site)
```

`dist/` is a static site for any https host. GitHub Pages deployment is set up in `.github/workflows/` but off until the owner turns it on. Steps, hosting options, and how members install the app on iPhone, Android, and desktop: [docs/deployment.md](docs/deployment.md).

## How we work

The project follows Foundation, the owner's shared software rules, kept in a separate repo that is private for now (decision D030), plus its own rules in `CLAUDE.md`. Before every commit, a check scans for passwords or keys and runs `npm test`. After cloning, switch it on with `git config core.hooksPath .githooks`. It needs [gitleaks](https://gitleaks.io/) installed.

## Licence

All rights reserved (decision D031). The code is public to read, but you may not copy or reuse it without permission. See [LICENSE](LICENSE). Third-party code in `vendor/` keeps its own licence.
