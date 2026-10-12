# Feature spec 15: profile page

**Status:** version 1, layout and choices approved by the owner 2026-10-12 (layout A on the design canvas https://claude.ai/artifact/3ZzMxMRMojuVidngSduYf3). Decision: D050. Builds on [spec 11](11-profile-work-to-show.md) (what a profile holds) and [spec 10](10-networking.md) (connecting and suggestions). Where this spec differs from them, this spec wins.

## Purpose
A member's profile is a page of its own, like LinkedIn: who they are, the work and posts they want seen first, what they've posted, and a CV. Today it opens in a pop-up sheet with no posts, CV or pinning.

## Where it applies
The demo, with made-up members (alpha, D036). Before the live site, pins and saved posts are new personal data for `docs/personal-data.md` and the privacy notice.

## The page (layout A: one long page)
Opens from any member's name or photo (Feed, Connect, Messages, opportunity teams). It replaces the profile sheet. A **Back** button returns to where you came from. Your own page is the **Profile** tab.

**Top card,** full width of the main column:
- a banner in the member's colours, photo, name, headline, and **currently working on**
- one line: track, stage with its evidence (spec 10), location and work setting, available from
- number of connections, and for other members the number of mutual connections
- buttons: other members get **Connect**, **Requested** or **Message** (spec 10); your own page gets **Edit profile**

**Main column, in this order** (empty sections are hidden):
1. **Pinned:** up to 3 items the member chose, from their work to show or their own posts, in the order pinned. Work shows its screenshot, title and facts line; a post shows its type, first line and likes. Selecting one opens it.
2. **About**
3. **Work to show,** as in spec 11 (first 3, then Show all work; Read more opens the case study)
4. **Posts:** the member's Feed posts, newest first. The 2 newest show, then **Show all posts (n)**. Each shows its type, when, title or first lines, and opens the post.
5. **Skills** and currently learning (spec 11)
6. **Experience**, **Education** and **Verified experience** (spec 11)

**Side column** (on phones it comes after the main column, except Why you might connect, which comes straight after the top card):
- **Why you might connect** (other members only): up to 3 reasons (spec 10)
- **CV:** "Made from this profile" with **View CV** (below)
- **Available for** and **Links** (spec 11)
- **Group chats together** (other members only)
- **Saved** (your own page only, marked "Only you can see this")

At the bottom: "Members can use AI to help write their profiles."

## Your own page
- The **Profile** tab shows your page as others see it, plus Saved and a hint where something is missing ("Pin up to 3 pieces of work or posts to show them first").
- **Edit profile** opens today's profile form, including **Import from your CV or LinkedIn**, which fills in the form from an uploaded CV. **Save profile** saves and returns to your page. **Cancel** returns without saving and puts the form back as it was.
- A new member still starts on the form, with the banner, until they first save.

## Pinning
- On your own page, each piece of work and each of your posts has **Pin** (or **Unpin**). Pinning saves straight away.
- Up to 3. Pinning a fourth says "You can pin up to 3. Unpin one first."
- A piece of work keeps its pin when it's renamed, and two pieces with the same title are pinned separately.
- Deleting a pinned post, or removing a pinned piece of work, unpins it.
- Some sample members have pins, so the section shows in the demo.

## CV
- **View CV** opens the CV in a sheet: name, headline, location, links, about, experience, education, skills and work to show (title, facts line and summary). No email address or phone number.
- **Print or save as PDF** uses the browser's print, which prints only the CV. Inside the claude.ai preview, printing may be blocked; the CV can still be read and copied there.
- Members don't upload a CV file for others to download (less personal data to protect). Uploading a CV to fill in the profile stays as it is (spec 03).

## Saved
- Your page lists the resources and opportunities you've saved, newest first, each opening the post. Unsaving removes it.
- Empty: "Nothing saved yet. Use Save on a resource or opportunity to keep it here."

## Acceptance criteria
1. Selecting a member's name or photo opens their profile page, not a sheet, with the top card, main column and side column in the order above. Back returns to where you were.
2. The Profile tab shows your own page with Edit profile. Edit opens the form; Save profile saves and returns to the page; Cancel returns without saving.
3. A new member starts on the form with the banner.
4. You can pin up to 3 pieces of work or posts from your page, and unpin them. A fourth pin is refused with a message. Pins show first on your page, in the order pinned, and stay after a reload.
5. Posts shows the member's posts newest first, 2 at a time, with Show all posts.
6. View CV shows a CV made from the profile, with no email address or phone number, and a Print or save as PDF button.
7. Your page shows Saved, only to you, listing saved resources and opportunities.
8. Other members' pages show Connect, Requested or Message, and Why you might connect; your page shows neither.
9. Everything works by keyboard, at 320px wide with no sideways scroll, and in light and dark mode, following the project's accessibility standards. All tests pass.
