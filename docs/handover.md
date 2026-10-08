# Handover

Newest entry first. Each session adds an entry: what changed, what's next, open questions, and one thing worth learning.

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
