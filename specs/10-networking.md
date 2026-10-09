# Feature spec 10: networking, finding and connecting with members

**Status:** version 1, approved and built 2026-10-09 (demo only). Tweaks go in version 2. Decision: D038. Profile changes: spec 11. Where this spec differs from specs 02, 04 and 06, this spec wins.

## Purpose
Bootcamp Connect is a networking app. Members connect for general networking and to find people to work on projects with. They find each other through mutual connections, shared context (cohort, past companies, schools) and what's in their profiles. Each member can see what stage someone is at before getting in touch.

## Where it applies
The demo only, with made-up members (alpha, D036). On the live site, members can't see each other until step 2 of D034, which needs the online safety rules (reporting and blocking) written first. Before the live site collects the new profile fields, `docs/personal-data.md` and the privacy notice must list them.

## Demo community
- About 100 made-up members: the current cohort (Cohort 12, 25 members including the signed-in member) and alumni from Cohorts 9, 10 and 11 (25 each). About half on each track.
- The 8 existing sample members stay in Cohort 12, with their posts and chats, and move to the UK.
- All members live in the UK, and their profiles use British spelling and pounds (D002). Names, companies and schools are made up.
- Each member has everything today's sample members have, plus a stage, cohort, education, past companies (some shared between members), and 1 to 3 pieces of work to show as described in spec 11, some with teammates tagged.
- Members are connected to each other, more often within their own cohort, so mutual connections are realistic.
- A script with a fixed starting value generates the community, so it's the same every time and is never edited by hand.
- A new demo account starts connected to the same 5 members as now, and has 2 connection requests waiting.

## Connect tab: People view
- **Invitations:** requests sent to you, at the top when there are any. Each shows the sender, their note, **Accept** and **Ignore**.
- **Suggested for you:** 5 members you're not connected to, ranked by the suggestion score, each with up to 2 reasons.
- **All members:** everyone, with:
  - search by name, skill, company or school
  - filters for track, stage, cohort (current cohort, alumni, or a cohort number) and connection (all, connected, not connected), which can be combined, with a way to clear them
  - the suggestion score setting the order
  - the first 24 shown, with **Show more** for the rest
- **Each card:** photo, name, headline, track, stage, cohort, number of mutual connections, top skills, the top reason (for example "4 mutual connections"), and **Connect**, **Requested** or **Message**. No match percentage.

## Connecting
- Members can open anyone's profile before connecting.
- **Connect** opens a short dialog with an optional note of up to 300 characters, then **Send request**.
- A request shows as **Requested** until it's answered. The sender can withdraw it.
- Demo: most members accept after a moment. Some leave the request waiting. The sender is never told about a decline, as on LinkedIn.
- Messages work only between connections, as now.

## Stage
- Each member picks one stage, worded for their track:
  - **Software Developer:** Learning (in bootcamp), Junior (under 2 years), Mid-level (2 to 5 years), Senior (5 years or more)
  - **Business Developer:** Exploring an idea, Running a business (under a year), Running a business (1 to 3 years), Experienced (3 years or more)
- Beside the stage, the profile shows evidence worked out by the app: years of work experience (not counting the bootcamp), cohort or alumni year, and number of finished projects. For example: "Junior · 2 years' experience · Cohort 9 alumni · 3 finished projects".
- Stage is a filter. It doesn't change anyone's suggestion score, so newer members aren't pushed down the list.
- A member without a stage shows no stage, and appears only when the stage filter is off.

## Profile
The profile changes (cohort, education, work to show, and ordering the profile for the viewer) are in [spec 11](11-profile-work-to-show.md). Goals ("What I'm looking for") stay on the profile and in project matching, but no longer change people suggestions.

## Suggestion score (replaces "Person ↔ person fit" in spec 06)
Worked out for each member you're not connected to, from 0 to 100. It sets the order and picks the reasons; members never see the number.

| Part | Points | Reason shown |
|---|---|---|
| Mutual connections (5 or more gets full points) | 30 | "4 mutual connections" |
| Same cohort | 15 | "Both in Cohort 12" |
| Worked at the same company | 10 | "Both worked at Paylane" |
| Same school or university | 5 | "Both studied at the University of Leeds" |
| Other track | 10 | "Business skills that complement your development skills" |
| They have skills you want to learn | 10 | "Can help you learn SQL" |
| You have skills they want to learn | 10 | "You can help them with React" |
| Fewer than 8 connections | 10 | "Newer to the community" |

- Not used: goals, values, working style and stage.
- Project matching ("Project → member fit" in spec 06) doesn't change: pay types and hours still decide whether a project fits.

## Acceptance criteria
1. The demo community has about 100 members: 25 in Cohort 12, including the 8 existing sample members, and 25 in each of Cohorts 9, 10 and 11. It's the same every time the app loads.
2. The People view shows Invitations (when there are any), then Suggested for you (5 members you're not connected to, each with at least 1 reason), then All members.
3. Search finds members by name, skill, company or school. The track, stage, cohort and connection filters narrow the list, work together, and can be cleared.
4. Each card shows stage, cohort, number of mutual connections and its top reason, and no match percentage. The profile sheet shows reasons without a percentage.
5. Connect opens a dialog with an optional note of up to 300 characters. After sending, the card shows Requested, and the request can be withdrawn.
6. Accepting an invitation connects the two members and enables Message. Ignoring it removes it.
7. Sharing a cohort, a past company, a school or mutual connections raises a member's score, and each gives a reason. Changing goals or stage doesn't change the score.
8. A member's stage shows on their card and profile with the evidence line.
9. Everything new works by keyboard, at 320px wide, and in light and dark mode, following the project's accessibility standards.
10. Tests that count members (spec 04, criterion 1) are updated for the new community, and all tests pass.

## Decided in review
- **No match percentage** on people cards or profiles. Members see reasons only, because a percentage on a person can feel like grading them. Project cards keep their fit lines (spec 06).
- **The 8 existing sample members move to the UK:** UK locations, British spelling and pounds (D002), with their posts and chats kept.
