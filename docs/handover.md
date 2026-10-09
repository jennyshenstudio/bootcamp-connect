# Handover

Newest entry first. Each session adds an entry: what changed, what's next, open questions, and one thing worth learning.

## 2026-10-09 (sign-up layout A)
- **What changed:** explored 3 sign-up designs on a design canvas (https://claude.ai/artifact/2HhRhjhpBowxszXKbuJkQU): A glass refined, B clean minimal, C bold in two steps. The owner chose A, which keeps the Apple style (D009), so no new decision. Built it: two full-height panels on desktop, big square track tiles, larger Google button, and a "Log in" link instead of tabs. At first I squeezed the demo (which also has the email form) back into compact tiles to fit one screen, without asking; the owner rightly objected. Fixed: the demo now matches design A, with email behind a "Sign up with email instead" link. Shared prototype republished.
- **What's next:** profile setup. The phone layout of the sign-up screen can be polished later (content sits in the middle; the mockup puts the Google button at the bottom).
- **Open questions:** "Business Developer" stays for now; the owner may rename the track later. Ideas considered and not chosen: "Product & Growth", "Business & Product".
- **Worth learning:** when an approved design clashes with a requirement, stop and ask rather than compromising it quietly. Also check the version people will actually see (here, the demo on the shared prototype), not just the one you tested.

## 2026-10-09 (live sign-up screen)
- **What changed:** the sign-up and log-in screen has a live-site layout (spec 09, D033): Continue with Google only, track and terms first, and a note on what Google shares. It shows when `isLiveSite()` in the new `js/backend.js` finds Supabase settings, so the demo is unchanged. The Google button now follows Google's branding guidelines (official "G", set colours in light and dark mode). The terms checkbox uses spec 09's wording, and its links open the draft documents on GitHub for now. Shared prototype republished (version 13).
- **What's next:** profile setup, the owner's next priority. Later in spec 09: connect real Google sign-in through Supabase (needs the owner's Supabase and Google Cloud accounts), and turn the terms and privacy notice into pages in the app.
- **Open questions:** linking the terms to GitHub is a stopgap; the drafts' "[owner to…]" notes are visible there. The live layout can only be seen in tests or screenshots until Supabase settings exist.
- **Worth learning:** a longer label can push a carefully fitted screen past the bottom. Tests that check "fits one screen" caught it, and a shorter note fixed it without shrinking text.

## 2026-10-09 (spec 09 review)
- **What changed:** reviewed spec 09 with the owner and updated it, the draft privacy notice and the personal data rules. Launching to real members now needs a move to beta first (backups with a tested restore, an incident plan, DPIA screening, expert review). Log out and Delete my account must clear the browser copy. The Content Security Policy allows Google's photo address. The privacy notice mentions data handled outside the UK and the rights to limit use and to take your data elsewhere. Documents only; no app changes.
- **What's next:** the owner answers the decisions below. Then the owner creates the Supabase and Google Cloud accounts (Claude to give step-by-step instructions), and Claude builds spec 09 in alpha, with made-up test accounts.
- **Open questions:** decided since: backups by hand, free plans until the owner decides whether the app makes money, and the 2-year deletion dropped. Still open, all before beta: a contact email (ideally on the owner's own domain later); whose name goes in the privacy notice (the owner, as there's no company); the ICO fee (£52 a year for small organisations, checked 2026-10-09). Test Google accounts aren't needed until the real Supabase project is checked before launch. Name ideas: echo440.dsp and sonar440.dsp, or cc.echo440 and cc.sonar440 (echo440 and sonar440 are taken).
- **Worth learning:** a Content Security Policy blocks anything it doesn't list, including features the spec relies on. Check every outside address a feature needs, such as the Google photo here.

## 2026-10-09 (Foundation 1.0)
- **What changed:** copied Foundation 1.0's pre-commit check and `.claude/settings.json` into this project (Foundation F017). The check now blocks changes to the secret scanner's settings files, and renaming code to `.md` no longer skips the tests. More `.env` names are blocked. The changelog no longer says skipping the check needs the owner's approval, because it only asks for the usual ways.
- **What's next:** back to building Bootcamp Connect. Foundation is paused and changes only when real work here shows a problem.
- **Open questions:** the owner doesn't use Time Machine, and archives finished work to an external drive when Claude prompts. The old `~/Documents/Shen-1` folder is already gone.
- **Worth learning:** a project's copy of the check doesn't update itself. When Foundation's check changes, copy it into each project.

## 2026-10-09 (move to ~/code)
- **What changed:** the project now lives in `~/code/bootcamp-connect`, a fresh copy from GitHub (D037, Foundation F015). `CLAUDE.md` and the setup test point at `../foundation`.
- **What's next:** work from the new folder. After a week, and once Time Machine has a backup, delete `~/Documents/Shen-1/Bootcamp Connect`.
- **Open questions:** none new.
- **Worth learning:** a fresh copy from GitHub is also a restore test: if anything were missing from GitHub, the new copy would show it.

## 2026-10-08 (Foundation review fixes)
- **What changed:** stage set to alpha (D036). CI now scans the whole history for secrets. Claude can't read or edit `.env` files, and skipping the pre-commit check needs the owner's approval. The pre-commit check skips tests for Markdown-only commits.
- **What's next:** decide when to move to beta, and write the beta rules first (personal data, online safety, backups, expert review).
- **Open questions:** none new.
- **Worth learning:** "alpha, beta, live" comes from the GOV.UK Service Manual. Each stage is about who uses the service, not how finished the code is.

## 2026-10-08 (GitHub security)
- **What changed:** GitHub secret scanning, push protection and Dependabot security alerts and updates switched on (D035). No secrets found.
- **What's next:** keep an eye on the `extract-zip` alert (test tools only, no fix yet).
- **Open questions:** none.
- **Worth learning:** "development" dependencies are only used to build and test the app, not shipped to users, so a weakness in one is usually lower risk.

## 2026-10-08 (plans for real members)
- **What changed:** planned real sign-in and profiles for real people. New decisions: Supabase free plan in London, hosted on GitHub Pages (D032); Google sign-in only for now (D033); real members in steps, private profiles first (D034). New spec 09, personal data rules (`docs/personal-data.md`) and a draft privacy notice. Nothing built yet.
- **What's next:** the owner reviews the spec, rules and privacy notice. Then the owner creates the Supabase and Google Cloud accounts (Claude to give step-by-step instructions), and Claude builds spec 09.
- **Open questions:** the tier for real members (prototype means made-up data only); a contact email and test Google accounts; backups on the free plan; the ICO fee self-assessment. Since decided: members must be 18 or over; the Google photo becomes the starting profile photo; draft terms of service written (`docs/terms-of-service.md`).
- **Worth learning:** "free" plans often have catches that matter more than the price. Vercel's free plan bans commercial use, Fly.io has no free plan for new accounts any more, and Supabase's built-in email can only send 2 emails an hour.

## 2026-10-08 (licence)
- **What changed:** added an "all rights reserved" licence (D031). The code stays public to read, but nobody may copy or reuse it without permission. Also noted in the README, `package.json` and the change log.
- **What's next:** the owner wants to make this a public app. That meets several Foundation triggers: real people's data (UK GDPR), users seeing each other's posts (Online Safety Act) and running a live service (production tier). Plan those before launch.
- **Open questions:** make the repo private? (GitHub Pages from a private repo may need a paid plan; check current pricing.) A legal check before launch.
- **Worth learning:** code with no licence is "all rights reserved" by default. A licence file doesn't add protection; it makes the owner's intent clear.

## 2026-10-08 (later)
- **What changed:** fixed the flaky profile test. The cause was a click landing while the page was still smooth-scrolling to an error message. Tests now wait for scrolling to stop first. Only test files changed, not the app.
- **What's next:** keep an eye on CI. If the profile suite fails again, the scroll timing wasn't the only cause.
- **Open questions:** none.
- **Worth learning:** the first failure in a test run is usually the real one. Later failures, like the "goals" crash here, are often just knock-on effects of it.

## 2026-10-08
- **What changed:** Bootcamp Connect adopted Foundation (D030). `CLAUDE.md` now imports Foundation's software rules. A pre-commit check blocks secrets and failing tests, Claude can't read `.env` files, and a new `setup` test suite checks all of this. No app files were moved or changed.
- **What's next:** try one small real task in a fresh session to test the new way of working. Note what helped and what got in the way.
- **Open questions:** the profile tests failed once on GitHub CI ("Cannot set properties of undefined (setting 'goals')") and passed when re-run, so the profile suite is flaky. Worth fixing before relying on CI to block bad changes.
- **Worth learning:** `.gitignore` only stops *new* files being tracked. If a secret file had already been committed, adding it to `.gitignore` wouldn't remove it from history. That's why "revoke first" is the rule for leaked keys.
