# Bootcamp Connect

A community and matching hub where bootcamp Software Developer and Business Developer students team up: post ideas and paid gigs, find complementary co-founders, and message each other.

## What's here

| Path | What it is |
| --- | --- |
| `prototype.html` | Current interactive prototype (single file, Tailwind via CDN). Open it in a browser. |
| `prototype-v1.html` | Earlier design with fuller Matchmaker, Messages, and Profile tabs. |
| `test-data/` | Sample CV for a made-up member (Maya Okafor) as PDF, Word, and HTML, for testing the profile import. |
| `specs/` | Feature specs. `01-auth.md`: sign-up, log in, and track selection. `02-profile.md`: one-page profile setup. `03-profile-import.md`: import from CV or LinkedIn. `04-connections-messages.md`: demo community. |

## Prototype features

- Full-page sign up / log in with Google (simulated) and email
- Mandatory track selection (Software Developer or Business Developer) and Terms agreement
- Log out, and staying logged in after a refresh
- One-page profile setup: photo, headline, track, location, About, links, work experience, skills, projects, and what you're looking for, with a live preview card and profile strength meter
- Import from a CV or LinkedIn profile PDF (PDF, .docx, or text): extracts experience, skills, projects, and more, with a review step before anything is added. Uses Claude on the published claude.ai page, or a built-in reader when opened as a local file
- New sign-ups land on profile setup; returning members land on the Project Feed
- Demo community: 8 sample members with full profiles, a ranked Matchmaker with Connect and profile view, 3 group chats and direct messages with unread badges, typing indicators, and replies (written by Claude on the published page)
- Project feed with upvotes

Accounts and profiles (including photos, resized to 256px) are stored only in the viewer's browser (`localStorage`); there is no backend yet, and passwords are not stored or checked.

## Design

The interface follows Apple's Human Interface Guidelines with a **Liquid Glass** look (iOS 26 / macOS Tahoe):

- [apple-hig-designer](https://github.com/axiaoge2/apple-hig-designer) skill (MIT, © axiaoge2), installed for Claude Code at `.claude/skills/apple-hig-designer/`: system colors, iOS type scale (17px body), 8pt grid, 44px touch targets
- Liquid Glass rules from Apple's guidance: glass for the floating navigation layer (top bar, phone tab bar, buttons), thicker frosted glass for content cards so text stays legible, no glass stacked on glass
- Pure-CSS glass (backdrop blur and saturation, top-edge specular highlight, soft sheen) over an ambient color field, so it works in Safari, Chrome, and Firefox; real-refraction libraries such as [liquid-glass-react](https://github.com/rdev/liquid-glass-react) only show refraction in Chrome
- Automatic dark mode; falls back to solid surfaces when "Reduce transparency" is on

## Run it

Open `prototype.html` in any modern browser. An internet connection is needed for the Tailwind CDN.
