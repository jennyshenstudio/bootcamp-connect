# Feature spec 11: profile and work to show

**Status:** version 1, approved and built 2026-10-09 (demo only). Tweaks go in version 2. Decision: D039. Where this spec differs from spec 02, this spec wins. Networking, stage and suggestions: [spec 10](10-networking.md).

## Purpose
A list of skills says what someone claims to know, not what they've done or at what level. The profile is built around **work to show**: real projects broken down into the problem, the member's role, what they did and what happened, with facts that show the level and evidence that backs it up. AI helps members write it up, and the member approves every word.

## Where it applies
The demo, with made-up members (alpha, D036). Before the live site:
- `docs/personal-data.md` and the privacy notice must list the new fields (cohort, education, screenshots, links, teammates).
- Tagging teammates and showing work to other members is user-to-user content, so it waits for step 2 of D034 (online safety).
- The AI helper meets the AI features trigger: test sets, a fixed model version and no personal data in AI logs, written before it reaches real members.

## Profile, in the order others see it
1. **Top of the profile:** photo, name, headline, **currently working on** (one line, up to 100 characters, optional), track, stage with its evidence line (spec 10), cohort, location and work setting. For the viewer only: mutual connections and up to 3 reasons (spec 10).
2. **Work to show:** see below.
3. **About:** up to 500 characters, as now.
4. **Skills** (proven or listed, see below) and **Currently learning** (today's "skills I want to learn", up to 5).
5. **Experience:** as now.
6. **Education:** new. School, college, university or bootcamp, course, start and end years. Up to 3 entries, plus the bootcamp cohort (current cohort, or alumni of a cohort number).
7. **Verified experience:** finished projects and endorsements (spec 07), as now.
8. **Available for:** today's "What I'm looking for": open to (paid, unpaid or equity), goals, hours per week, available from, industries.
9. **Links:** LinkedIn, GitHub, website.

At the bottom of every profile, and on the profile editing page: "Members can use AI to help write their profiles."

## Work to show
Replaces "Projects / featured work". Up to 6 pieces. The member sets the order. The first 3 show on the profile, and **Show all work** opens the rest.

**Each piece has:**
- **Title**, a **link** to the live site, app or document (optional), a **code link** such as GitHub (optional), and a **screenshot** (optional, resized like the profile photo).
- **Guided questions**, each up to 300 characters, worded for the member's track:

| Question | Software Developer hint | Business Developer hint |
|---|---|---|
| What was the problem? | Who had it, and why it mattered | The opportunity or customer problem |
| What was your role? | What you were responsible for | What you were responsible for |
| What did you do? | What you designed and built, and the main choices you made | The research, plans, sales or numbers you worked on |
| What happened? | Is it live? Users, speed, feedback | Results, with numbers where you have them |
| What would you do differently? | Optional | Optional |

- **Facts**, picked from lists, which make the facts line: role (Led, Contributed, Supported), team size (Just me, 2 to 3, 4 to 6, 7 or more), how long (Under a month, 1 to 3 months, 3 to 6 months, Over 6 months), and how far it got (Idea, Prototype, Live, Earning money). For example: "Led · team of 4 · 1 to 3 months · Live".
- **Skills used**, picked from the member's skills, or added to them.
- **Built with:** tools and technologies, including AI tools such as Claude Code or Cursor, filled in by the member.
- **Teammates:** other members tagged on the work (see below).

**On the profile,** each piece shows its title, screenshot, facts line and a 2-line summary, which the member can edit. **Read more** opens the full case study with the answers, links, skills, Built with and teammates.

**Ordered for the viewer** (D023). Everyone can see everything:
- **Business Developer viewers:** the live link and screenshot come first. The code link and Built with sit in a **Technical details** section that starts closed.
- **Software Developer viewers:** the code link and Built with show beside each piece.

## Teammates
- A member can tag other members on a piece of work. Each tagged member gets a request to confirm it.
- When a teammate confirms, the piece shows "Confirmed by [name]", and appears on the teammate's profile too, where they add their own role and what they did.
- A teammate can decline, or remove themselves later. The piece then stays on the author's profile without them.
- Demo: sample members confirm after a moment.

## Skills proven by work
- A skill used in at least one piece of work shows as **proven**, with the number of pieces. Selecting it shows those pieces.
- A skill on that work confirmed by a teammate, or in verified experience (spec 07), shows as **confirmed**.
- Other skills show as **listed**.
- Proven and confirmed are shown in words as well as styling, not by colour alone.

## AI helper (D016)
On the published claude.ai page, after the viewer allows it:
- **Write it with Claude:** Claude asks the guided questions one at a time, like an interviewer, with follow-ups ("You said it went live: about how many people use it?"). It drafts the answers, facts, summary and skills used into the form. Nothing is saved until the member has checked it and pressed Save.
- **From a code link:** Claude reads the public repository's README and dependency files (such as `package.json`) and suggests skills used, Built with, and a draft "What did you do?".
- **From a document:** Claude reads an uploaded PDF or Word file, such as a pitch deck or report, and suggests skills used and a draft.
- **From a CV import** (spec 03): projects found on the CV can become draft pieces of work.
- Every suggestion is marked "Suggested" until the member accepts or removes it.

**Elsewhere** (the demo outside claude.ai, and tests): the same questions as a plain form, with no suggestions.

**Still to check on the published page:** whether it can read a GitHub repository. The app tries, and if it can't (or the repository is private), it asks the member to paste the README or dependency list instead, and Claude works from that. Screenshots are resized to at most 960px wide before saving.

**No AI badge** on people or write-ups (D039). AI drafting is open to everyone, can't be detected reliably, and a badge would penalise members who rely on it for good reasons, such as dyslexia or writing in a second language. Built with and the app-wide note cover openness.

## Data shape
- Profile data follows the shape of **JSON Resume**, an open standard for CV data (basics, work, education, projects, skills, interests). Fields JSON Resume doesn't have, such as track, stage, cohort, the guided answers, facts, Built with and teammates, are added in a clearly named extra section.
- Profiles saved in today's format are converted when they load, as "Paid gig" was.
- Later, on the live site: members can download their profile as a JSON Resume file.

## Demo community
The generated members (spec 10) have 1 to 3 pieces of work each, with every field filled in, a mix of facts lines, some teammates confirmed between members, and some AI tools in Built with.

## Acceptance criteria
1. The profile shows its sections in the order above. Currently working on, cohort and education can be added, are saved, and show on the profile.
2. A piece of work can be added with all its fields. It shows on the profile with its title, screenshot, facts line and summary, and Read more shows the full case study.
3. The guided questions and hints match the member's track.
4. Up to 6 pieces can be added. The first 3 show on the profile in the member's order, and Show all work shows the rest.
5. A Business Developer viewer sees the live link and screenshot first, with the code link and Built with in a closed Technical details section. A Software Developer viewer sees them beside each piece.
6. Tagging a member sends them a request. Once they confirm, the piece shows "Confirmed by [name]" and appears on their profile.
7. Skills show as proven, confirmed or listed, in words, and selecting a proven skill shows the work behind it.
8. On the published page, Write it with Claude drafts the form from a conversation, and nothing is saved until the member presses Save. Elsewhere, the form works without AI.
9. Suggestions from a code link or document are marked Suggested until the member accepts them.
10. "Members can use AI to help write their profiles" shows on every profile and on the editing page. No profile or write-up carries an AI badge.
11. A profile saved in today's format loads without losing anything.
12. Everything new works by keyboard, at 320px wide, and in light and dark mode, following the project's accessibility standards. All tests pass.
