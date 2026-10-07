# Feature Spec 07: Project Loop and Verified Experience

## Purpose
Turn projects into portfolio: apply, form a team, work in a project chat, finish, and earn verified experience with ratings and skill endorsements.

## Applying
- **Apply** opens a sheet with your fit and an optional note to the owner. The card then shows "Applied · waiting for <owner>".
- Demo behaviour: the owner accepts after a moment. You join the team, a project group chat is created with a system message stating the deliverable and a welcome from the owner, and the card shows **Project chat** and **Mark complete**.

## Owning a project
- After posting a Project, the best-fitting sample members apply over a few seconds (demo behaviour) with a short note.
- **Manage** sheet: team, applicants with fit % and reasons (Accept / Decline), Suggested team with **Invite** (demo invitees accept after a moment), and **Start project** once there's at least one teammate. Starting creates the team chat and opens it.

## Completing
- **Mark complete** (owner or any team member on an in-progress project): rate each teammate 1–5 stars, endorse up to 3 of their skills, and optionally describe what was delivered.
- Result: the project is Completed; a **verified experience** entry is added to your profile (title, role, teammates, dates, average teammate rating, endorsed skills, note); teammates' endorsements of your skills are added (demo behaviour) and shown as counts on your skill tags; the project chat gets a completion message.
- Sample members' profiles show their own verified experience and endorsement counts.

## Demo starting state
You're already on the in-progress "Freelancer Finance MVP" project, linked to its existing group chat, so completion can be shown immediately.

## Acceptance Criteria
1. Applying leads to acceptance, a project chat with a system message, and Project chat / Mark complete on the card.
2. Posting a project brings applicants; accepting one adds them to the team; starting creates and opens the team chat.
3. Completing a project adds verified experience and endorsement counts to the profile, the preview card, and the sidebar, and they persist after a reload.
