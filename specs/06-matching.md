# Feature Spec 06: Matching v2

**Changing:** spec 10 (built) replaces person ↔ person fit with a suggestion score. Project fit doesn't change.

## Purpose
Match members to projects that build their portfolio, and to people who are good for them **and** for whom they are good. Every score comes with plain-language reasons.

## Inputs
From the member's profile: track, skills, **skills I want to learn** (up to 5), **open to** pay types (Paid / Unpaid / Equity), hours per week, work setting, industries, goals. From history: verified projects and skill endorsements (Spec 07).

## Project → member fit
1. **Hard filters** (project hidden from For you and shown as "Not a fit right now: …"): pay type not in the member's Open to; hours needed above the member's hours; in person only when the member prefers remote; no role for the member's track.
2. **Weighted score (0–100):** skill fit 45 (skills needed for the member's role that they have; 40%+ is a "strong skill match"; skills they want to learn count half), growth fit 10 (needed skills they want to learn), commitment 15 (same hours band = full, adjacent = half), industry interest 10, goal fit 10 (Equity ↔ Co-founder, Paid ↔ Paid work, Unpaid ↔ Passion project), fairness 10 (fewer applicants rank higher).
3. Reasons, e.g. "Strong skill match: React, Node.js", "You'd practise Stripe, which you want to learn", "Fits your weekly hours", "No applicants yet".

## Person ↔ person fit (reciprocal)
- One-way fit of B for A (0–100): complementary track 30, B's skills cover A's learning goals 25, shared goals 15, hours 10, shared industries 10, B's reliability (verified projects, endorsements) 10.
- Mutual score = geometric mean of both directions, so it's high only when both people benefit; shown as 30–98%. Members with fewer than 8 connections get a small boost so attention is spread fairly.
- Reasons include both directions: "Can help you learn Customer discovery" and "You can help them with React, which they want to learn".

## Team suggestions (project owners)
CATME-style: for each open role slot, pick the best-fitting member who isn't already on the team or an applicant, filling the role with the fewest eligible candidates first so no slot is left with a weak fit.

## Where it shows
Feed For you ranking and fit lines on project cards; Connect tab **Projects** (ranked, plus a collapsed "Not a fit right now" list) and **People** views; the Manage sheet's applicant fit and Suggested team.

## Research basis
YC Co-Founder Matching (preferences with importance; commitment matters most), CATME Team-Maker (criteria-based team formation), Hinge "Most Compatible" / Gale-Shapley (two-sided preferences), reciprocal recommender research (mutual interest, fairness), Upwork (skill overlap and reputation from finished work), Lunchclub (feedback improves matches).

## Acceptance Criteria
1. Pay type, hours, setting, and track filters block a project with the matching reason.
2. A needed skill on the member's learn list produces a growth-fit reason and raises the score.
3. Person scores expose both directions and include reciprocal reasons.
4. Suggested team covers every open role when eligible members exist.
