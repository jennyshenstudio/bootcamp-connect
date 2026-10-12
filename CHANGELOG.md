# Changelog

Every release of Bootcamp Connect, newest first. Each entry says what changed for members, for people working on the code, and how it was tested. The reasons behind changes are in [docs/decisions.md](docs/decisions.md).

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions follow [Semantic Versioning](https://semver.org/) (`package.json`).

## How to add an entry
1. Add your changes under **Unreleased** as you work, in the sections below (Added, Changed, Fixed, Removed, Security).
2. When you release, rename **Unreleased** to the new version and date, bump `version` in `package.json` and `package-lock.json`, and start a new empty **Unreleased**.

## Unreleased

### Added
- **Profile page** (spec 15, D050): selecting a member opens their profile as a page, like LinkedIn, instead of a pop-up. A top card with their photo, headline, track, stage, location and connections; then Pinned, About, Work to show, Posts, Skills, Experience, Education and Verified experience; and beside it Why you might connect, the CV, Available for, Links and Group chats together. Back returns to where you were.
- **Your page:** the Profile tab shows your own page, with Edit profile opening the form. Save profile or Cancel returns to your page. A new member still starts on the form.
- **Pin** up to 3 pieces of work or posts to the top of your page.
- **View CV:** a CV made from the profile, with Print or save as PDF. No email address or phone number.
- **Saved:** resources and opportunities you've saved, on your own page, only for you.
- **Spec 15** and decision D050.
- **Delete your posts** (D047): your own posts have a "…" menu with Edit and Delete. Delete asks first and says it can't be undone; for an opportunity with applicants it says their applications will be removed. Opportunities can only be deleted while open.
- **Edit your posts** (D045): your own posts have Edit (now in the "…" menu), on the card, in the details and on your opportunity's page. It opens the post form filled in; the type can't change. Saving keeps the post's place, likes, comments and applicants, and it says "Edited" next to its time. Closing without saving changes nothing.
- **Your activity** (spec 14, D042): the column beside the Feed is now a summary of where you stand: New for you (opportunities for your pathway), Current (your opportunities: applicants to review, in progress with its end date, applied and waiting), People to get back to (invitations and unread conversations), To do (profile steps, projects to mark complete, applying to a first opportunity) and Drafts. Empty sections are hidden, and To do comes first until your profile has a headline. On phones, a Your activity bar above the Feed says how many things need you and opens the summary.
- **Drafts:** Save draft in the post form, and closing the form with anything written or attached saves a draft too, with a message. Continue reopens it exactly as it was, posting it removes it, and Delete removes it and its files. If the browser's storage is full, it says so instead.
- **Spec 14** and decision D042.
- **Updates** (spec 13, D041): professional announcements about your career or a project, like a LinkedIn post. Choose Career or Project, write your news (up to 1,000 characters) and add photos, videos, documents or links. No title and no "feedback wanted" option. Each update shows its label in words, and the Feed has an **Updates** filter. Spec 13 and decision D041.
- **Opportunities** (spec 12, D040): the "Project" post type becomes Opportunity. Posting asks who it's for (Software Developer or Business Developer), title, pay (Paid with a fixed fee in pounds, or Unpaid), commitment (Part-time, Full-time or Contract), workplace (In person, Hybrid or Remote, with a town or city), start and end dates, about the project, responsibilities, minimum requirements and nice to have. Each missing answer says what to fix.
- **Opportunity page:** See details opens a page laid out like a job listing: at a glance (pay, commitment, workplace, dates and length in weeks), about the project, responsibilities, minimum requirements, nice to have and about the poster, with Apply and Save.
- **Coloured edge for the pathway:** opportunity cards have a blue edge for Software Developer and a purple edge for Business Developer, and name the pathway first in their facts, so it never relies on colour alone.
- **Shorter application:** a message to the poster (required, up to 300 characters) and your most relevant work from your profile. The poster's Manage view shows both.
- **Spec 12** and decision D040.
- **Profile built around work to show** (spec 11, D039): pieces of work are short case studies with guided questions worded for each track (the problem, your role, what you did, what happened, what you'd do differently), facts that show the level ("Led · team of 4 to 6 · 1 to 3 months · Live"), a screenshot, live and code links, skills used, Built with (including AI tools) and teammates. Up to 6; the first 3 show on the profile. Tagged teammates confirm the work, and it then shows on their profile too. Skills show as confirmed, proven (used in work) or listed, and selecting one shows the work behind it. Business Developer viewers see live links first, with code in a closed "Technical details" section; Software Developer viewers see code links straight away. New profile fields: stage, cohort, "currently working on" and education. "See your full profile" previews your own profile. Every profile says "Members can use AI to help write their profiles"; there is no AI badge.
- **Claude helps write work to show** (on the published page only): "Write it with Claude" interviews you one question at a time and drafts the piece; "Suggest from code link" reads a public GitHub repository's README and package.json (or asks you to paste them if it can't); "Suggest from a document" reads a PDF or Word file. Every suggestion is marked "Suggested" until you use or dismiss it, and nothing is saved until you press Save. CV import now turns projects into draft pieces of work.
- **New test suite** `tests/work.test.js` for spec 11.
- **Connect › People rebuilt as a networking page** (spec 10, D038): Invitations (requests sent to you, with their note, to accept or ignore), then Suggested for you (5 members, each with reasons), then All members with search (name, skill, company or school), filters for track, stage, cohort and connection, a result count and Show more. Cards show stage, cohort and mutual connections. Connect opens a dialog with an optional note of up to 300 characters; a sent request can be withdrawn, and some sample members leave requests waiting. The profile sheet shows the stage evidence line (for example "Exploring an idea · 4 years' experience · Cohort 12 · 1 finished project").
- **A bigger made-up community** (spec 10, D038): 99 sample members instead of 8. Cohort 12 is the current cohort (24 sample members plus you) and Cohorts 9 to 11 are alumni (25 each), about half on each track. Each member has a stage, cohort, education, a "currently working on" line and pieces of work to show, and members are connected to each other so mutual connections work. Generated by `scripts/make-community.mjs` (`npm run make:community`) into `js/demo-members.js`, the same every time. A test checks the file matches the script.
- **Specs 10 and 11** (approved as version 1): networking (finding and connecting with members, stage, suggestions without a match percentage) and a profile built around work to show. Decisions D038 and D039; D014's person fit is superseded.
- **Live site sign-up screen** (spec 09, D033): when Supabase settings are present, the sign-up and log-in screen offers Continue with Google only. Sign up asks for the track and the terms agreement first; log in is just the Google button; a note says what Google shares and that email sign-in is coming later. The demo is unchanged. Google sign-in itself isn't connected yet. New `js/backend.js` decides which version runs.
- **Plans for real members** (not built yet): decisions D032 to D034, spec 09 (real accounts and profiles), personal data rules and risks (`docs/personal-data.md`), a draft privacy notice (`docs/privacy-notice.md`) and draft terms of service (`docs/terms-of-service.md`). Members must be 18 or over, and the Google photo becomes their starting profile photo. D026 is superseded.
- **Licence:** `LICENSE` makes the code "all rights reserved" (D031). It can be read on GitHub but not copied or reused without permission.

### Changed
- **The "…" menu is in the top-right corner** of your own posts (D048), after the post type, on every screen width. It's no longer in the button row. Its menu has a solid background, so the post's text no longer shows through it.
- **Your activity fits one screen** (D046): Needs you (applicants to review, invitations, unread conversations, projects to mark complete), In progress (applications and projects), Your profile (how complete it is, with the next step) and a one-line drafts link that opens the drafts list. The header card and New for you are gone. Lists show a few rows, then "N more". It now ends about 610px down a 1440×900 window, where it used to run to about 1,070px.
- **See details only when there's more** (D045): updates, questions and resources show See details only when their text runs past 3 lines or they have hidden attachments. Opportunities always have it.
- **Compact Feed cards** (D044): the post box is a single box ("Share an update, question, resource or opportunity…"); the form asks for the type, so the 4 type buttons under it are gone. On cards, photos and videos sit in a frame 220px tall (tiles side by side for 2 or more), documents and other links wait in See details with a count ("2 attachments"), a resource's main link stays as one line, and text stops after 3 lines. Posts open a details view with the full text, every attachment and the comments. Opportunity photos are back on the card in the small frame.
- **Shorter opportunity cards** (D043): on an opportunity's Feed card, Apply (or Manage, Project chat, Mark complete) and See details now sit on the right of the row with likes and comments, and its attachments show on the opportunity page instead of the card. About 3 opportunities now fit where 1 and a half did on a desktop screen. Tests check the single row, no attachments on the card, attachments on the page, and attachments still on other posts.
- **Feed:** the Projects filter is now Opportunities, and "For you" puts open opportunities for your pathway first. The sidebar shows "Opportunities for you" without percentages. Sample projects are now opportunities with the new fields; the equity project is now Unpaid.
- **Connect is People only:** opportunities live in the Feed, so Connect's Projects view and its Projects and People switch are gone.
- **Matching opportunities:** with no skills field, skills count when an opportunity's text mentions them as whole words. Members open to "Equity" can see unpaid opportunities. Members to invite are picked from the pathway the opportunity is looking for.
- Projects saved in a browser before this change still load, with the new fields filled in from the old ones. A fee in another currency keeps its currency.
- **Profiles are saved in the JSON Resume shape** (D039), an open standard for CV data, with the app's own fields in a `bootcampConnect` section. Profiles saved in the old shape load without losing anything, and their projects become work to show. The profile form follows the order others see: basics, work to show, skills and currently learning, experience, education, verified experience, available for, links.
- **People suggestions** (spec 10): ranked by mutual connections, same cohort, same company, same school, the other track, skills each of you wants to learn, and newer members. Goals and stage no longer count. There's no match percentage on people any more, only reasons ("Why you might connect"). Project matching is unchanged. Tests for two-way person fit were replaced by tests for the new suggestions.
- **Dates on profiles** use British order ("Available from 1 Nov").
- **Sample members, posts and chats moved to the UK** (D002): UK cities, British spelling ("Financial modelling", "programme"), pounds, and made-up companies in place of one that looked like a real company. Profiles saved with "Financial modeling" load with the new spelling.
- **Spec 01** rewritten to describe the sign-up and log-in screen as built: layout, Google first, email behind a link in the demo, terms wording, log in and log out.
- **Log in screen** (design "Log in 1", chosen by the owner): larger title and buttons, Continue with Google, an "or" line, then a full-width Log in with email button. The demo note sits at the bottom of the panel. The sign-up screen is unchanged.
- **Sign-up screen layout** (design option A, chosen by the owner): on desktop the brand panel and the form are two full-height rounded panels side by side, so the form no longer floats in empty space. Larger title and Google button, and big square track tiles with an icon on top. The Sign up and Log in tabs are now a link ("Already a member? Log in"). The demo looks the same: its email sign-up and log in are behind a "Sign up with email instead" link under the Google button. The screen no longer shrinks on short windows (tiles, subtitle and spacing stay the same at every height).
- **Sign-up screen:** the Google button uses Google's official "G" and button colours, in light and dark mode (Google's sign-in branding guidelines). The terms checkbox now reads "I agree to the Terms of Service and have read the Privacy notice", and both links open the draft documents on GitHub until they become pages in the app. Wording follows GOV.UK style: "Create account", "Agree to the Terms of Service to continue" and a shorter demo note.
- **How we work:** the project now follows Foundation's shared software rules (D030). `CLAUDE.md` imports them; each session ends with a note in `docs/handover.md`.
- **Spec 09 reviewed** (not built yet): launching to real members now means moving to beta first, with backups, an incident plan, DPIA screening and an expert review. Log out and Delete my account must clear the member's data from the browser. The Content Security Policy allows Google's photo address so the starting photo can be copied. The draft privacy notice adds data handled outside the UK and 2 more rights. `docs/personal-data.md` adds the shared computer risk.
- **Project folder:** the project now lives in `~/code/bootcamp-connect`, next to `~/code/foundation` (D037). `CLAUDE.md` and the setup test point at `../foundation`.

### Removed
- **Cohort** (D049): the Cohort and Alumni filter in Connect, the cohort field on the profile, "Cohort 12" on member cards and profiles, and "Both in Cohort 12" in suggestions. Suggestions now give more weight to mutual connections, past companies and schools. Sample members and their text no longer mention cohorts.
- **Feed hint lines** (D048): the description under the Feed title and the line under the filters for For you.
- The old Feed sidebar cards (Opportunities for you, Your projects, Verified experience count), replaced by Your activity (D042).
- The Personal project and Community post types, their filters and composer buttons (D041). Saved posts of those types load as updates, keeping their title and text. The Demo Day and welcome sample posts are gone; a career update from Elena is new.
- From posting an opportunity: skills, number of people per role, hours per week, industry, deliverable, status, currencies other than pounds and equity (D040).
- The fit percentage on opportunity cards, the sidebar and the Manage view.

### Security
- A pre-commit check (`.githooks/pre-commit`) blocks commits containing passwords, API keys or tokens (gitleaks), or with failing tests.
- `.env` files are ignored by git, and Claude Code is stopped from reading or editing them (`.claude/settings.json`), and asks before the usual ways of skipping the pre-commit check. These rules match the wording of commands, so they catch the usual cases, not every one.
- GitHub secret scanning, push protection and Dependabot security alerts are on (D035), and CI scans the whole history for secrets (D036).
- The pre-commit check skips the tests when only Markdown files change, and warns when changes aren't staged (D036).
- Updated to Foundation 1.0 (Foundation F017): the pre-commit check blocks changes to the secret scanner's settings files (`.gitleaks.toml`, `.gitleaksignore`), renaming code to `.md` no longer skips the tests, and more `.env` file names are blocked.

### Fixed
- **Your activity on smaller windows:** the sidebar stayed in place but was taller than the window, so its lower sections (To do, Drafts) could never be reached. It now scrolls down with the page until its last section is in view, then stays there, as on X and Facebook. A short sidebar still stays under the header.
- **Accessibility:** switching between Sign up and Log in (including from links in error messages) moved keyboard focus to the top of the page, because the pressed button disappears. Focus now moves to the screen's title (WCAG 2.2, 2.4.3).
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
