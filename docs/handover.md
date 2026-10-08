# Handover

Newest entry first. Each session adds an entry: what changed, what's next, open questions, and one thing worth learning.

## 2026-10-08
- **What changed:** Bootcamp Connect adopted Foundation (D030). `CLAUDE.md` now imports Foundation's software rules. A pre-commit check blocks secrets and failing tests, Claude can't read `.env` files, and a new `setup` test suite checks all of this. No app files were moved or changed.
- **What's next:** try one small real task in a fresh session to test the new way of working. Note what helped and what got in the way.
- **Open questions:** the profile tests failed once on GitHub CI ("Cannot set properties of undefined (setting 'goals')") and passed when re-run, so the profile suite is flaky. Worth fixing before relying on CI to block bad changes.
- **Worth learning:** `.gitignore` only stops *new* files being tracked. If a secret file had already been committed, adding it to `.gitignore` wouldn't remove it from history. That's why "revoke first" is the rule for leaked keys.
