# Feature Spec 05: Typed Feed and Attachments

## Purpose
The feed is where members find experience-building projects and share with their cohort. Every post has a type so people can filter, and every type supports the same attachments.

## Post Types
| Type | Fields | Extra actions |
| --- | --- | --- |
| Project (work) | Title, description, roles needed (track, number of people, skills), hours/week, duration in weeks, work setting, industry, pay (Paid fixed fee with amount and currency, defaulting to pounds sterling (£ GBP) with EUR, USD, CAD, and AUD available; Unpaid / volunteer; or Equity / co-founder), deliverable, status (Open / In progress / Completed) | Apply, Manage, Project chat, Mark complete (Spec 07) |
| Resource | Title, why it's useful, kind (Link, Doc, Video, Screenshot, Other), tags | Save |
| Personal project | Name, what you built, "feedback wanted" toggle | |
| Support | Question, details | Answers (comments); the author can mark solved |
| Community | Optional title, message | |

All posts: author (opens profile), type badge, time, like, comments.

## Attachments (every post type)
- Up to 6 per post: photos and videos (file picker or drag and drop), documents (PDF, Word, slides, spreadsheets, Keynote, Pages, Numbers, text), and external links (URL with optional title).
- Photos are resized in the browser (longest side 1600 px, JPEG; GIFs up to 5 MB keep their animation). Limits: photos 15 MB before resizing, videos 50 MB, documents 20 MB. Unsupported or oversize files show a clear error and the rest still upload.
- Files are stored in the browser's IndexedDB; posts keep only metadata. If IndexedDB is unavailable (some private windows), files are kept for the session and marked as such.
- Display: 1 photo or video full width; 2–4 in a grid with "+N" for more; document cards (type, name, size, Open); link cards (title, domain, open in a new tab).
- Viewer: photos and videos with previous/next (buttons, arrow keys, swipe), PDFs rendered page by page (first 20 pages), other document types show their details.
- Prototype limit: the published claude.ai page's shared file storage is editor-only and makes a page organisation-internal, so uploads stay in each viewer's browser.

## Filters and Ranking
- Filters: For you, All, Projects, Resources, Personal, Support, Community.
- **For you** ranks by fit (Spec 06): open projects that fit you, your own posts, projects you're on, then resources matching your skills or learning goals, open support questions, personal projects wanting feedback, and community news, weighted by recency. Projects you're blocked from (pay type, hours, setting, track) are left out.
- Desktop sidebar: Projects for you (top 3 with fit %), Your projects (posts, applications, teams with status), Verified experience count.

## Acceptance Criteria
1. Each filter shows only its type; For you hides blocked projects.
2. Each post type can be created with a photo, a video, a PDF, and a link attached, and all of them display and open in the viewer.
3. Unsupported and oversize files show an error; a post can't be submitted while files are still being added.
4. Required fields are enforced per type (e.g. a project needs roles with skills, a deliverable, and a fee when paid).
5. Posts, attachments, likes, saves, comments, and solved status persist after a reload.
