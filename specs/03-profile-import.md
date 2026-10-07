# Feature Spec 03: Import Profile from CV or LinkedIn

## Core Requirements
- An "Import from your CV or LinkedIn" card at the top of the profile page (Spec 02).
- Accepts PDF, Word (.docx), and plain-text files up to 10 MB, by file picker or drag and drop.
- LinkedIn import works through the profile PDF (LinkedIn → Resources / More → Save to PDF). LinkedIn's API does not let third-party apps read a member's experience or skills, so the page explains how to get the PDF.
- Text is extracted in the browser (pdf.js for PDF, mammoth.js for .docx).
- Details are extracted by Claude when the page runs as a published claude.ai artifact (the viewer is asked to allow it; it uses their own Claude account). Otherwise a built-in reader uses section headings and date ranges, and the review step says it may miss or mix up details.
- Extracted fields: first and last name, headline, location, About, LinkedIn / GitHub / website links, work experience (title, company, start, end, current, description), skills, and projects.
- A review step lists everything found with checkboxes. Nothing changes until the member clicks "Add selected to my profile", and the profile is not saved until they click Save.

## Merge Rules
1. The name from the CV is pre-ticked whenever it differs from the current name (for example the "Google User" placeholder from Google sign-up) and replaces it when applied. Other Basics fields are pre-ticked only when the current field is empty; ticking one that has a value replaces it.
2. Experiences and projects are added to the existing list; the blank starter entry is removed. Experiences already on the profile (same title and company) are unticked.
3. Skills already on the profile are shown as already added; new skills fill up to the 10-skill limit and the member is told how many didn't fit.

## Acceptance Criteria
1. A LinkedIn PDF and a Word CV both produce experiences and skills in the review step, and the CV's name replaces the sign-up name after applying and saving.
2. Unsupported files (images, .doc) and files with no text show a clear error and the upload area stays usable.
3. The member can stop an import in progress.
4. Applying an import updates the form, the live preview, and the profile strength meter.
