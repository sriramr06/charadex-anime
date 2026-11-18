# CharaDex — API Reference

**Version:** 1.0 | **Status:** Matches the implemented server | **Date:** November 2026

**Related documents:** [SRS](software-requirement-specifications.md) · [Database Design](database-design.md)

---

## 1. Basics

| Item | Value |
| --- | --- |
| Base URL (development) | `http://localhost:5000/api` (the React app calls `/api/...` through the Vite proxy) |
| Format | JSON in and out, except image uploads (`multipart/form-data`) |
| Authentication | `Authorization: Bearer <token>` header, using the JWT from register or login |
| Token lifetime | `JWT_EXPIRES_IN` (default `7d`). There are no refresh tokens; the user logs in again. |

### 1.1 Access levels

| Level | Meaning |
| --- | --- |
| **Public** | No token needed. |
| **Optional** | Works without a token. With a valid token, the response includes extra fields about the current user (e.g. `likedByMe`). An invalid token is ignored, not rejected. |
| **Private** | Needs a valid token, otherwise `401`. |
| **Owner / Author** | Private, and the current user must own the resource, otherwise `403`. |

### 1.2 Errors

Every error response has the same shape:

```json
{ "message": "Readable explanation" }
```

In development (`NODE_ENV` not `production`) a `stack` field is also included.

| Status | When |
| --- | --- |
| `400` | Missing or invalid input, validation errors, duplicate username/email, invalid id, bad JSON, bad upload |
| `401` | Missing, invalid, or expired token on a private route; wrong email or password |
| `403` | Logged in, but not the owner/author |
| `404` | Character, comment, or creator not found; unknown route |
| `500` | Unexpected server error. The message is always `"Something went wrong on the server"`; details are only logged on the server. |

### 1.3 Shared objects

**User (own account)** — returned by auth and profile endpoints:

```json
{
  "_id": "6650a1...",
  "username": "inkfox",
  "email": "ink@example.com",
  "displayName": "Ink Fox",
  "bio": "Sky pirates and swordswomen.",
  "avatar": { "url": "https://res.cloudinary.com/...", "publicId": "charadex/avatars/..." },
  "createdAt": "2026-11-18T10:00:00.000Z"
}
```

**Public user** — used for `creator` and `author` inside other objects. Never includes `email`:

```json
{ "_id": "6650a1...", "username": "inkfox", "displayName": "Ink Fox", "avatar": { "url": "...", "publicId": "..." } }
```

**Paginated list** — every list endpoint returns:

```json
{ "<items>": [ ... ], "page": 1, "totalPages": 2, "total": 14 }
```

`?page=` starts at 1. Where `?limit=` is accepted, the default is 12 and the maximum is 50.

---

## 2. Health

| Method | Path | Access | Response |
| --- | --- | --- | --- |
| GET | `/health` | Public | `200 { "status": "ok" }` |

---

## 3. Auth — `/api/auth`

### POST `/auth/register` — Public

Creates an account and logs it in.

```json
{ "username": "inkfox", "email": "ink@example.com", "password": "password123" }
```

| Rule | Error |
| --- | --- |
| All three fields required | `400` |
| Password at least 8 characters | `400` |
| Username 3–20 characters: letters, numbers, underscores (stored lowercase) | `400` |
| Valid email (stored lowercase) | `400` |
| Email or username already used | `400` |

**Response `201`:** `{ "token": "...", "user": User }`. `displayName` starts as the username as typed.

### POST `/auth/check-email` — Public

Used by step 1 of the sign-up form.

```json
{ "email": "ink@example.com" }
```

**Response `200`:** `{ "available": true }` or `{ "available": false }`. Invalid email format → `400`.

### POST `/auth/login` — Public

```json
{ "email": "ink@example.com", "password": "password123" }
```

**Response `200`:** `{ "token": "...", "user": User }`.
Missing fields → `400`. Wrong email **or** wrong password → `401 "Invalid email or password"` (same message for both).

### GET `/auth/me` — Private

Returns the logged-in user. The React app calls this on page load to check a saved token.

**Response `200`:** `{ "user": User }`.

There is **no logout endpoint**: the client simply deletes its token.

---

## 4. Characters — `/api/characters`

### GET `/characters` — Public

Explore page. Newest first.

| Query | Meaning |
| --- | --- |
| `search` | Case-insensitive match on character name (special characters are treated as plain text) |
| `page`, `limit` | Pagination |

**Response `200`:** paginated `characters`. Each item has only `name`, `description`, `image`, `creator` (public user), and `createdAt`.

### GET `/characters/mine` — Private

The logged-in user's characters, newest first, not paginated.

**Response `200`:** `{ "characters": [ { name, description, image, createdAt, updatedAt } ] }`.

### GET `/characters/:id` — Optional

**Response `200`:**

```json
{
  "character": {
    "_id": "...",
    "name": "Kaede Mirashi",
    "description": "...",
    "personality": "...",
    "abilities": [
      { "name": "Hanagiri", "description": "...", "techniques": [ { "name": "Scatter", "description": "..." } ] }
    ],
    "backstory": "...",
    "image": { "url": "...", "publicId": "..." },
    "creator": { "_id": "...", "username": "inkfox", "displayName": "Ink Fox", "avatar": {} },
    "createdAt": "...",
    "updatedAt": "..."
  },
  "likeCount": 2,
  "likedByMe": true
}
```

`likedByMe` is always `false` without a valid token. Unknown id → `404`; malformed id → `400`.

### POST `/characters` — Private

```json
{
  "name": "Kaede Mirashi",
  "description": "Optional, max 300",
  "personality": "Optional, max 2000",
  "backstory": "Optional, max 10000",
  "abilities": [
    { "name": "Required, max 80", "description": "Optional, max 1000", "techniques": [ { "name": "Required, max 80", "description": "Optional" } ] }
  ]
}
```

Only these five fields are read. `creator` is always the logged-in user; `creator` and `image` in the body are ignored. Name required and at most 60 characters; at most 20 abilities and 20 techniques per ability.

**Response `201`:** `{ "character": Character }`.

### PUT `/characters/:id` — Owner

Partial update: only the fields sent are changed. Sending `abilities` replaces the whole list. Same rules as create; a blank `name` → `400`.

**Response `200`:** `{ "character": Character }`.

### DELETE `/characters/:id` — Owner

Deletes the character, its likes, its comments, and its image on Cloudinary.

**Response `200`:** `{ "message": "Character deleted" }`.

### PUT `/characters/:id/image` — Owner

`multipart/form-data` with one file in a field named **`image`**. JPG, PNG, or WEBP, max 2 MB. Replacing an image deletes the old one from Cloudinary.

| Problem | Response |
| --- | --- |
| No file | `400 "Please choose an image to upload"` |
| Wrong type | `400 "Only JPG, PNG, or WEBP images are allowed"` |
| Over 2 MB | `400 "Image must be 2 MB or smaller"` |
| Wrong field name | `400` |
| File is not really an image | `400 "That file is not a valid image"` |

**Response `200`:** `{ "character": Character }`.

### DELETE `/characters/:id/image` — Owner

Removes the image (also from Cloudinary). No image → `400`.

**Response `200`:** `{ "character": Character }`.

---

## 5. Likes

Both endpoints are safe to repeat: liking twice or unliking twice does not create duplicates or errors. Unknown character → `404`.

| Method | Path | Access | Response `200` |
| --- | --- | --- | --- |
| POST | `/characters/:id/like` | Private | `{ "liked": true, "likeCount": 2 }` |
| DELETE | `/characters/:id/like` | Private | `{ "liked": false, "likeCount": 1 }` |

Send these **without a request body**.

---

## 6. Comments

### GET `/characters/:id/comments` — Public

Newest first, **20 per page** (`?page=`).

**Response `200`:** paginated `comments`:

```json
{ "_id": "...", "character": "...", "author": PublicUser, "text": "Love the petal blade!", "createdAt": "...", "updatedAt": "..." }
```

### POST `/characters/:id/comments` — Private

```json
{ "text": "Love the petal blade!" }
```

Text is trimmed; 1–500 characters. The author is always the logged-in user. Unknown character → `404`.

**Response `201`:** `{ "comment": Comment }` (with `author` populated).

### DELETE `/comments/:id` — Author

Only the person who wrote the comment can delete it (not the character's owner).

**Response `200`:** `{ "message": "Comment deleted" }`. Not the author → `403`; unknown comment → `404`.

---

## 7. Your profile — `/api/users/me`

### PUT `/users/me` — Private

```json
{ "displayName": "Ink Fox", "bio": "Sky pirates and swordswomen." }
```

Only these two fields are read. Display name max 50, bio max 300. An empty string removes the field. Username, email, password, and avatar cannot be changed here.

**Response `200`:** `{ "user": User }`.

### PUT `/users/me/avatar` — Private

Same upload rules and errors as character images (field name **`image`**). Replacing deletes the old avatar from Cloudinary.

**Response `200`:** `{ "user": User }`.

### DELETE `/users/me/avatar` — Private

No avatar → `400`. **Response `200`:** `{ "user": User }`.

---

## 8. Creators and following — `/api/users/:username`

`:username` is matched case-insensitively. Unknown username → `404 "Creator not found"`.

### GET `/users/:username` — Optional

```json
{
  "creator": { "_id": "...", "username": "inkfox", "displayName": "Ink Fox", "bio": "...", "avatar": {}, "createdAt": "..." },
  "followerCount": 2,
  "followingCount": 1,
  "characterCount": 14,
  "followedByMe": false
}
```

### GET `/users/:username/characters` — Public

The creator's characters, newest first. Supports `page` and `limit`.

**Response `200`:** paginated `characters` (`name`, `description`, `image`, `createdAt`).

### POST `/users/:username/follow` — Private

Following yourself → `400 "You cannot follow yourself"`. Safe to repeat.

**Response `200`:** `{ "following": true, "followerCount": 2 }`.

### DELETE `/users/:username/follow` — Private

Safe to repeat. **Response `200`:** `{ "following": false, "followerCount": 1 }`.

---

## 9. Endpoint Summary

| Method | Path | Access |
| --- | --- | --- |
| GET | `/health` | Public |
| POST | `/auth/register` | Public |
| POST | `/auth/check-email` | Public |
| POST | `/auth/login` | Public |
| GET | `/auth/me` | Private |
| GET | `/characters` | Public |
| GET | `/characters/mine` | Private |
| GET | `/characters/:id` | Optional |
| POST | `/characters` | Private |
| PUT | `/characters/:id` | Owner |
| DELETE | `/characters/:id` | Owner |
| PUT | `/characters/:id/image` | Owner |
| DELETE | `/characters/:id/image` | Owner |
| POST | `/characters/:id/like` | Private |
| DELETE | `/characters/:id/like` | Private |
| GET | `/characters/:id/comments` | Public |
| POST | `/characters/:id/comments` | Private |
| DELETE | `/comments/:id` | Author |
| PUT | `/users/me` | Private |
| PUT | `/users/me/avatar` | Private |
| DELETE | `/users/me/avatar` | Private |
| GET | `/users/:username` | Optional |
| GET | `/users/:username/characters` | Public |
| POST | `/users/:username/follow` | Private |
| DELETE | `/users/:username/follow` | Private |

Route files: `server/routes/authRoutes.js`, `characterRoutes.js`, `userRoutes.js`, `commentRoutes.js`.
