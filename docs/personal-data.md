# Personal data: rules and risks

The live site will store real people's data (D032, D034). That meets the personal data trigger in Foundation's trigger table, so these rules are written before anything is built. They apply from step 1 of D034 and are reviewed before each later step.

This is a working document, not legal advice. Get a legal check before launch.

## What we hold

| Data | Where it comes from | Why we need it | Kept until |
|---|---|---|---|
| Name, email address and Google account ID | Google, at sign-in | To sign the member in and recognise them next time | They delete their account |
| Profile photo from Google | Google, at sign-in | Copied once as the member's starting profile photo, which they can change or remove | They delete their account, or change the photo |
| Track and when they agreed to the terms | The sign-up screen | To set up the right profile, and to show they agreed | They delete their account |
| Profile: headline, location, about, links, experience, skills, projects, what they're looking for, photo | The member | To show and use their own profile | They delete their account |
| Sign-in records (time, IP address, browser) | Supabase, automatically | Security | As long as Supabase keeps them (to check) |

Feed posts, messages and connections are not stored on the server in step 1. They stay in the member's browser.

## Rules
1. **Collect only what a feature uses.** Before adding a new field, update this document and the privacy notice.
2. **Data stays in Supabase's London region.** No other service gets members' data unless the privacy notice is updated first.
3. **Row-level security on every table**, with a test or checklist item proving members can't reach each other's data.
4. **The Supabase secret key is never used by the app** and never goes in the repo, the built site, chat or logs. If it leaks, make a new one first, then investigate (Foundation section 5).
5. **No personal data in logs, error messages, tests, screenshots or commits.** Tests use made-up data only.
6. **Claude never looks at real members' data.** Debugging uses test accounts.
7. **AI stays away from member data.** On the live site, CV import uses the built-in reader in the browser, so CV text isn't sent anywhere. Sending member data to Claude or any AI service needs this document, the privacy notice and the AI trigger rules updated first.
8. **Members can delete their own account** at any time, straight away. Other requests (a copy of their data, a correction) are answered within one month.
9. **If data leaks,** the owner checks what happened and who is affected. If it could harm people, they report it to the ICO within 72 hours of finding out, and tell the people affected when the risk is high (UK GDPR articles 33 and 34).

## Risks

| What could go wrong | Who or what causes it | What we do about it |
|---|---|---|
| A member reads or changes someone else's profile | A member calling Supabase directly with their own session | Row-level security; acceptance criteria 7 and 8 in spec 09 |
| The secret key leaks | Committed or pasted by mistake | The app never uses it; pre-commit secret scan; make a new key first if it leaks |
| A harmful script steals a member's session | Malicious content shown on the page (cross-site scripting) | Content Security Policy with no inline scripts; text is escaped before display; libraries are self-hosted |
| Data is lost | A mistake, or a problem at Supabase; the free plan may have no automatic backups | The owner exports the data regularly; review before more members join |
| Members can't sign in | Supabase pauses free projects after a week with no use | The owner restores the project; check it weekly at first |
| A member writes sensitive details (health, religion and so on) in their profile | The member | The privacy notice asks them not to; delete on request |
| Under-18s sign up | Anyone with a Google account | The terms say members must be 18 or over |
| Fake or abusive accounts | Anyone with a Google account | Low impact in step 1, because nobody else can see a profile. Step 2 adds reporting and blocking |
| Supabase or Google misuse the data | Companies we rely on (data processors) | Supabase's data processing agreement; both are named in the privacy notice |
