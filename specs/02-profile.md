# Feature Spec 02: One-Page Profile Setup

## Core Requirements
- A single scrolling page (the "Scorecard Profile" tab) where members create and edit their profile. Fields are modeled on LinkedIn, Handshake, Wellfound, and YC Co-Founder Matching.
- **Basics**: profile photo (upload, initials fallback), first name, last name, headline, track (Software Developer / Business Developer), location, work setting (Remote / Hybrid / In person), About (max 500 characters).
- **Links**: LinkedIn, GitHub (Software Developer) or Portfolio (Business Developer), personal website. LinkedIn appears here only, never on the authentication screen (see Spec 01).
- **Work experience**: repeatable entries with title, company, start month, end month or "I currently work here", and description.
- **Skills**: up to 10 skill tags, with suggestions tailored to the member's track.
- **Projects / featured work**: repeatable entries with title, link, role, and short description (max 200 characters).
- **What I'm looking for**: goals (Co-founder, Paid gig, Passion project, Hiring teammates), hours per week (<10, 10–20, 20–40, 40+), idea status, industries of interest, and available-from date. These fields feed the Matchmaker.
- A live preview card ("How others see you") and a profile strength meter listing what is still missing.

## Acceptance Criteria
1. First name, last name, track, and headline are required; saving without them shows an inline error on each missing field.
2. Saved profiles persist across page reloads and log out / log in.
3. Uploaded photos are resized and appear in the preview card and the header avatar.
4. The strength meter reaches 100% when photo, headline, About, one work experience, three skills, one project, and the "What I'm looking for" goals and hours are filled.
5. New sign-ups land on the profile page with a "Finish your profile" banner; returning members who log in land on the Project Feed.
6. The page works at phone width without horizontal scrolling.
