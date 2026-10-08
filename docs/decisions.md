# Decisions Log

Every product, design, and technical decision for Bootcamp Connect, newest last. Before adding or changing a feature, check it against this log; when a decision changes, add a new entry and mark the old one **Superseded** rather than deleting it.

**Status:** Accepted (built) · Accepted (not built yet) · Proposed · Superseded · Parked

## Summary

| # | Decision | Status | Affects |
| --- | --- | --- | --- |
| D001 | Purpose: experience first; the app bridges skill gaps | Accepted (built) | Everything |
| D002 | UK app: British English, pounds sterling, UK standards preferred | Accepted (built) | Copy, pay, standards |
| D003 | Prototype: static web app, no backend; data stays in each browser | Accepted (built) | Storage, sharing |
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
| D017 | Code organised as `prototype.html` + `css/` + `js/` modules; build script for the artifact | Accepted (built) | Codebase, release |
| D018 | Messages fits one screen | Accepted (built) | Messages |
| D019 | AI Coach (open coaching chat) | Superseded by D020 | AI |
| D020 | AI companion = Project Kickstart: idea → scope → gap map → team and resources → post | Accepted (not built yet) | AI, projects |
| D021 | Gap map backbone: GOV.UK phases (Discovery, Alpha, Beta, Live) | Accepted (not built yet) | AI, projects |
| D022 | Skills evaluation: evidence-based, UK government skill levels, level + confidence | Accepted (not built yet) | Profile, matching, AI |
| D023 | Skills model: three layers (roles, capabilities, tools) from UK standards | Accepted (not built yet) | Profile, matching, AI, library |
| D024 | Community library: resources attached to gap items and capabilities | Accepted (not built yet) | Library, AI |
| D025 | Decisions log, production process standards, and CLAUDE.md | Accepted (built) | How we work |
| D026 | Backend: Supabase (London) for data, sign-in, files, and live chat; Vercel for hosting | Proposed | Storage, auth, sharing, release |

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
- **Date:** 2026-10-06
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
- **Date:** 2026-10-07
- **Decision:** `prototype.html` holds markup; `css/app.css` holds styles; `js/` holds one plain script per feature, loaded in a fixed order. `scripts/build_artifact.py` builds the artifact copy.

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
- **Date:** 2026-10-08 · **Status:** Accepted (built)
- **Decision:** Every session follows `CLAUDE.md`. Standards: WCAG 2.2 AA (accessibility), GOV.UK content style (wording), Apple HIG (design, D009), and this log for every decision. Every change comes with a browser test, and `npm test` must pass before committing. Changes go straight to `main` and the shared prototype is republished.
- **Follow-up:** audit the current prototype against WCAG 2.2 AA and GOV.UK content style; adopting a standard doesn't mean the app already meets it.
- **Affects:** How we work.

### D026 Backend: Supabase, hosted on Vercel
- **Date:** 2026-10-08 · **Status:** Proposed
- **Context:** D003 keeps all data in each browser, so testers can't see each other's posts, messages, or projects.
- **Decision:** Supabase in its London region (UK GDPR) for the Postgres database, real sign-in (email and Google), file storage for attachments, and realtime updates for Messages, with row-level security on every table. The app is hosted on Vercel, because the claude.ai artifact link is not expected to reach an outside database. The artifact stays as a demo with sample data.
- **Rejected:** Vercel's own storage, which is third-party add-ons (Neon, Upstash) and would still need separate sign-in, file storage, and realtime.
- **Supersedes when accepted:** D003.
- **Affects:** Storage, auth, sharing, release.
