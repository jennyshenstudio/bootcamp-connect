# Bootcamp Connect

A community and matching hub where bootcamp Software Developer and Business Developer students team up: post ideas and paid gigs, find complementary co-founders, and message each other.

## What's here

| Path | What it is |
| --- | --- |
| `prototype.html` | Current interactive prototype (single file, Tailwind via CDN). Open it in a browser. |
| `prototype-v1.html` | Earlier design with fuller Matchmaker, Messages, and Profile tabs. |
| `specs/` | Feature specs. `01-auth.md`: sign-up, log in, and track selection. `02-profile.md`: one-page profile setup. `03-profile-import.md`: import from CV or LinkedIn. |

## Prototype features

- Full-page sign up / log in with Google (simulated) and email
- Mandatory track selection (Software Developer or Business Developer) and Terms agreement
- Log out, and staying logged in after a refresh
- One-page profile setup: photo, headline, track, location, About, links, work experience, skills, projects, and what you're looking for, with a live preview card and profile strength meter
- Import from a CV or LinkedIn profile PDF (PDF, .docx, or text): extracts experience, skills, projects, and more, with a review step before anything is added. Uses Claude on the published claude.ai page, or a built-in reader when opened as a local file
- New sign-ups land on profile setup; returning members land on the Project Feed
- Project feed with upvotes; Matchmaker and Messages tabs (placeholders)

Accounts and profiles (including photos, resized to 256px) are stored only in the viewer's browser (`localStorage`); there is no backend yet, and passwords are not stored or checked.

## Run it

Open `prototype.html` in any modern browser. An internet connection is needed for the Tailwind CDN.
