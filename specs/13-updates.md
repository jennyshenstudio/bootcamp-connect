# Feature spec 13: updates

**Status:** version 1, approved by the owner 2026-10-11. Decision: D041. Where this spec differs from spec 05, this spec wins.

## Purpose
Members share professional announcements about their career or a project, like a LinkedIn post, so the cohort stays connected and their progress is visible. Updates replace the "Personal project" and "Community" post types. The Feed then has Opportunity (spec 12), Update, Support and Resource; Support and Resource are reworked next.

## Posting an update
1. **What's it about?** Career or Project, as buttons. Starts on Career.
2. **What's your news?** Required, up to 1,000 characters. Hint: "For example: a new role, finishing the bootcamp, a project going live, your first paying customer."
3. Photos, videos, documents and links, as on every post.

No title: the first line does that job. No "feedback wanted" option.

## In the Feed
The author, their pathway and when they posted, a Career or Project label in words, the text, attachments, likes and comments. Filter: **Updates**.

## Sample posts
The 2 personal project posts become Project updates. The 2 community posts (Demo Day sign-ups and the welcome post) are removed, because they're cohort announcements rather than career or project news. A career update is added.

## Posts saved before this change
Personal project posts load as Project updates and community posts as updates with no label, keeping their title and text.

## Parked
**Brainstorm:** members share an idea they need help with, and others join a group chat on a set date to develop it. To decide after Support and Resource are reworked.

## Acceptance criteria
1. The composer offers Update with Career or Project, the news box (required, up to 1,000 characters) and attachments, and no title or feedback option.
2. A posted update shows its label in words, its text and its attachments.
3. The Updates filter shows only updates. There are no Personal or Community filters, post types or composer buttons.
4. Saved personal project and community posts still load, as updates.
5. Everything works by keyboard, at 320px wide, and in light and dark mode. All tests pass.
