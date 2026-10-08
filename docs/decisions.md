# Decisions Log

Every product, design, and technical decision for Bootcamp Connect, newest last. Before adding or changing a feature, check it against this log; when a decision changes, add a new entry and mark the old one **Superseded** rather than deleting it.

**Status:** Accepted (built) · Accepted (not built yet) · Proposed · Superseded · Parked

## Summary

| # | Decision | Status | Affects |
| --- | --- | --- | --- |
| D001 | Purpose: experience first; the app bridges skill gaps | Accepted (built) | Everything |
| D002 | UK app: British English, pounds sterling, UK standards preferred | Accepted (built) | Copy, pay, standards |
| D003 | Prototype: static web app, no backend; data stays in each browser | Accepted (built); accounts and profiles on the live site superseded by D032 | Storage, sharing |
| D004 | Sharing: public GitHub repo + private claude.ai artifact link | Accepted (built) | Release |
| D005 | Sign-up and log in: Google (simulated) + email, track required, terms required, no LinkedIn | Accepted (built) | Auth |
| D006 | Two tracks: Software Developer and Business Developer | Accepted (built) | Profile, matching |
| D007 | One-page profile modelled on LinkedIn, Handshake, Wellfound, YC | Accepted (built) | Profile |
| D008 | CV / LinkedIn PDF import with a review step | Accepted (built) | Profile |
| D009 | Design: Apple Human Interface Guidelines with Liquid Glass, automatic dark mode | Accepted (built) | All screens |
| D010 | Navigation: Feed, Connect, Messages, Profile | Accepted (built) | Navigation |
| D011 | Sample community for demos, clearly labelled | Accepted (built) | Demo content |
| D012 | Typed feed with the same attachments on every post type | Accepted (built) | Feed |
| D013 | Pay types: Paid (fixed fee), Unpaid / volunteer, Equity / co-founder | Accepted (built) | Projects, matching |
| D014 | Matching v2: hard filters, weighted fit, two-way person fit, team suggestions | Accepted (built) | Feed, Connect |
| D015 | Project loop ending in verified experience | Accepted (built) | Projects, profile |
| D016 | Claude features run on the published page, with a fallback elsewhere | Accepted (built) | Import, chat replies |
| D017 | Code organised as `prototype.html` + `css/` + `js/` modules; build script for the artifact | Superseded by D027 | Codebase, release |
| D018 | Messages fits one screen | Accepted (built) | Messages |
| D019 | AI Coach (open coaching chat) | Superseded by D020 | AI |
| D020 | AI companion = Project Kickstart: idea → scope → gap map → team and resources → post | Accepted (not built yet) | AI, projects |
| D021 | Gap map backbone: GOV.UK phases (Discovery, Alpha, Beta, Live) | Accepted (not built yet) | AI, projects |
| D022 | Skills evaluation: evidence-based, UK government skill levels, level + confidence | Accepted (not built yet) | Profile, matching, AI |
| D023 | Skills model: three layers (roles, capabilities, tools) from UK standards | Accepted (not built yet) | Profile, matching, AI, library |
| D024 | Community library: resources attached to gap items and capabilities | Accepted (not built yet) | Library, AI |
| D025 | Decisions log, production process standards, and CLAUDE.md | Superseded by D030 | How we work |
| D026 | Backend: Supabase (London) for data, sign-in, files, and live chat; Vercel for hosting | Superseded by D032 | Storage, auth, sharing, release |
| D027 | Code fully separated: `index.html` (markup), `css/` (styles + compiled Tailwind), `js/` (scripts, no inline handlers) | Accepted (built) | Codebase, release |
| D028 | Installable web app (PWA) with a `dist/` build, CSP, offline support, CI, and GitHub Pages deploy (off until the owner turns it on) | Accepted (built) | Release, sharing, mobile |
| D029 | Native App Store and Google Play apps by wrapping the web app (Capacitor) | Proposed | Release, mobile |
| D030 | Adopt Foundation: shared software rules, pre-commit check, secrets protection | Accepted (built) | How we work, release |
| D031 | Licence: all rights reserved, no open-source licence | Accepted (built) | Release, sharing |
| D032 | Live site: Supabase free plan (London) for accounts and profiles, hosted on GitHub Pages; the demo stays as it is | Accepted (not built yet) | Storage, auth, release |
| D033 | Sign-in on the live site: Google only for now; email and password later | Accepted (not built yet) | Auth |
| D034 | Real members in steps: private profiles first, sharing later with reporting tools | Accepted (not built yet) | Everything shared, personal data |

## Entries

### D001 Purpose: experience first; the app bridges skill gaps
- **Date:** 2026-10-07, refined 2026-10-08
- **Context:** Members already have some field experience and are job-hunting. Many start projects from intuition rather than expertise.
- **Decision:** The app gives members real project experience (paid or unpaid) that becomes portfolio evidence, and helps each member find the people, resources, or learning that fill their gaps. People matching supports projects.
- **Affects:** Every feature.

### D002 UK app
- **Date:** 2026-10-07
- **Decision:** British English spelling, pounds sterling as the default currency (other currencies available), and UK standards preferred where a choice exists (e.g. GOV.UK, UK government skills framework, Skills England).
- **Affects:** Copy, pay, standards choices.

### D003 Prototype without a backend
- **Date:** 2026-10-06 · **Status:** Accepted (built). On the live site, accounts and profiles are superseded by D032; the demo still works this way.
- **Decision:** A static web app. Accounts, profiles, posts, chats, and uploads are stored in each viewer's browser (localStorage and IndexedDB). Passwords are never stored. The sign-in page says so.
- **Consequence:** Members can't see each other's real data yet; shared features use sample data. A real backend is a later decision.
- **Affects:** Storage, sharing, every data feature.

### D004 Sharing
- **Date:** 2026-10-07
- **Decision:** Code in the public GitHub repo `jennyshenstudio/bootcamp-connect` (commits use the GitHub no-reply email). The prototype is published to a private claude.ai artifact link that the owner shares deliberately. Commit, push, and republish after every change.
- **Affects:** Release process.

### D005 Sign-up and log in
- **Date:** 2026-10-06 · **Spec:** `specs/01-auth.md`
- **Decision:** Full-page sign-up / log in that fits one screen. Google (simulated) or email. Track and terms agreement are required at sign-up. LinkedIn appears only on the profile page.

### D006 Two tracks
- **Date:** 2026-10-06
- **Decision:** Every member chooses Software Developer or Business Developer. The track shapes profile suggestions and matching (complementary tracks score higher). D023 will make the profile itself differ by track.

### D007 One-page profile
- **Date:** 2026-10-07 · **Spec:** `specs/02-profile.md`
- **Decision:** Basics, links, work experience, skills (max 10), skills I want to learn (max 5), projects, what I'm looking for (goals, hours, idea status, industries, open-to pay types), live preview, strength meter, verified experience.
- **Note:** Free-text skills will be replaced by picking from the D023 skills model.

### D008 CV / LinkedIn import
- **Date:** 2026-10-07 · **Spec:** `specs/03-profile-import.md`
- **Decision:** Upload a CV or LinkedIn profile PDF; details are extracted (by Claude on the published page, otherwise a built-in reader) and shown for review before anything is added.

### D009 Design language
- **Date:** 2026-10-07
- **Decision:** Apple Human Interface Guidelines (`.claude/skills/apple-hig-designer`, MIT) with a Liquid Glass look built in pure CSS: glass on the floating navigation, frosted content cards, ambient colour background, automatic dark mode, solid fallback for Reduce Transparency. 44px touch targets, 17px body text.

### D010 Navigation
- **Date:** 2026-10-07
- **Decision:** Four sections: Feed, Connect (formerly Matchmaker), Messages, Profile. Segmented control on desktop, floating tab bar on phones. No "Signed in as" line.

### D011 Sample community
- **Date:** 2026-10-07 · **Spec:** `specs/04-connections-messages.md`
- **Decision:** Eight sample members, group chats, direct messages, and posts make the demo feel real. They are labelled as samples and are not real people. Some interactions (accepting requests, applying, replies) are simulated.

### D012 Typed feed and attachments
- **Date:** 2026-10-07 · **Spec:** `specs/05-feed.md`
- **Decision:** Post types: Project, Resource, Personal project, Support, Community. Every type supports photos, videos, documents, and links (up to 6). Filters and a "For you" ranking.

### D013 Pay types
- **Date:** 2026-10-07
- **Decision:** Paid (fixed fee, GBP default with EUR/USD/CAD/AUD), Unpaid / volunteer (for portfolio), Equity / co-founder. Members choose which they're open to; this is a hard filter in matching.

### D014 Matching v2
- **Date:** 2026-10-07 · **Spec:** `specs/06-matching.md`
- **Decision:** Projects: hard filters (pay type, hours, setting, track) then weighted fit (skill 45, growth 10, commitment 15, industry 10, goal 10, fairness 10) with reasons. People: two-way fit (geometric mean of both directions) with a fairness boost. Team suggestions: CATME-style, scarcest role first.
- **Note:** Will use the D023 skills model and D022 evidence once built.

### D015 Project loop and verified experience
- **Date:** 2026-10-07 · **Spec:** `specs/07-project-loop.md`
- **Decision:** Apply → team → automatic project chat → mark complete → teammate ratings and skill endorsements → verified experience on the profile.

### D016 Claude-powered features
- **Date:** 2026-10-07
- **Decision:** CV extraction and chat replies use Claude through the artifact's `sample` capability on the published page (each viewer is asked first and uses their own account). Every Claude feature has a working fallback when Claude isn't available.

### D017 Code organisation and release build
- **Date:** 2026-10-07 · **Status:** Superseded by D027 (2026-10-08)
- **Decision (original):** `prototype.html` holds markup; `css/app.css` holds styles; `js/` holds one plain script per feature, loaded in a fixed order. `scripts/build_artifact.py` builds the artifact copy.

### D018 Messages fits one screen
- **Date:** 2026-10-07
- **Decision:** The Messages page never scrolls; the conversation list and thread scroll inside their panels. Phone conversations open full screen.

### D019 AI Coach
- **Date:** 2026-10-07 · **Status:** Superseded by D020
- **Decision (original):** An open coaching chat with six stages and a playbook. Replaced by a narrower, outcome-focused design.

### D020 Project Kickstart
- **Date:** 2026-10-08 · **Status:** Accepted (not built yet)
- **Decision:** The AI companion's one job is to take a member from idea to an actionable project: concept → scope → gap map → team and resources → Project post. Not an "ask anything" bot. Expertise lives in mentor-reviewed checklists and the curated library, not in the model; answers cite sources.

### D021 Gap map backbone: GOV.UK phases
- **Date:** 2026-10-08 · **Status:** Accepted (not built yet)
- **Decision:** Discovery → Alpha → Beta → Live. Checklist items come from named frameworks: The Mom Test and Jobs-to-be-Done (users), Lean Canvas (business model), user stories and Definition of Done (requirements), GitHub community standards and Twelve-Factor (repo and config), OWASP Top 10 / ASVS level 1 (security), WCAG 2.2 (accessibility), production readiness and UK GDPR (going live).

### D022 Skills evaluation
- **Date:** 2026-10-08 · **Status:** Accepted (not built yet)
- **Context:** Self-assessment alone is unreliable (Davis et al. 2006; Dunning–Kruger). SFIA assesses experience with evidence; structured interviews and job-knowledge tests predict performance best (Sackett et al. 2022).
- **Decision:** Assess only the capabilities a project needs, on the UK government framework's four levels (Awareness, Working, Practitioner, Expert), using an evidence ladder: claimed → described (structured questions) → shown (artefacts) → peer-verified (endorsements, completed projects). Show level + confidence; members can contest. Gap = required level minus estimated level, weighted by phase.
- **Open questions:** when assessment happens; who can see levels; who reviews the AI's scoring.

### D023 Skills model: three layers
- **Date:** 2026-10-08 · **Status:** Accepted (not built yet)
- **Decision:** One shared model used by every feature:
  1. **Roles** in plain English (what people browse), from UK government framework role names and Skills England job titles, e.g. "iOS app developer", "Digital marketer".
  2. **Capabilities** with the four levels, from the UK government framework (tech, product, design, data) and Skills England standards (business roles).
  3. **Tools and technologies**, a curated list linked to capabilities (e.g. Swift, Kotlin, React, n8n, Excel, HubSpot), with names aligned to Lightcast Open Skills where possible.
- Profiles differ by track but use the same model: developers lead with tools and capabilities; business members lead with roles, capabilities, and sectors. Viewing the other track shows plain-English roles first, with technical details on request. Members pick from lists, not free text.
- **Rejected:** SFIA and the Lightcast API inside the product, because both need paid commercial licences.
- **Open question:** one main role plus optional secondary roles, or several equal roles.

### D024 Community library
- **Date:** 2026-10-08 · **Status:** Accepted (not built yet)
- **Decision:** Members share their best resources (videos, documents, links). Each is tagged with D023 capabilities and tools so it appears on the matching gap-map items, credited to its creator with a link. Summaries and links only; no copies of paid content.

### D025 Decisions log, production process, CLAUDE.md
- **Date:** 2026-10-08 · **Status:** Superseded by D030
- **Decision:** Every session follows `CLAUDE.md`. Standards: WCAG 2.2 AA (accessibility), GOV.UK content style (wording), Apple HIG (design, D009), and this log for every decision. Every change comes with a browser test, and `npm test` must pass before committing. Changes go straight to `main` and the shared prototype is republished.
- **Follow-up:** audit the current prototype against WCAG 2.2 AA and GOV.UK content style; adopting a standard doesn't mean the app already meets it.
- **Affects:** How we work.

### D026 Backend: Supabase, hosted on Vercel
- **Date:** 2026-10-08 · **Status:** Superseded by D032 (was parked at the owner's request, 2026-10-08)
- **Context:** D003 keeps all data in each browser, so testers can't see each other's posts, messages, or projects.
- **Decision:** Supabase in its London region (UK GDPR) for the Postgres database, real sign-in (email and Google), file storage for attachments, and realtime updates for Messages, with row-level security on every table. The app is hosted on Vercel, because the claude.ai artifact link is not expected to reach an outside database. The artifact stays as a demo with sample data.
- **Rejected:** Vercel's own storage, which is third-party add-ons (Neon, Upstash) and would still need separate sign-in, file storage, and realtime.
- **Supersedes when accepted:** D003.
- **Affects:** Storage, auth, sharing, release.

### D027 Code fully separated into HTML, CSS and JavaScript; compiled Tailwind
- **Date:** 2026-10-08 · **Status:** Accepted (built) · **Supersedes:** D017 · **Spec:** `specs/08-installable-app.md`
- **Context:** `prototype.html` still held the Tailwind configuration in an inline script, the icon sprite, 47 inline event handlers and 2 style attributes, and the `js/` files wrote about 70 more inline handlers. Tailwind came from `cdn.tailwindcss.com`, which Tailwind says not to use in production: it compiles CSS in the browser on every visit and needs a connection.
- **Decision:**
  - `prototype.html` is renamed `index.html`, so any web host serves it at the site's address. It holds markup only.
  - Tailwind 3.4.17 (the version the CDN ran) is compiled ahead of time: `tailwind.config.js` + `src/styles/tailwind.css` → `css/tailwind.css` with `npm run build:css`. The compiled file is committed so `index.html` still opens straight from disk. It loads after `css/app.css`, matching the order the CDN produced, so utilities still override component defaults.
  - Inline handlers are replaced by `data-on-click="fn('arg')"` attributes (also `-submit`, `-change`, `-input`, `-keydown`), run by `js/actions.js`. It reads only plain function calls with literal arguments or `this`/`event` paths, never evaluates code, and keeps the old order and `stopPropagation` behaviour.
  - The SVG icon sprite moves to `js/icons.js`; the two style attributes become CSS classes.
  - The archived `prototype-v1.html` moves to `legacy/prototype-v1/` with its own CSS, JS and compiled Tailwind.
  - Page language is `en-GB` (D002).
- **Checked by:** `tests/structure.test.js` (no inline code; every class on screen has CSS) and a pixel comparison of 8 screens against the CDN-era layout, which matched.
- **Consequence:** class names must be written in full in `index.html` or `js/` (never built from pieces), and `npm run build:css` must be run after adding new classes. CI fails if the committed CSS is missing classes (`scripts/check-css.mjs`).
- **Fixed alongside:** the desktop sign-up brand panel overflowed short laptop screens (1280×650) when the Apple system font wasn't available (Windows, Linux). On screens 700px tall or less its padding and headline now shrink.
- **Affects:** Codebase, release.

### D028 Installable web app (PWA), production build and deployment
- **Date:** 2026-10-08 · **Status:** Accepted (built; the Pages deploy is off until the owner turns it on) · **Spec:** `specs/08-installable-app.md`
- **Context:** The app needs to be ready to publish as a web app and as a phone app from the GitHub repository. D003 (no backend) still holds and D026 (Supabase + Vercel) is still parked.
- **Decision:**
  - **Mobile app = installable web app (PWA).** `manifest.webmanifest`, app icons (`assets/icons/`, including maskable and Apple touch icons) and home-screen tags let members add it to iPhone, Android and desktop. A service worker (`sw.js`) keeps the app's files so it opens offline; pages are fetched network first so new versions show straight away.
  - **Production build:** `npm run build` writes `dist/`, a plain static site that any host can serve (GitHub Pages, Netlify, Vercel, a bucket). The build adds a Content Security Policy (no inline script; only cdnjs as an outside script source, for Mammoth) and a version stamp that turns the service worker on. The service worker is never used from disk, from `npm start`, or on the claude.ai artifact.
  - **pdf.js is self-hosted** in `vendor/` (official 3.11.174 release) so PDFs work offline and under the CSP, and it always runs with `isEvalSupported: false` (CVE-2024-4367). Mammoth stays on cdnjs for now (`vendor/README.md`).
  - **CI** (`.github/workflows/ci.yml`) runs the whole test suite on every push and pull request, against the source and against `dist/`.
  - **GitHub Pages deploy** (`.github/workflows/deploy-pages.yml`) publishes `dist/` after CI passes on `main`, but only once the owner turns it on (Pages source set to GitHub Actions and the `DEPLOY_PAGES` variable set to `true`), because a Pages site is public, which changes how the app is shared (D004). It can also be run by hand.
  - **Local tools without extra dependencies:** `npm start` (source at http://localhost:8080), `npm run preview` (built site), `npm run test:dist`.
  - The claude.ai artifact build (`npm run build:artifact`) now uses `index.html`, includes the compiled CSS and pdf.js, and leaves out the install features.
- **Rejected:** Workbox and other service worker libraries (one small hand-written worker is enough while there's no backend); Vercel for now (D026 is parked and Pages needs no new account); committing `dist/` (it's built in CI).
- **Open questions:** whether and when to make the app public on Pages (D004); a custom domain.
- **Affects:** Release, sharing, mobile.

### D029 Native app store apps
- **Date:** 2026-10-08 · **Status:** Proposed
- **Context:** The installable web app (D028) covers phones without the App Store or Google Play. Store listings need native wrappers, paid developer accounts (Apple charges yearly, Google once) and store review.
- **Proposal:** When store presence is needed, wrap `dist/` with Capacitor (iOS and Android projects in the repo, built from the same web code). Do this after D026, because a store app with data only on one device would disappoint members.
- **Affects:** Release, mobile.

### D030 Adopt Foundation
- **Date:** 2026-10-08 · **Status:** Accepted (built)
- **Context:** D025 set this project's way of working inside its own `CLAUDE.md`. The owner has since written Foundation, a shared way of working for all their software projects, kept in its own repo next to this one. Bootcamp Connect is its first pilot.
- **Decision:** `CLAUDE.md` imports Foundation's software rules (`@../Foundation/software.md`): session workflow, handover note (`docs/handover.md`), review checklist, secrets rules and the trigger table. Tier: prototype. The project's own standards stay as they were: WCAG 2.2 AA, GOV.UK content style, Apple HIG (D009), no inline code (D027), this decisions log, a test with every change, tests passing before committing, `CHANGELOG.md`, commits straight to `main`, and republishing the prototype after app changes. A pre-commit check (`.githooks/pre-commit`, copied from Foundation) blocks any commit containing a secret or with failing tests. `.claude/settings.json` stops Claude reading `.env` files, and `.gitignore` excludes them. No files are moved.
- **Supersedes:** D025.
- **Affects:** How we work, release.

### D031 Licence: all rights reserved
- **Date:** 2026-10-08 · **Status:** Accepted (built)
- **Context:** The repo is public (D004) but had no licence. The owner plans to make Bootcamp Connect a public app.
- **Decision:** Keep the code as "all rights reserved". `LICENSE` says the code may be read but not copied, changed or reused without written permission. `package.json` says `"license": "UNLICENSED"`, npm's term for code that isn't open source. Third-party code keeps its own licence.
- **Rejected:** MIT and other open-source licences, because they would let anyone legally launch a copy of the app.
- **Open questions:** whether to make the repo private (GitHub Pages from a private repo may need a paid plan); a legal check before launch.
- **Affects:** Release, sharing.

### D032 Live site: Supabase free plan for accounts and profiles, hosted on GitHub Pages
- **Date:** 2026-10-08 · **Status:** Accepted (not built yet) · **Spec:** `specs/09-real-accounts.md`
- **Context:** The owner wants real people to use the app, built with free services unless something costs money because it's essential. D026 (Supabase and Vercel) was parked. Prices checked on 2026-10-08 from each provider's own pricing pages.
- **Decision:**
  - **Two versions from the same code.** The **live site** has real accounts and profiles stored in Supabase. The **demo** (claude.ai artifact, `index.html` from disk, `npm start`) works as now, with data in the browser and sample members. The app picks the live version only when Supabase settings are present.
  - **Supabase free plan, London region (`eu-west-2`)** for sign-in and the profiles table, with row-level security on every table. The free plan includes 50,000 monthly active users, a 500 MB database and 1 GB of files. Free projects pause after a week with no use.
  - **Hosting on GitHub Pages**, already set up in D028. It's free while the repo is public.
  - **Settings:** the Supabase project address and publishable key are supplied when the site is built: from `.env` locally, and from GitHub Actions variables in CI. Supabase says the publishable key is safe to publish, because row-level security decides what it can reach. The secret key is never used by the app and never stored in the repo.
  - **supabase-js is self-hosted** in `vendor/`, like pdf.js, so it works under the Content Security Policy.
- **Rejected:** Fly.io (no free plan for new accounts, managed Postgres from $38 a month, no built-in sign-in); Vercel Hobby (free, but for non-commercial use only).
- **Supersedes:** D026, and D003 for accounts and profiles on the live site.
- **Affects:** Storage, auth, release.

### D033 Sign-in on the live site: Google only for now
- **Date:** 2026-10-08 · **Status:** Accepted (not built yet) · **Spec:** `specs/09-real-accounts.md`
- **Context:** Email and password sign-in needs an email service for confirmations and password resets. Supabase's built-in email is for testing only (2 emails an hour, only to the project's own team). A free email service would most likely need the owner's own domain, which costs money.
- **Decision:** The live site offers **Continue with Google** only. Track choice and terms agreement are still required (D005). The email and password fields are hidden on the live site, with a line saying email sign-in is coming. The demo keeps both.
- **Later:** add email sign-in once there's a domain and a free email service (such as Resend).
- **Amends:** D005, on the live site only.
- **Affects:** Auth.

### D034 Real members in steps
- **Date:** 2026-10-08 · **Status:** Accepted (not built yet)
- **Context:** Storing real people's data meets the personal data trigger (UK GDPR). Letting members see each other's content meets the online safety trigger (Online Safety Act 2023). Doing both at once means a lot of legal and safety work before anyone can use the app.
- **Decision:**
  - **Step 1:** real members sign in and save their own profile. Nobody else can see it. Feed, Connect and Messages keep using sample members, and anything a member posts stays on their device.
  - **Step 2:** profiles and posts become visible to other members, together with ways to report, block and remove content.
  - The rules and risks for personal data are written in `docs/personal-data.md` before step 1 is built, and reviewed before each step.
- **Open questions:** Foundation's prototype tier means made-up data only, so real members need the owner to choose a higher tier, with the rules that come with it.
- **Affects:** Everything shared, personal data.

