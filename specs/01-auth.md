# Feature spec 01: sign up, log in and track choice

How the sign-up and log-in screen works today. The live site's real Google sign-in and server are in spec 09. Designs: "A" for sign up and "Log in 1" for log in, chosen by the owner on 2026-10-09 (design canvas: https://claude.ai/artifact/2HhRhjhpBowxszXKbuJkQU).

## Layout
- **Desktop:** two full-height rounded panels side by side. Left: the dark brand panel (name, headline, a sample match card). Right: the glass form panel.
- **Phones:** the brand panel is hidden; a compact brand row sits above the form.
- **Switching:** a link at the top right of the form panel: "Already a member? Log in" on sign up, "New to Bootcamp Connect? Sign up" on log in. There are no tabs.
- The screen keeps the same sizes at every window height. It doesn't shrink on short windows.

## Sign up
- Title "Create your account", subtitle "Choose your track, then continue with Google."
- **Your bootcamp track:** two large tiles, Software Developer (Coder or engineer) and Business Developer (Growth or product). Nothing is chosen at first. ("Business Developer" may be renamed later.)
- **Terms:** "I agree to the Terms of Service and have read the Privacy notice". Both links open the draft documents in a new tab until they become pages in the app (spec 09).
- **Continue with Google**, following Google's sign-in branding guidelines (official "G", set colours in light and dark mode).
- **Demo only:** "Sign up with email instead" under the Google button reveals first name, last name, email, password and Create account. The live site has Google only (D033).
- Do not put LinkedIn on this screen. LinkedIn belongs on profile setup.

## Log in
- Title "Welcome back" (larger than on sign up), subtitle "Log in to pick up where you left off."
- A large Continue with Google button.
- **Demo only:** an "or" line, then a full-width "Log in with email" button that reveals email and password.
- The demo note sits at the bottom of the panel.

## Log out
- Returns to log in. In the demo, if the member used email, the email form is open with their email filled in.
- On the live site, log out must also clear the member's data from the browser (spec 09).

## Acceptance criteria
1. Track and terms are required to sign up, by Google or by email. Missing either shows its error: "Select your bootcamp track to continue." and "Agree to the Terms of Service to continue."
2. Sign up and log in lead with Continue with Google. In the demo, the email form stays hidden until asked for.
3. A new sign-up lands on profile setup; a returning member lands on the Feed.
4. Switching between sign up and log in, by mouse or keyboard, moves focus to the screen's title.
5. The screen fits one screen at 1280×650, 1366×768 and 390×844 (spec 08), and keeps its large track tiles on short windows.
6. It meets WCAG 2.2 AA and the GOV.UK content style, in light and dark mode.
