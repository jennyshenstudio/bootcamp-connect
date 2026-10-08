# Feature spec 09: real accounts and profiles on the live site

Decisions: D032 (backend and hosting), D033 (Google sign-in), D034 (real members in steps). Rules and risks: [docs/personal-data.md](../docs/personal-data.md). Privacy notice: [docs/privacy-notice.md](../docs/privacy-notice.md). Terms: [docs/terms-of-service.md](../docs/terms-of-service.md).

## Purpose
Real people can sign in to the live site with Google and save their profile to a server, so it's there on any device. This is step 1 of D034: a profile is private to its owner. Nobody else can see it yet.

## Two versions from the same code
- **Live site:** GitHub Pages, built by `npm run build` with the Supabase settings. Real accounts and profiles are stored in Supabase.
- **Demo:** the claude.ai artifact, `index.html` opened from disk, `npm start`, and any build without Supabase settings. It works exactly as now, with everything stored in the browser and sample members.

The app picks the version when it starts: live if the Supabase settings are present, demo if not.

## What members get on the live site
- **Sign-up screen:** Continue with Google, track choice and terms agreement. No email or password fields. A short line says email sign-in is coming later.
- **First sign-in:** the track and terms agreement chosen before going to Google are saved with the new account. The member lands on profile setup, with their name and photo filled in from Google.
- **Returning members:** Continue with Google takes them to the Feed. They stay signed in after closing the browser, until they log out.
- **Profile:** the same form as now. Save writes it to the server. Signing in on another device shows the same profile. The photo is resized to 256px, as now, and stored with the profile. Members can change or remove the photo from Google at any time, like any other photo.
- **Privacy notice and terms:** pages linked from the sign-up screen and the profile page. The checkbox reads "I agree to the Terms of Service and have read the Privacy notice", because members are told about privacy rather than asked to agree to it.
- **Delete my account:** on the profile page. After a confirmation, it removes the account and profile from the server straight away and returns to the sign-up screen.
- **Rest of the app:** Feed, Connect and Messages still use the sample members. Anything a member posts or sends stays on their device, and the app says so.

## How it's built
- **Supabase project** on the free plan in London (`eu-west-2`).
- **`profiles` table:** one row per member. `id` is their sign-in user ID. Columns: first name, last name, track, when they agreed to the terms, the profile (the same fields as today, including the photo), created and updated times.
- **Row-level security** is on. A signed-in member can read, add, change and delete only their own row. Nobody else, signed in or not, can read any row.
- **Google photo:** at first sign-in, the photo Google sends is copied once and resized to 256px, like an uploaded photo, so the app doesn't keep loading it from Google. If it can't be copied, the member's initials show instead.
- **Account deletion** uses a database function, `delete_my_account()`, that deletes the signed-in member's account. Their profile row is deleted with it.
- **`js/backend.js`** (new) is the only file that talks to Supabase. The rest of the app calls it. After sign-in, it loads the member's profile and keeps a copy in the browser, so matching and the other features work as before.
- **supabase-js** is self-hosted in `vendor/`, at a pinned version recorded in `vendor/README.md`.
- **Settings:** the Supabase project address and publishable key are added at build time, from `.env` locally and from GitHub Actions variables in CI. They're never typed into chat or committed. The secret key is never used by the app.
- **Content Security Policy:** the live site allows connections to the Supabase project's address and nothing else new.
- **Service worker:** never stores Supabase requests or responses.
- **Tests:** a stand-in for Supabase in `tests/` covers the live version without a network connection. A manual checklist covers the real Supabase project before launch.

## Acceptance criteria
1. With no Supabase settings, the app works exactly as today and all existing tests pass.
2. On the live site, the sign-up screen shows Continue with Google, the track choice and the terms agreement, and no email or password fields.
3. Continue with Google without a track, or without agreeing to the terms, is blocked with the same error messages as today.
4. A first sign-in creates a profile row with the track and the time the terms were agreed, then opens profile setup with the name and photo from Google filled in. If there's no Google photo, or it can't be copied, the initials show.
5. The member can replace or remove the photo from Google, and the change is saved like any other.
6. Saving the profile writes it to the server. Signing in on another browser shows the same profile.
7. A signed-in member can't read, change or delete anyone else's profile, even by calling Supabase directly with their own session. This is checked on the real project with two test accounts.
8. A signed-out visitor can't read any profile.
9. Delete my account asks for confirmation, then removes the account and profile and returns to the sign-up screen. Signing in again with the same Google account starts a new, empty profile.
10. If saving fails, the message says what went wrong and how to fix it, for example "Couldn't save your profile. Check your internet connection and try again." The form keeps the member's changes.
11. Log out ends the session. After a reload, the sign-up screen shows.
12. The privacy notice and terms of service are linked from the sign-up screen and the profile page, and can be reached by keyboard.
13. The secret key isn't in the repo, the built site or the browser, and the pre-commit secret scan passes.
14. Feed, Connect and Messages say that posts and messages stay on this device for now.
15. Every new screen and message meets WCAG 2.2 AA and the GOV.UK content style, in light and dark mode, down to 320px wide.

## Before launch: owner tasks
- Create the Supabase project (London) and a Google Cloud sign-in client. Step-by-step instructions will be given.
- Check and accept Supabase's data processing agreement.
- Do the ICO's data protection fee self-assessment, and pay the fee if required.
- Approve the privacy notice and the terms of service.
- Choose the project's tier for real members (see D034).
- Turn on GitHub Pages (D028, `docs/deployment.md`).

## Open questions
- **Contact email** for privacy questions and deletion requests. It shouldn't be a personal address, because the privacy notice is public.
- **Backups:** the free plan may not include automatic backups (to check). Until it does, the owner exports the data regularly.
- **Pausing:** free projects pause after a week with no use. Someone has to restore it, and members can't sign in until then.
