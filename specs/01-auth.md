# Feature Spec 01: Simplified Authentication & Track Selection

## Core Requirements
- Support Google SSO button ("Continue with Google") and manual Email/Password sign-up/login.
- Require Track Selection during sign-up: "Software Developer" OR "Business Developer".
- Require Terms of Service & Privacy Policy agreement checkbox before submission.
- Note: Do NOT include LinkedIn on the authentication screen. LinkedIn integration will be handled exclusively on the Profile Setup page later.

## Acceptance Criteria
1. Track Selection is mandatory; form throws an error if unselected.
2. Terms & Conditions checkbox must be checked before submitting.
3. Successful login hides the auth modal and reveals the main dashboard (`prototype.html`).
