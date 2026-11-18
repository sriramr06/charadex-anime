# CharaDex — Database Design

**Version:** 1.0 | **Status:** Draft for review | **Date:** November 2026

**Related documents:** [Project Overview](project-overview-problem-statement.md) · [SRS](software-requirement-specifications.md)

---

## 1. Introduction

This document defines the MongoDB collections, fields, validation rules, indexes, and relationships for CharaDex. It turns the domain rules in SRS section 4 into concrete Mongoose schemas.

The design favors simple, readable schemas suitable for a beginner-to-intermediate MERN project over advanced optimization.

## 2. Design Decisions

These resolve the open decisions listed in SRS section 9.

| Decision | Choice | Reason |
| --- | --- | --- |
| Character visibility | **Public-only** (no drafts) | Keeps queries and permissions simple. A `status` field can be added later. |
| Images per character | **One primary image** | Matches the SRS V1 rule. |
| Image limits | **JPG, PNG, WEBP; max 2 MB** | Common formats; small enough for fast uploads. |
| Character fields | Name, description, personality, abilities, backstory, image | Matches FR-04. No tags in MVP. |
| Abilities format | **List of abilities, each with optional techniques** | Supports characters with several powers and named techniques. |
| Likes and follows | **Separate collections** | Unique indexes prevent duplicates; demonstrates database relationships. |
| Like counts | **Counted with `countDocuments()`** | No stored counter to keep in sync. |
| Comment editing | **Not supported** (post and delete only) | Matches FR-11. |
| Profile fields | Username, display name, bio, avatar | Simple profile. |

## 3. Collections Overview

| Model | Collection | Phase | Purpose |
| --- | --- | --- | --- |
| `User` | `users` | MVP (P0) | Accounts and creator profiles |
| `Character` | `characters` | MVP (P0) | Original character profiles |
| `Like` | `likes` | Post-MVP (P1) | A user liking a character |
| `Comment` | `comments` | Post-MVP (P1) | A user's comment on a character |
| `Follow` | `follows` | Post-MVP (P1) | A user following another user |

### 3.1 Relationship diagram

```text
                 ┌──────────────┐
      follower ┌─┤    User      ├─┐ following
               │ └──────┬───────┘ │
               │        │ 1       │
               ▼        │         ▼
          ┌─────────┐   │    (same User collection)
          │ Follow  │   │
          └─────────┘   │ creator
                        │
                        ▼ many
                 ┌──────────────┐
                 │  Character   │
                 └──┬────────┬──┘
                    │ 1      │ 1
                    ▼ many   ▼ many
               ┌────────┐ ┌─────────┐
               │  Like  │ │ Comment │
               └────────┘ └─────────┘
            (user → User)  (author → User)
```

- One **User** creates many **Characters**.
- One **Character** has many **Likes** and many **Comments**.
- Each **Like** and **Comment** also references the **User** who made it.
- A **Follow** connects two **Users** (follower → following).

All relationships use **references** (`ObjectId` + `ref`) and are loaded with `.populate()` when needed.

## 4. Collection Details

All schemas use `{ timestamps: true }`, which adds `createdAt` and `updatedAt` automatically.

### 4.1 User

Stores account credentials and public profile information.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `username` | String | Yes | Unique; lowercase; trimmed; 3–20 characters; letters, numbers, and underscores only |
| `email` | String | Yes | Unique; lowercase; trimmed; valid email format |
| `password` | String | Yes | bcrypt hash only; `select: false` so it is never returned by default |
| `displayName` | String | No | Trimmed; max 50 characters |
| `bio` | String | No | Max 300 characters |
| `avatar.url` | String | No | Cloudinary secure URL |
| `avatar.publicId` | String | No | Cloudinary public ID (used to delete or replace) |
| `createdAt` / `updatedAt` | Date | Auto | From timestamps |

**Indexes:** `username` (unique), `email` (unique) — created by `unique: true`.

**Schema sketch:**

```js
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: /^[a-z0-9_]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^\S+@\S+\.\S+$/,
    },
    password: { type: String, required: true, select: false },
    displayName: { type: String, trim: true, maxlength: 50 },
    bio: { type: String, maxlength: 300 },
    avatar: {
      url: String,
      publicId: String,
    },
  },
  { timestamps: true }
);
```

**Notes:**

- Hash the password with bcrypt before saving (in the register controller or a `pre('save')` hook).
- Because of `select: false`, the login query must use `User.findOne({ email }).select('+password')`.
- Never send `password` or `email` in public API responses (e.g. on creator pages).

**Example document:**

```json
{
  "_id": "6650a1...",
  "username": "inkfox",
  "email": "inkfox@example.com",
  "password": "$2b$10$...",
  "displayName": "Ink Fox",
  "bio": "I draw sword-fighters and sky pirates.",
  "avatar": {
    "url": "https://res.cloudinary.com/.../avatar.webp",
    "publicId": "charadex/avatars/abc123"
  },
  "createdAt": "2026-11-18T10:00:00.000Z",
  "updatedAt": "2026-11-18T10:00:00.000Z"
}
```

### 4.2 Character

Stores an original character profile. Every character belongs to exactly one creator.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `name` | String | Yes | Trimmed; 1–60 characters |
| `description` | String | No | Short summary for gallery cards; max 300 characters |
| `personality` | String | No | Max 2,000 characters |
| `abilities` | Array of Ability | No | Max 20 abilities (see below) |
| `backstory` | String | No | Max 10,000 characters |
| `image.url` | String | No | Cloudinary secure URL |
| `image.publicId` | String | No | Cloudinary public ID |
| `creator` | ObjectId → `User` | Yes | Set by the server from the logged-in user, never from the request body |
| `createdAt` / `updatedAt` | Date | Auto | From timestamps |

#### Ability (embedded sub-document)

Some characters have several abilities, and an ability can contain several named techniques or forms. Abilities are therefore stored as a list, and each ability can have its own list of techniques.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `name` | String | Yes | Trimmed; max 80 characters |
| `description` | String | No | Max 1,000 characters |
| `techniques` | Array of Technique | No | Max 20 per ability |

#### Technique (embedded inside an Ability)

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `name` | String | Yes | Trimmed; max 80 characters |
| `description` | String | No | Max 1,000 characters |

Nesting stops at two levels (ability → technique). Deeper structures, such as a form with its own sub-techniques, can be written as separate techniques or explained in the description.

**Why embedded?** Abilities only belong to one character and are always shown with it, so they live inside the character document rather than in their own collection.

**Indexes:**

| Index | Purpose |
| --- | --- |
| `{ creator: 1 }` | "My Characters" and creator pages |
| `{ createdAt: -1 }` | Newest-first Explore listing |

**Schema sketch:**

```js
const techniqueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, maxlength: 1000 },
  },
  { _id: false }
);

const abilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, maxlength: 1000 },
    techniques: {
      type: [techniqueSchema],
      validate: [(arr) => arr.length <= 20, 'Too many techniques'],
    },
  },
  { _id: false }
);

const characterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, maxlength: 300 },
    personality: { type: String, maxlength: 2000 },
    abilities: {
      type: [abilitySchema],
      validate: [(arr) => arr.length <= 20, 'Too many abilities'],
    },
    backstory: { type: String, maxlength: 10000 },
    image: {
      url: String,
      publicId: String,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

characterSchema.index({ creator: 1 });
characterSchema.index({ createdAt: -1 });
```

`_id: false` keeps abilities and techniques simple: when a character is edited, the whole `abilities` array is sent and replaced.

**Example document:**

```json
{
  "_id": "6650b2...",
  "name": "Kaede Mirashi",
  "description": "A quiet captain who fights with a blade that scatters into petals.",
  "personality": "Calm, proud, and fiercely loyal to her crew.",
  "abilities": [
    {
      "name": "Hanagiri (Petal Blade)",
      "description": "Her sword can break apart into thousands of razor-thin petals.",
      "techniques": [
        { "name": "First Release: Scatter", "description": "The blade dissolves into a cloud of petals she controls." },
        { "name": "Final Release: Thousand Petal Garden", "description": "Summons countless blades that surround the battlefield." },
        { "name": "Petal Wall", "description": "Petals form a defensive barrier." }
      ]
    },
    {
      "name": "Wind Step",
      "description": "High-speed movement technique.",
      "techniques": []
    }
  ],
  "backstory": "Raised in a mountain shrine, Kaede left to ...",
  "image": {
    "url": "https://res.cloudinary.com/.../kaede.webp",
    "publicId": "charadex/characters/xyz789"
  },
  "creator": "6650a1...",
  "createdAt": "2026-11-18T10:30:00.000Z",
  "updatedAt": "2026-11-18T10:30:00.000Z"
}
```

### 4.3 Like (P1)

Records that a user likes a character. One user can have at most one like per character.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `user` | ObjectId → `User` | Yes | Set from the logged-in user |
| `character` | ObjectId → `Character` | Yes | Must be an existing character |
| `createdAt` / `updatedAt` | Date | Auto | From timestamps |

**Indexes:**

| Index | Purpose |
| --- | --- |
| `{ user: 1, character: 1 }` **unique** | Prevents duplicate likes |
| `{ character: 1 }` | Counting likes for a character |

**Schema sketch:**

```js
const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    character: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true },
  },
  { timestamps: true }
);

likeSchema.index({ user: 1, character: 1 }, { unique: true });
likeSchema.index({ character: 1 });
```

**Notes:**

- **Like:** `Like.create({ user, character })`. If it fails with error code `11000` (duplicate key), the user has already liked it.
- **Unlike:** `Like.findOneAndDelete({ user, character })`.
- **Count:** `Like.countDocuments({ character })`.
- **Has the current user liked it?** `Like.exists({ user, character })`.

### 4.4 Comment (P1)

A text comment by a user on a character. Comments can be created and deleted, but not edited.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `character` | ObjectId → `Character` | Yes | Must be an existing character |
| `author` | ObjectId → `User` | Yes | Set from the logged-in user |
| `text` | String | Yes | Trimmed; 1–500 characters |
| `createdAt` / `updatedAt` | Date | Auto | From timestamps |

**Indexes:**

| Index | Purpose |
| --- | --- |
| `{ character: 1, createdAt: -1 }` | Listing a character's comments, newest first |

**Schema sketch:**

```js
const commentSchema = new mongoose.Schema(
  {
    character: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

commentSchema.index({ character: 1, createdAt: -1 });
```

**Notes:**

- Only the comment's `author` can delete it (checked on the server).
- When listing, populate the author with only public fields: `.populate('author', 'username displayName avatar')`.

### 4.5 Follow (P1)

Records that one user follows another.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `follower` | ObjectId → `User` | Yes | The logged-in user |
| `following` | ObjectId → `User` | Yes | The creator being followed; must not equal `follower` |
| `createdAt` / `updatedAt` | Date | Auto | From timestamps |

**Indexes:**

| Index | Purpose |
| --- | --- |
| `{ follower: 1, following: 1 }` **unique** | Prevents duplicate follows; lists who a user follows |
| `{ following: 1 }` | Lists and counts a creator's followers |

**Schema sketch:**

```js
const followSchema = new mongoose.Schema(
  {
    follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    following: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ following: 1 });
```

**Notes:**

- The controller rejects requests where `follower` equals `following` (users cannot follow themselves).
- **Follower count:** `Follow.countDocuments({ following: userId })`.
- **Following count:** `Follow.countDocuments({ follower: userId })`.

## 5. Data Integrity and Cleanup Rules

| Event | Required actions |
| --- | --- |
| **Character created** | Set `creator` to `req.user.id`; ignore any `creator` sent by the client. |
| **Character updated** | Check `character.creator` equals `req.user.id` first; never allow `creator` to be changed. |
| **Character image replaced** | Upload the new image, save the new `url`/`publicId`, then delete the old image from Cloudinary. |
| **Character deleted** | Check ownership → delete the character → `Like.deleteMany({ character })` → `Comment.deleteMany({ character })` → delete its image from Cloudinary. |
| **Avatar replaced** | Upload the new avatar, save it, then delete the old one from Cloudinary. |
| **Comment deleted** | Check `comment.author` equals `req.user.id` first. |
| **Cloudinary delete fails** | Log the error on the server and continue; do not fail the request or expose Cloudinary details to the client. |

Account deletion is not part of V1, so there are no cleanup rules for deleting a user.

## 6. Common Queries

| Feature | Query (simplified) |
| --- | --- |
| Explore (paginated) | `Character.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('creator', 'username displayName avatar')` |
| Total for pagination | `Character.countDocuments(filter)` |
| Search by name | `Character.find({ name: { $regex: escapedSearch, $options: 'i' } })` + same pagination |
| Character detail | `Character.findById(id).populate('creator', 'username displayName avatar')` |
| My Characters | `Character.find({ creator: req.user.id }).sort({ createdAt: -1 })` |
| Creator page (P1) | `User.findOne({ username })` then `Character.find({ creator: user._id })` |
| Character comments (P1) | `Comment.find({ character: id }).sort({ createdAt: -1 }).populate('author', 'username displayName avatar')` |

**Notes:**

- **Pagination:** default `limit` of 12, maximum 50.
- **Explore cards:** select only the fields a card needs (`name description image creator`) so responses stay small.
- **Search input:** escape special regex characters in the user's search text before using it in `$regex`, so input like `(` or `*` doesn't break the query.
- **Case-insensitive regex:** this doesn't use an index efficiently, but it is fine at the scale of this project.

## 7. Validation Summary

Validation happens in two places:

1. **Mongoose schemas** — required fields, lengths, formats, and unique indexes (the last line of defense).
2. **Controllers** — ownership checks, self-follow checks, and request input checks before saving.

| Rule | Where enforced |
| --- | --- |
| Unique username and email | Unique index + friendly error on duplicate key (`11000`) |
| Password minimum length (8 characters) | Register controller (before hashing) |
| Image type JPG/PNG/WEBP, max 2 MB | Upload middleware (e.g. multer `fileFilter` and `limits`) |
| Character name required | Schema |
| Only owner can edit/delete a character | Controller |
| Only author can delete a comment | Controller |
| No duplicate likes/follows | Unique compound index |
| No self-follow | Controller |

## 8. Future Changes (not in V1)

These are deliberately left out and can be added later without redesigning the existing collections:

- **Drafts:** add `status: { type: String, enum: ['draft', 'public'], default: 'public' }` to Character.
- **Tags / filters (P2):** add `tags: [String]` with an index on Character.
- **Extra profile fields:** e.g. `age`, `gender`, `species` on Character.
- **Multiple images:** change `image` to `images: [{ url, publicId }]`.
- **Stored like counts:** add a `likeCount` field if counting becomes slow.
