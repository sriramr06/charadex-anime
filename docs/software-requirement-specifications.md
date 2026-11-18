# CharaDex — Software Requirements Specification (SRS)

**Version:** 1.2 | **Status:** All requirements (P0, P1, P2) implemented | **Date:** May 2026

**Project:** Original character creation, discovery, and community platform

**Related documents:** [Project Overview](project-overview-problem-statement.md) · [Database Design](database-design.md) · [API Reference](api-reference.md)

> **Changes in 1.2:** FR-14 defined and implemented as free-form tags with Explore filtering and sorting; tag conventions added to section 9.
>
> **Changes in 1.1:** Requirements now describe the behaviour as built. Added FR-15 (landing page) and the two-step sign-up, resolved the open decisions (section 9), and added an implementation status table (section 11).

---

## 1. Introduction

This SRS specifies the initial functional and non-functional requirements for CharaDex. It is intended as a practical development reference for a beginner-to-intermediate MERN project. Requirements may be refined during implementation.

### 1.1 Purpose

Provide a shared definition of system behavior, boundaries, priorities, and acceptance criteria before database and API design.

### 1.2 Product vision

CharaDex allows creators to publish structured original character (OC) profiles, explore public characters, and gradually interact with other creators. The focus is a character encyclopedia with lightweight social features — not a general-purpose social network.

### 1.3 Terminology

| Term | Meaning |
| --- | --- |
| **OC** | Original character |
| **MVP** | Minimum viable product |
| **Owner** | Authenticated user who created a character |
| **Public** | Visible to anyone |
| **Cloudinary** | Hosted image storage service |
| **JWT** | JSON Web Token used to identify a signed-in user on protected requests |

## 2. Overall Description

CharaDex is a responsive browser-based application. Visitors browse public characters and creator pages; registered users manage their own profiles and characters, and can like, comment, and follow creators.

### 2.1 User roles

| Role | Permissions |
| --- | --- |
| **Visitor** | Browse and search public characters; view character details, comments, and creator pages. |
| **Registered user** | All visitor actions, plus create, edit, and delete own characters; manage own profile; like, comment, and follow. |
| **Character owner** | A registered user with permission to modify a specific character. |
| **Comment author** | A registered user who may delete their own comment. |

No administrator dashboard is required in V1.

### 2.2 Assumptions and dependencies

- Users have internet access and a modern browser.
- Images are stored on Cloudinary; application records and image references are stored in MongoDB.
- Visual character generation, AI artwork, and licensed anime character databases are excluded from V1.

## 3. Functional Requirements

Priority levels: **P0** = MVP, **P1** = post-MVP social features, **P2** = possible future enhancement. Each requirement must be testable.

| ID | Priority | Feature | Requirement |
| --- | --- | --- | --- |
| FR-01 | P0 | Registration | A visitor can create an account using a unique username, email address, and password; invalid or duplicate inputs are rejected. Sign-up has two steps: (1) email, password, and confirm password, where the email is checked for availability before continuing; (2) choose a username, after which the account is created. |
| FR-02 | P0 | Authentication | A registered user can sign in and sign out; protected actions require a valid JWT. Sign-in returns a single JWT with an expiry time; sign-out removes the token on the client. |
| FR-03 | P0 | Profile | An authenticated user can view and edit their own display name, bio, and optional avatar. Username and email are shown but cannot be changed in V1. An empty display name falls back to the username. |
| FR-04 | P0 | Create character | An authenticated user can create an OC with required name and optional description, personality, abilities, backstory, and artwork. Abilities are a list; each ability can contain a list of named techniques. |
| FR-05 | P0 | Image upload | A user can upload a JPG, PNG, or WEBP image up to 2 MB for their own OC; the server validates type and size and stores Cloudinary identifiers. Replacing or removing an image deletes the old file from Cloudinary. |
| FR-06 | P0 | View character | Anyone can view a public character detail page with creator attribution and available fields. |
| FR-07 | P0 | Edit/delete | Only a character owner can update or delete their character; unauthorized requests are rejected. |
| FR-08 | P0 | Explore/search | Anyone can browse public characters in paginated results and search by character name. |
| FR-09 | P0 | My characters | Authenticated users can list and manage characters they created. |
| FR-10 | P1 | Likes | An authenticated user can like/unlike a public character; each user has at most one active like per character. Like counts are shown on the character page and on every character card. |
| FR-11 | P1 | Comments | An authenticated user can post comments (1–500 characters) on public characters; authors can delete their own comments. Comments cannot be edited, and character owners cannot delete other users' comments in V1. |
| FR-12 | P1 | Follow creators | An authenticated user can follow/unfollow another creator but cannot follow themselves. |
| FR-13 | P1 | Creator page | Anyone can view a creator profile (avatar, name, bio, character/follower/following counts) with three tabs: their public characters, their followers, and the creators they follow. |
| FR-14 | P2 | Tags and filters | Creators can add up to 10 free-form tags to a character. Anyone can filter Explore by one tag (combinable with name search), sort results by newest, oldest, or name, and pick from the 20 most-used tags. Tag conventions are listed in section 9. |
| FR-15 | P0 | Landing page | Logged-out visitors see a welcome page with a short description of CharaDex, an "Enter Anime Verse" button that opens sign-up, and a link to log in. Logged-in users are sent to their My Characters page instead. |

## 4. Data and Business Rules

The Database Design document will define exact MongoDB schemas and indexes. This SRS defines only the minimum domain rules.

- Every character belongs to exactly one registered creator.
- Character name is required; other descriptive fields may be optional.
- A character may have zero or one primary image in V1.
- The server, not the React client, must enforce ownership and permissions.
- Passwords must never be stored in plaintext or returned by APIs.
- When an image is replaced or a character is deleted, associated Cloudinary cleanup should be handled safely; failures must not expose secrets.
- Likes and follows must not create duplicate relationships.
- Deleting a character must not leave publicly visible orphan comments or likes.

## 5. External Interface Requirements

| Area | Requirement |
| --- | --- |
| **Frontend** | React with standard CSS, responsive layouts, accessible labels and form errors. |
| **Backend** | Node.js and Express REST API exchanging JSON. |
| **Database** | MongoDB through Mongoose. |
| **Media** | Cloudinary for uploaded images. |
| **Authentication** | Basic JWT authentication with secure password hashing (bcrypt). |

The implemented routes, request bodies, and responses are listed in the [API Reference](api-reference.md).

### 5.1 Authentication approach (V1)

V1 uses a simple, single-token JWT approach suitable for a learning project:

- On successful login, the server signs one JWT containing the user's ID and an expiry time (for example, 7 days).
- The client stores the token and sends it in the `Authorization: Bearer <token>` header on protected requests.
- An Express middleware verifies the token and attaches the user to the request; invalid or expired tokens receive a `401 Unauthorized` response.
- When the token expires, the user simply logs in again.
- Logout removes the token from the client and returns the user to the landing page.
- During sign-up, `POST /api/auth/check-email` lets step 1 confirm the email is not already registered before the user chooses a username.

**Not included in V1:** refresh tokens, token rotation, server-side token blacklists, or OAuth/social login. These may be revisited later.

## 6. Non-Functional Requirements

The following quality attributes apply to all releases.

| ID | Category | Requirement |
| --- | --- | --- |
| NFR-01 | Security | Hash passwords; validate all server-side input; protect private routes; never expose service secrets (including the JWT secret). |
| NFR-02 | Authorization | Reject attempts to modify another user's characters or comments. |
| NFR-03 | Usability | Common actions provide clear success, error, loading, and empty states. |
| NFR-04 | Responsive UI | Core pages remain usable on mobile and desktop screen widths. |
| NFR-05 | Performance | Use pagination for character listings; optimize image delivery and avoid unnecessary large responses. |
| NFR-06 | Reliability | Handle database, network, and image-upload failures without crashing the user interface. |
| NFR-07 | Maintainability | Separate routes, controllers, models, and frontend components; use environment variables for configuration. |
| NFR-08 | Accessibility | Use semantic HTML, keyboard-operable controls, and text alternatives for meaningful images. |

## 7. Scope Boundaries

The release boundary is intentionally small.

### 7.1 MVP (P0)

- Landing page
- Authentication (basic JWT, two-step sign-up)
- Editable user profile
- Character creation, viewing, updating, and deletion
- One primary image per character
- Public explore and name search
- Personal character list

### 7.2 Post-MVP (P1)

Likes, comments, creator following, and creator profile pages. All four are implemented (see section 11).

### 7.3 Out of scope for V1

- Drag-and-drop visual OC builder
- Real-time chat
- Notifications
- AI character generation
- Collaborative editing
- Payments
- Advanced moderation dashboard
- Complex recommendation engines
- Refresh tokens / token rotation

## 8. Acceptance Criteria / Key Scenarios

These scenarios should pass before each relevant release.

1. A visitor can open Explore and read a public character without logging in.
2. A visitor can go from the landing page through both sign-up steps, then log in and publish a character with a name.
3. The published character appears in Explore and on the creator's My Characters page.
4. The owner can edit and delete their character; another user cannot.
5. Invalid uploads and missing required fields produce understandable errors.
6. Search returns matching character names and a useful empty state for no results.
7. A request with a missing, invalid, or expired token to a protected route is rejected with `401`.
8. Sign-up step 1 rejects an already-registered email before the username step.
9. *After MVP:* a user can like once, unlike, comment, and follow another creator without duplicates.

## 9. Resolved Decisions

The open decisions from version 1.0 were resolved as follows:

| Question | Decision |
| --- | --- |
| Public-only characters or drafts? | Public-only. Drafts can be added later with a `status` field. |
| Image size/type limits | JPG, PNG, or WEBP; max 2 MB; one primary image per character. |
| Username/profile fields | Username (3–20 letters, numbers, underscores), email, display name (max 50), bio (max 300), avatar. |
| Character tags in MVP? | No. Added afterwards as FR-14 (P2) with free-form tags. |
| Tag conventions (FR-14) | Free-form, up to 10 per character, no duplicates; each 2–30 characters of letters (any language), numbers, and single spaces or hyphens between words; stored lowercase and trimmed with repeated spaces collapsed. Filtering is by one exact tag at a time. |
| Comment editing? | No. Comments can be posted and deleted only. |

### 9.1 Known limitations

- No password reset, email verification, or account deletion.
- Username and email cannot be changed after registration.
- Name search uses a case-insensitive regular expression, which is fine for a small project but not suited to very large data sets.
- Explore filters by one tag at a time; there is no "match several tags" option and no filtering by other character attributes.

## 10. Implementation Guidance

P0 requirements were built and tested first, then P1 features were added one at a time. Keep this SRS in sync with the implemented behaviour when features change.

## 11. Implementation Status

| ID | Feature | Status | Where |
| --- | --- | --- | --- |
| FR-01 | Registration (two-step) | Done | `pages/Register.jsx`, `POST /auth/register`, `POST /auth/check-email` |
| FR-02 | Authentication | Done | `context/AuthProvider.jsx`, `POST /auth/login`, `GET /auth/me` |
| FR-03 | Profile and avatar | Done | `pages/Profile.jsx`, `PUT /users/me`, `/users/me/avatar` |
| FR-04 | Create character | Done | `pages/CreateCharacter.jsx`, `POST /characters` |
| FR-05 | Image upload | Done | `components/ImagePicker.jsx`, `/characters/:id/image` |
| FR-06 | View character | Done | `pages/CharacterDetail.jsx`, `GET /characters/:id` |
| FR-07 | Edit/delete | Done | `pages/EditCharacter.jsx`, `PUT`/`DELETE /characters/:id` |
| FR-08 | Explore/search | Done | `pages/Explore.jsx`, `GET /characters` |
| FR-09 | My characters | Done | `pages/MyCharacters.jsx`, `GET /characters/mine` |
| FR-10 | Likes | Done | `components/LikeButton.jsx`, `/characters/:id/like` |
| FR-11 | Comments | Done | `components/CommentSection.jsx`, `/characters/:id/comments`, `DELETE /comments/:id` |
| FR-12 | Follow creators | Done | `components/CreatorInfo.jsx`, `/users/:username/follow` |
| FR-13 | Creator page | Done | `pages/CreatorPage.jsx`, `GET /users/:username`, `/users/:username/followers`, `/users/:username/following` |
| FR-14 | Tags and filters | Done | `components/TagInput.jsx`, `pages/Explore.jsx`, `GET /characters?tag=&sort=`, `GET /characters/tags` |
| FR-15 | Landing page | Done | `pages/Landing.jsx` |

Frontend paths are under `client/src/`; API paths are under `/api`.

All acceptance scenarios in section 8 were checked during development: each feature's API was exercised with scripted requests (including failure cases) and its pages with an automated browser run on desktop and mobile widths, in both light and dark mode.
