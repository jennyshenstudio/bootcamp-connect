# Handover

Newest entry first. Each session adds an entry: what changed, what's next, open questions, and one thing worth learning.

## 2026-10-08 (plans for real members)
- **What changed:** planned real sign-in and profiles for real people. New decisions: Supabase free plan in London, hosted on GitHub Pages (D032); Google sign-in only for now (D033); real members in steps, private profiles first (D034). New spec 09, personal data rules (`docs/personal-data.md`) and a draft privacy notice. Nothing built yet.
- **What's next:** the owner reviews the spec, rules and privacy notice. Then the owner creates the Supabase and Google Cloud accounts (Claude to give step-by-step instructions), and Claude builds spec 09.
- **Open questions:** the tier for real members (prototype means made-up data only); terms of service still to write; a non-personal contact email; minimum age (18?); backups on the free plan; the ICO fee self-assessment.
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
