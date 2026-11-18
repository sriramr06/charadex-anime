# CharaDex — Project Overview & Problem Statement

## 1. Project Overview

CharaDex is a web-based platform for people who create original characters (OCs), including artists, writers, and fans of anime-inspired storytelling. It enables users to publish structured character profiles, organize their creations, discover other creators' characters, and interact through basic social features.

The first release focuses on character profiles built from creator-provided information and uploaded artwork. CharaDex is **not** a visual avatar generator in its initial version.

## 2. Problem Statement

Original character creators often keep character artwork, descriptions, abilities, and backstories across separate notes, folders, and general-purpose social platforms. While existing communities support sharing artwork and posts, they may not offer a simple, character-first way to present consistent profiles and browse creations in one place. As a result, creators may find it inconvenient to maintain character information, showcase their work as a collection, and discover related creations.

CharaDex addresses this organizational and discovery problem by providing structured character pages and lightweight creator-to-creator interaction. This is a proposed product opportunity, not a claim that no comparable platforms exist.

## 3. Proposed Solution

Develop a responsive MERN web application where registered users create, edit, and manage OC profiles, upload character artwork, and browse publicly shared characters. Visitors can explore profiles; authenticated users can engage through likes, comments, and following creators. Character ownership and protected operations are enforced by the backend.

## 4. Project Objectives

- Provide a centralized place to document and showcase original characters.
- Support secure user accounts and creator-owned character management.
- Enable discovery through a public character gallery and basic search.
- Encourage community interaction with likes, comments, and creator follows.
- Apply core full-stack skills: React UI, REST APIs, MongoDB modeling, authentication, and cloud image uploads.

## 5. Target Users

| User group | Description |
| --- | --- |
| **OC creators** | Artists and writers documenting original characters and their stories. |
| **Anime-inspired creators** | Fans designing original characters influenced by anime aesthetics and storytelling. |
| **Community explorers** | Visitors and registered users browsing characters and discovering creators. |

## 6. Scope

### 6.1 MVP — First working release

- Registration, login, logout, and basic creator profiles.
- Create, view, update, and delete owned character profiles.
- Character fields such as name, image, personality, abilities, and backstory.
- Upload and manage character images with Cloudinary.
- Public character gallery, character detail pages, and name search.

### 6.2 Planned extension — After MVP

- Like and comment on public characters.
- Follow and unfollow creators.
- Basic discovery filters and creator profile pages.

### 6.3 Out of scope for initial development

- Visual character builders
- AI character generation
- Direct messaging and real-time chat
- Complex recommendation engines
- Payments
- Elaborate moderation dashboards

These can be reconsidered only after the core platform is stable.

## 7. Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, standard CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Image storage | Cloudinary |
| Authentication | JWT and password hashing (bcrypt or equivalent) |
| API style | REST |

## 8. Expected Outcomes

The completed MVP should allow a user to create an account, publish and manage original character profiles with images, and explore characters through a usable responsive interface. Subsequent social features should let users engage with characters and creators without compromising character ownership or data integrity.

From a learning perspective, the project should demonstrate end-to-end implementation, basic database relationships, protected endpoints, image upload workflows, frontend state handling, and deployment readiness. Resume claims should reflect only functionality actually implemented and tested.

## 9. Assumptions and Constraints

- Creators own or have permission to upload their character images.
- The initial application is designed for a manageable learning-project audience, not production-scale traffic.
- The team/developer will prioritize understandable implementation over unnecessary libraries or architecture.
- The exact field list, permissions, validation rules, and acceptance criteria will be specified in the SRS.
- Database collections and relationships will be refined in a separate Database Design document.

## 10. Project Success Criteria

- Users can securely access their own character-management functions.
- A character can be created, displayed, updated, and deleted by its owner.
- Uploaded images appear reliably on character profiles.
- Public characters can be browsed and searched by name.
- The application works on common desktop and mobile screen sizes.
