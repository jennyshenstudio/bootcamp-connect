# Bootcamp Connect

A community and matching hub where bootcamp Software Developer and Business Developer students team up: post ideas and paid gigs, find complementary co-founders, and message each other.

## What's here

| Path | What it is |
| --- | --- |
| `prototype.html` | Current interactive prototype (single file, Tailwind via CDN). Open it in a browser. |
| `prototype-v1.html` | Earlier design with fuller Matchmaker, Messages, and Profile tabs. |
| `specs/` | Feature specs. `01-auth.md` covers sign-up, log in, and track selection. |

## Prototype features

- Full-page sign up / log in with Google (simulated) and email
- Mandatory track selection (Software Developer or Business Developer) and Terms agreement
- Log out, and staying logged in after a refresh
- Project feed with upvotes; Matchmaker, Messages, and Profile tabs (placeholders)

Accounts are stored only in the viewer's browser (`localStorage`); there is no backend yet, and passwords are not stored or checked.

## Run it

Open `prototype.html` in any modern browser. An internet connection is needed for the Tailwind CDN.
