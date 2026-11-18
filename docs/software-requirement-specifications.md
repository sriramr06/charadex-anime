# CharaDex — Software Requirements Specification (SRS)

**Version:** 1.0 | **Status:** Draft for review | **Date:** November 2026

**Project:** Original character creation, discovery, and community platform

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

CharaDex is a responsive browser-based application. Visitors browse public characters; registered users manage their own profiles and characters. Social features are planned after the core workflow is stable.

### 2.1 User roles

| Role | Permissions |
| --- | --- |
| **Visitor** | Browse and search public characters. |
| **Registered user** | All visitor actions, plus create, edit, and delete own characters; manage own profile. |
| **Character owner** | A registered user with permission to modify a specific character. |

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
| FR-03 | P0 | Profile | An authenticated user can view and edit their own display information and optional avatar. |
| FR-04 | P0 | Create character | An authenticated user can create an OC with required name and optional description, personality, abilities, backstory, and artwork. |
| FR-05 | P0 | Image upload | A user can upload supported image files for their own OC; the server validates type and size and stores Cloudinary identifiers. |
| FR-06 | P0 | View character | Anyone can view a public character detail page with creator attribution and available fields. |
| FR-07 | P0 | Edit/delete | Only a character owner can update or delete their character; unauthorized requests are rejected. |
| FR-08 | P0 | Explore/search | Anyone can browse public characters in paginated results and search by character name. |
| FR-09 | P0 | My characters | Authenticated users can list and manage characters they created. |
| FR-10 | P1 | Likes | An authenticated user can like/unlike a public character; each user has at most one active like per character. |
| FR-11 | P1 | Comments | An authenticated user can post comments on public characters; authors can delete their own comments. |
| FR-12 | P1 | Follow creators | An authenticated user can follow/unfollow another creator but cannot follow themselves. |
| FR-13 | P1 | Creator page | Anyone can view a creator profile and their public characters. |
| FR-14 | P2 | Advanced discovery | Users may filter by tags or character attributes after data conventions are defined. |
| FR-15 | P0 | Landing page | Logged-out visitors see a welcome page with a short description of CharaDex, an "Enter Anime Verse" button that opens sign-up, and a link to log in. Logged-in users are sent to their home page instead. |

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

Exact API routes will be specified during implementation.

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

Likes, comments, creator following, and creator profile pages. These remain project goals but are not blockers for an initial usable release.

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

## 9. Risks and Open Decisions

Before database design, confirm:

- Whether characters are public-only or support drafts
- Exact image size/type limits
- Username/profile fields
- Whether character tags are part of MVP
- Whether comment editing is needed

**Recommended default:** public-only characters, single image, simple profile fields, no tags in MVP.

## 10. Implementation Guidance

Build and test P0 requirements first, then add P1 features incrementally. Keep the SRS synchronized with implemented behavior. This document defines requirements, not database collections or final API endpoint names.
