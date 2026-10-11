# Feature spec 14: your activity and drafts

**Status:** version 1, approved by the owner 2026-10-11. Decision: D042. Replaces the Feed sidebar in spec 05.

## Purpose
The column beside the Feed is a summary of where you stand: new opportunities, current ones, people to get back to, tasks to complete and posts you haven't finished. Drafts mean nothing you start writing is lost.

## Your activity
A header card ("Your activity", your photo, name and pathway), then these sections. **A section only shows when it has something in it.**
1. **New for you:** up to 3 open opportunities for your pathway that you haven't applied to and aren't part of, best fit first, each with who posted it, pay and commitment, and **See all opportunities**. Opens the opportunity page.
2. **Current:** opportunities you're part of that aren't finished, newest first:
   - your own open post: "Your post · N applicants to review" (opens Manage)
   - in progress: "In progress · Ends [date]" (opens the project chat)
   - applied: "Applied · Waiting to hear from [name]" (opens the opportunity page)
3. **People to get back to:** invitations to connect ("N invitations to connect", opens Connect) and up to 2 conversations with unread messages ("[name] · N new", opens the conversation).
4. **To do:** up to 3 of: the first unfinished profile steps (the same ones as profile strength, opening that part of the profile), "Mark [project] complete" for a project you're on that has passed its end date, and "Apply to your first opportunity" when you haven't applied to any.
5. **Drafts:** each draft's post type, its first words and when it was saved, with **Continue** and **Delete**.

Order: as above, except that **To do comes first** until your profile has a headline.

**Scrolling (computers):** a summary shorter than the window stays under the header. A taller one scrolls down with the page until its last section is in view, then stays there. It has no scrollbar of its own.

**On phones** the summary is hidden behind a **Your activity** bar above the Feed, which says how many things need you (applicants to review, invitations, unread conversations and to-dos) and opens or closes the summary.

## Drafts
- The post form has **Save draft** next to Post.
- Closing the form any other way (Cancel, the close button, Escape or clicking outside) with anything written or attached also saves it as a draft. A message says "Saved as a draft. It's under Your activity."
- **Continue** reopens the form exactly as it was, including attachments. Posting it, or saving it again, replaces the draft.
- **Delete** removes the draft and its attached files.
- Drafts are kept in this browser, like posts (D003).

## Acceptance criteria
1. The sidebar shows the sections above in order, hides empty ones, and puts To do first for a member without a headline.
2. Each item opens the right place: opportunity page, Manage, project chat, Connect, conversation, profile section or draft.
3. Save draft, and closing the form with something in it, both save a draft with a message; closing an empty form saves nothing.
4. Continue restores every field and attachment; posting it removes the draft; Delete removes it.
5. Drafts persist after a reload.
6. On phones, the Your activity bar shows the count and opens and closes the summary, with aria-expanded.
7. Everything works by keyboard, at 320px wide, and in light and dark mode. All tests pass.
