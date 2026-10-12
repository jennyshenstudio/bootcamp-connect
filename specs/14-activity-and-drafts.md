# Feature spec 14: your activity and drafts

**Status:** version 2, approved by the owner 2026-10-12. Decisions: D042, D046. Replaces the Feed sidebar in spec 05.

## Purpose
The column beside the Feed shows what the Feed can't: what's waiting on you, where your work stands, how complete your profile is, and posts you haven't finished. It fits one screen on a computer, so it never scrolls. Drafts mean nothing you start writing is lost.

## Your activity (D046)
1. **Needs you:** everything waiting on you, in one list:
   - "N applicants to review" for each of your open opportunities (opens Manage)
   - "N invitations to connect" (opens Connect)
   - unread conversations: one row with the conversation's name, or "N conversations with new messages" (opens Messages)
   - "Mark [project] complete" for a project you're on that has passed its end date
   - when there's nothing: "You're all caught up."
2. **In progress:** your applications and projects that aren't finished:
   - applied: "Applied · waiting for [name]" (opens the opportunity page)
   - in progress: "In progress · ends [date]" (opens the project chat)
   - your open post with no applicants yet: "Your post · no applicants yet"
   - when there's nothing: "Find an opportunity" (opens the Opportunities filter)
3. **Your profile:** how complete it is (the same percentage as profile strength), a bar, and the next step, which opens that part of the profile. Hidden at 100%.
4. **Drafts:** one line, "N drafts", which opens the drafts list. Hidden when there are none.

Each list shows up to 4 rows (In progress: 3); after that, "N more" shows the rest. **Your profile comes first** until your profile has a headline. There's no header card and no "New for you": the top bar shows who you are, and the Feed's For you filter already shows new opportunities.

**On phones** the summary is hidden behind a **Your activity** bar above the Feed, which says how many things need you (the items in Needs you) and opens or closes the summary.

## Drafts
- The post form has **Save draft** next to Post.
- Closing the form any other way (Cancel, the close button, Escape or clicking outside) with anything written or attached also saves it as a draft. A message says "Saved as a draft. It's under Your activity."
- The drafts list shows each draft's post type, its first words and when it was saved, with **Continue** and **Delete**.
- **Continue** reopens the form exactly as it was, including attachments. Posting it, or saving it again, replaces the draft.
- **Delete** removes the draft and its attached files.
- Drafts are kept in this browser, like posts (D003).

## Acceptance criteria
1. The sidebar shows Needs you, In progress, Your profile and Drafts, puts Your profile first for a member without a headline, and fits a 1440×900 window without scrolling.
2. Each item opens the right place: opportunity page, Manage, project chat, Connect, Messages, a conversation, a profile section or the drafts list.
3. Save draft, and closing the form with something in it, both save a draft with a message; closing an empty form saves nothing.
4. Continue restores every field and attachment; posting it removes the draft; Delete removes it.
5. Drafts persist after a reload.
6. On phones, the Your activity bar shows the count and opens and closes the summary, with aria-expanded.
7. Everything works by keyboard, at 320px wide, and in light and dark mode. All tests pass.
