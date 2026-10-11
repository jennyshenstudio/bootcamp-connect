# Feature spec 12: opportunities

**Status:** version 1, approved by the owner 2026-10-11 as the basic structure for the demo. Decision: D040. Where this spec differs from specs 05, 06 and 07, this spec wins. Details are parked until after the demo (see the end).

## Purpose
The Feed is where members share work, ask questions and find opportunities. An **opportunity** is a piece of work someone needs help with, paid or unpaid. It replaces the "Project" post type. Opportunities live in the Feed only; Connect is for finding people.

## Posting an opportunity
In this order:
1. **Looking for:** Software Developer or Business Developer (one choice, as buttons). Starts on the other track from the poster's.
2. **Title**
3. **Pay:** Paid or Unpaid. Paid asks for a fixed fee in pounds for the whole project.
4. **Commitment:** Part-time, Full-time or Contract.
5. **Workplace:** In person, Hybrid or Remote. In person and Hybrid ask for a town or city.
6. **Dates:** start date and end date. The end can't be before the start.
7. **About the project:** what it is and why it matters.
8. **Responsibilities:** one per line.
9. **Minimum requirements:** one per line.
10. **Nice to have:** one per line (optional).

Attachments work as on every post. Everything except Nice to have and attachments is required, and each error says what to fix.

## In the Feed
- The card has a **coloured edge** for the pathway: blue for Software Developer, purple for Business Developer. The pathway is also the first fact, in words, so it never relies on colour alone.
- Facts: pathway, pay ("£950, fixed" or "Unpaid"), commitment, workplace (with the town), dates, and status once it's no longer open.
- About the project, cut to 3 lines, then the team and number of applicants.
- **See details** opens the opportunity page. The buttons (Apply, Applied, Manage, Project chat, Mark complete and See details) sit on the right of the row with likes and comments, so the card has one row of buttons (D043).
- Attachments show on the opportunity page, not on the card (D043).
- No fit percentage. When a member can't apply (another pathway, or a pay type they're not open to), the card says why.
- Filter: **Opportunities**. "For you" puts opportunities for your pathway first.

## The opportunity page
Laid out like a job listing: the poster and when it was posted, the pathway, the title, Apply and Save, then **At a glance** (pay, commitment, workplace, dates and length in weeks), **About the project**, **Responsibilities**, **Minimum requirements**, **Nice to have** (if any), any attachments, and **About [name]**.

## Applying
- **Message to [name]** (required, up to 300 characters).
- **Your most relevant work:** one piece of work from your profile (optional; it says so when you haven't added any).
- Your profile goes with it. As before, the poster accepts or declines, and accepting starts the project chat.
- The poster's Manage view shows each applicant's message and the work they picked.

## Connect
The Projects view is removed. Connect shows People only.

## Sample opportunities
The 5 sample projects become opportunities with the new fields, all in pounds. The equity project becomes Unpaid.

## Parked until after the demo
Claude checking About the project; more than one Commitment or Workplace option; "You'll hear back before…"; an adjustments question when applying; an "Apply by" date; a legal check of unpaid opportunities (businesses posting Unpaid, Unpaid with Full-time) against minimum wage rules before real members use them.

## Acceptance criteria
1. The composer offers Opportunity with the fields above in that order. Missing required fields, a Paid opportunity without a fee, and an end date before the start each show an error that says what to fix.
2. A posted opportunity shows in the Feed with a coloured edge for its pathway, the pathway in words first in its facts, pay in pounds, commitment, workplace, dates and no fit percentage. Its buttons share the row with likes and comments, and its attachments show on the opportunity page instead of the card.
3. See details opens the opportunity page with the sections above in order.
4. The application asks for a message (required) and your most relevant work, and the poster sees both in Manage.
5. Connect has no Projects view.
6. The Opportunities filter shows only opportunities.
7. Everything works by keyboard, at 320px wide, and in light and dark mode. All tests pass.
