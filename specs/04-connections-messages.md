# Feature Spec 04: Demo Connections, Profiles & Messages

**Changing:** spec 10 (approved, not built yet) grows the community to about 100 members and changes how people connect.

## Purpose
Make the prototype feel like the real app for demos: a populated community with complete profiles, connection requests, and active group chats and direct messages.

## Demo Data
- 8 sample members (clearly labelled as sample members for the demo), mixing Software Developer and Business Developer tracks, each with a full profile: headline, location, work setting, availability, About, work experience, skills, projects, and "What I'm looking for".
- 5 start as connections; 3 are suggestions.
- 3 group chats (Freelancer Finance MVP, Cohort 12 · Dev × Biz Mixer, Health Tech Builders) and 2 direct messages, with realistic history across Monday, Yesterday, and Today, and unread counts.

## Connect (formerly Matchmaker)
- Cards ranked by a match score with All / Connections / Suggested filters.
- Score: complementary track, shared industries, shared goals (co-founder weighs most), and similar weekly hours, using the member's own profile.
- **Connect** sends a request that is accepted after a moment (demo behaviour) and shows a confirmation.
- **View profile** opens a profile sheet: banner, photo, track, location, availability, match score with reasons, About, Experience, Skills, Projects, Looking for, and shared group chats. **Message** opens or starts a direct message.

## Messages
- Conversation list with search, last message preview, time, and unread count; unread total shown as a badge on the Messages tab.
- Thread view with day separators, sender names and avatars in groups, typing indicator, and a composer (Enter sends, Shift+Enter adds a line).
- Group header opens a members sheet; tapping a member or avatar opens their profile.
- Replies: on the published claude.ai page, Claude writes the reply in the member's voice from their profile and the recent conversation (the viewer is asked to allow it). Otherwise a short fallback reply is used.
- On phones, an open conversation is full screen with a back button.

## Persistence
Connections, sent messages, replies, and read state are saved per signed-in account in this browser only.

## Acceptance Criteria
1. Connect (People view) shows 8 members; Connections shows 5 and Suggested 3 for a new account.
2. Connecting moves a member to Connections and enables Message.
3. Opening a conversation clears its unread count and updates the tab badge.
4. Sending a message shows a typing indicator, then a reply; both remain after a reload.
5. The Project Feed post links to the author's profile and "Reply / Partner" opens a message.
