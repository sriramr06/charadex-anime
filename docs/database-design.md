# CharaDex — Database Design

**Version:** 1.2 | **Status:** Implemented (all five collections) | **Date:** November 2026

**Related documents:** [Project Overview](project-overview-problem-statement.md) · [SRS](software-requirement-specifications.md) · [API Reference](api-reference.md)

> **Changes in 1.2:** Added the Character `tags` field and index (FR-14), the Explore tag filter and sort options, and the popular-tags aggregation.
>
> **Changes in 1.1:** Updated to match the implemented code: model file locations (section 9), Cloudinary storage details (section 5.1), the extra data returned by detail and creator queries (section 6), and small behaviours such as the default display name.

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
| Character fields | Name, description, personality, abilities, backstory, image, tags | Matches FR-04. Tags were added after the MVP for FR-14. |
| Tags | **Free-form strings stored on the character** | Simple to filter with a multikey index; no separate Tag collection needed. |
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

- The password is hashed with bcrypt (10 salt rounds) in a `pre('save')` hook, only when it is new or changed. A `matchPassword()` method compares a login attempt with the hash.
- Because of `select: false`, the login query uses `User.findOne({ email }).select('+password')`.
- At registration, `displayName` is set to the username as typed (e.g. `Test_User`), while `username` itself is stored lowercase (`test_user`).
- Saving an empty display name or bio removes the field; the app then shows `@username` instead.
- `username` and `email` cannot be changed after registration in V1.
- Never send `password` or `email` in public API responses (e.g. on creator pages). Public responses use only `username displayName avatar` (plus `bio` and `createdAt` on creator pages).

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
| `description` | String | No | Trimmed; short summary for gallery cards; max 300 characters |
| `personality` | String | No | Max 2,000 characters |
| `abilities` | Array of Ability | No | Max 20 abilities (see below) |
| `backstory` | String | No | Max 10,000 characters |
| `tags` | Array of String | No | Max 10; each 2–30 characters (see Tag conventions below) |
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

#### Tag conventions (FR-14)

Rules live in `server/utils/tags.js` (with a copy in `client/src/utils/tags.js` for instant form feedback):

- Up to 10 tags per character, no duplicates.
- Each tag is 2–30 characters: letters in any language, numbers, and single spaces or hyphens between words (pattern `^[\p{L}\p{N}]+(?:[ -][\p{L}\p{N}]+)*$`).
- Before saving, the controller trims each tag, collapses repeated spaces, lowercases it, and removes empty tags and duplicates. `"  Sky   Pirate "` becomes `"sky pirate"`.
- The schema then checks the count and pattern, so bad tags are rejected with a `400`.
- `tags` must be sent as a list; a plain string is rejected.

**Indexes:**

| Index | Purpose |
| --- | --- |
| `{ creator: 1 }` | "My Characters" and creator pages |
| `{ createdAt: -1 }` | Newest-first Explore listing |
| `{ tags: 1 }` | Filtering Explore by tag (a multikey index: MongoDB indexes each tag in the array) |

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
    description: { type: String, trim: true, maxlength: 300 },
    personality: { type: String, maxlength: 2000 },
    abilities: {
      type: [abilitySchema],
      validate: [(arr) => arr.length <= 20, 'Too many abilities'],
    },
    backstory: { type: String, maxlength: 10000 },
    tags: {
      type: [String],
      validate: [
        { validator: (arr) => arr.length <= 10, message: 'At most 10 tags' },
        { validator: (arr) => arr.every(isValidTag), message: 'Invalid tag' },
      ],
    },
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
characterSchema.index({ tags: 1 });
```

`_id: false` keeps abilities and techniques simple: when a character is edited, the whole `abilities` array is sent and replaced.

Only `name`, `description`, `personality`, `abilities`, `backstory`, and `tags` can be set from a request body. `creator` comes from the logged-in user and `image` is only changed through the image upload endpoints. Before saving, the React form trims text and drops completely empty ability and technique rows.

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
  "tags": ["sky pirate", "swordswoman", "magic-user"],
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

- Only the comment's `author` can delete it (checked on the server). The character's owner cannot delete other people's comments in V1.
- When listing, populate the author with only public fields: `.populate('author', 'username displayName avatar')`.
- Comments are listed 20 per page, newest first.

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
- Creators are looked up by username in the URL (`/api/users/:username/follow`), not by id.
- **Follow:** `Follow.create(...)`; a duplicate-key error (`11000`) means already following and is treated as success.
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

### 5.1 Image storage (Cloudinary)

MongoDB stores only `{ url, publicId }` for each image. The files themselves live on Cloudinary.

| Item | Value |
| --- | --- |
| Character images | `<CLOUDINARY_FOLDER>/characters/` |
| Avatars | `<CLOUDINARY_FOLDER>/avatars/` |
| Root folder | `CLOUDINARY_FOLDER` environment variable, default `charadex` |
| Accepted files | JPG, PNG, WEBP up to 2 MB (checked in the browser and again by multer on the server) |
| On upload | Images larger than 1200 × 1200 are shrunk (aspect ratio kept); quality is set automatically |
| On display | The client adds size options to the URL: cards `c_fill,w_400,h_500`, detail `c_limit,w_800`, avatars `c_fill,w_320,h_320`, all with `f_auto,q_auto` |

Files are kept in memory during upload (multer `memoryStorage`) and streamed straight to Cloudinary; nothing is written to the server's disk.

## 6. Common Queries

| Feature | Query (simplified) |
| --- | --- |
| Explore (paginated) | `Character.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('creator', 'username displayName avatar')` |
| Total for pagination | `Character.countDocuments(filter)` |
| Search by name | `Character.find({ name: { $regex: escapedSearch, $options: 'i' } })` + same pagination |
| Filter by tag (FR-14) | `Character.find({ tags: 'sky pirate' })`; combines with the name search in one filter object |
| Sort (FR-14) | `newest` `{ createdAt: -1, _id: -1 }`, `oldest` `{ createdAt: 1, _id: 1 }`, `name` `{ name: 1, _id: 1 }` with `.collation({ locale: 'en', strength: 2 })` so A–Z ignores upper/lower case |
| Popular tags (FR-14) | `Character.aggregate([{ $unwind: '$tags' }, { $group: { _id: '$tags', count: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }, { $limit: 20 }])` |
| Character detail | `Character.findById(id).populate('creator', 'username displayName avatar')`, plus `Like.countDocuments({ character })` and, when logged in, `Like.exists({ character, user })` |
| My Characters | `Character.find({ creator: req.user.id }).select('name description image createdAt updatedAt').sort({ createdAt: -1 })` |
| Creator page (P1) | `User.findOne({ username })`, plus three counts (followers, following, characters) and, when logged in, `Follow.exists({ follower, following })` |
| Creator's characters (P1) | `Character.find({ creator: user._id }).select('name description image createdAt')` + pagination |
| Character comments (P1) | `Comment.find({ character: id }).sort({ createdAt: -1 }).populate('author', 'username displayName avatar')`, 20 per page |

**Notes:**

- **Pagination:** default `limit` of 12, maximum 50 (shared helper in `server/utils/pagination.js`). Comments use a fixed 20 per page.
- **Independent queries run together** with `Promise.all`, e.g. the page of results and the total count.
- **Explore cards:** select only the fields a card needs (`name description image tags creator createdAt`) so responses stay small.
- **Sort ties:** `_id` is added as a second sort key so items with the same date or name never appear on two pages.
- **Indexes are created when the server starts.** If the database is wiped while the server is running, restart the server so the unique and tag indexes are rebuilt.
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
| Image type JPG/PNG/WEBP, max 2 MB | Upload middleware (multer `fileFilter` and `limits`); also checked in the browser |
| File is a real image | Cloudinary rejects non-images; the controller turns this into a `400` |
| Character name required | Controller (blank names) + schema |
| Abilities and techniques need names; max 20 each | Schema (also checked by the React form) |
| Tags: a list, max 10, each 2–30 valid characters | Controller (list check, cleanup) + schema (count, pattern); also checked by the tag input |
| Comment text 1–500 characters | Controller (blank text) + schema |
| Profile edit changes only display name and bio | Controller |
| Only owner can edit/delete a character | Controller |
| Only author can delete a comment | Controller |
| No duplicate likes/follows | Unique compound index |
| No self-follow | Controller |

Mongoose validation errors, duplicate keys, invalid ids, upload errors, and bad JSON are all turned into `400` responses with readable messages by the central error handler (`server/middleware/errorMiddleware.js`). Unexpected errors return `500` with a generic message; details are only logged on the server.

## 8. Future Changes (not in V1)

These are deliberately left out and can be added later without redesigning the existing collections:

- **Drafts:** add `status: { type: String, enum: ['draft', 'public'], default: 'public' }` to Character.
- **More filters:** matching several tags at once (`{ tags: { $all: [...] } }`) or filtering by other character attributes.
- **Extra profile fields:** e.g. `age`, `gender`, `species` on Character.
- **Multiple images:** change `image` to `images: [{ url, publicId }]`.
- **Stored like counts:** add a `likeCount` field if counting becomes slow.
- **Like counts on cards:** Explore cards do not show likes yet; this would need counts for many characters at once (an aggregation or a stored counter).
- **Account deletion:** would need cleanup of the user's characters (and their images, likes, comments), the user's own likes, comments, follows, and avatar.

## 9. Implementation Files

| Model | File |
| --- | --- |
| User | `server/models/User.js` |
| Character (with Ability and Technique sub-schemas) | `server/models/Character.js` |
| Like | `server/models/Like.js` |
| Comment | `server/models/Comment.js` |
| Follow | `server/models/Follow.js` |

The endpoints that use these models are listed in the [API Reference](api-reference.md).
