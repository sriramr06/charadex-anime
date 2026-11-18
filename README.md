# CharaDex

A MERN web app for creating, organizing, and discovering original characters (OCs).

Creators build structured character profiles (artwork, personality, abilities with techniques, and backstory), browse other creators' characters, and interact through likes, comments, and follows.

## Features

- **Accounts:** two-step sign-up (email and password, then username), login with a basic JWT
- **Characters:** create, edit, and delete your own characters with one artwork image each
- **Abilities editor:** a list of abilities, each with its own named techniques
- **Explore:** browse all characters with name search and pagination
- **Social:** like characters, comment on them, and follow creators
- **Creator pages:** public profile with avatar, bio, counts, and the creator's characters
- **Profile:** edit display name, bio, and avatar
- **Theme:** muted "Charcoal & Plum" palette; follows the system light/dark setting; works on mobile and desktop

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 (Vite), React Router, axios, react-icons, standard CSS |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Images | Cloudinary (uploads through multer, kept in memory) |
| Auth | JWT (single token, no refresh) and bcrypt password hashing |

## Getting started

### Requirements

- Node.js 20.19+ or 22.12+ (required by Vite and Mongoose; developed on Node 24)
- MongoDB (local or MongoDB Atlas)
- A Cloudinary account (free tier is enough)

### 1. Server

```bash
cd server
cp .env.example .env    # then fill in your values (see below)
npm install
npm run dev             # http://localhost:5000, restarts on file changes
```

### 2. Client (in a second terminal)

```bash
cd client
npm install
npm run dev             # http://localhost:5173
```

During development, the client sends `/api` requests to the server through the Vite proxy (`client/vite.config.js`), so no CORS setup is needed locally.

### Environment variables (`server/.env`)

| Variable | Example | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | Set to `production` to hide error stack traces |
| `CLIENT_URL` | `http://localhost:5173` | Allowed origin for CORS |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/charadex` | MongoDB connection string |
| `JWT_SECRET` | a long random string | Signs login tokens. Keep it secret. |
| `JWT_EXPIRES_IN` | `7d` | How long a login lasts |
| `CLOUDINARY_CLOUD_NAME` | | From your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | | From your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | | From your Cloudinary dashboard. Keep it secret. |
| `CLOUDINARY_FOLDER` | `charadex` | Optional top-level folder for uploads |

Never commit `.env`; it is listed in `.gitignore`.

## Scripts

| Folder | Command | What it does |
| --- | --- | --- |
| `server` | `npm run dev` | Start the API with auto-restart (`node --watch`) |
| `server` | `npm start` | Start the API |
| `client` | `npm run dev` | Start the React dev server |
| `client` | `npm run build` | Build the client for production into `client/dist` |
| `client` | `npm run lint` | Check the client code with oxlint |

## Project structure

```text
chardex/
├── client/                    # React frontend (Vite)
│   └── src/
│       ├── api/               # axios instance and API call helpers
│       ├── components/        # reusable UI (Navbar, CharacterCard, CharacterForm, ...)
│       ├── context/           # authentication context and provider
│       ├── hooks/             # useApi data-fetching hook
│       ├── pages/             # one file per route (Explore, CharacterDetail, Profile, ...)
│       ├── styles/theme.css   # color, spacing, and type variables (light + dark)
│       ├── utils/             # small helpers (dates, image URLs, image checks)
│       ├── App.jsx            # routes
│       ├── index.css          # global and shared styles
│       └── main.jsx
├── server/                    # Express backend
│   ├── config/                # MongoDB and Cloudinary setup
│   ├── controllers/           # request handling logic
│   ├── middleware/            # auth, upload, and error handling
│   ├── models/                # Mongoose schemas (User, Character, Like, Comment, Follow)
│   ├── routes/                # Express routers
│   ├── utils/                 # small helpers (tokens, pagination, ...)
│   ├── .env.example
│   └── server.js              # app entry point
└── docs/
```

## App pages

| Path | Page | Access |
| --- | --- | --- |
| `/` | Landing page | Logged-out visitors |
| `/register`, `/login` | Sign up / log in | Logged-out visitors |
| `/explore` | Browse and search characters | Everyone |
| `/characters/:id` | Character detail, likes, comments | Everyone |
| `/creators/:username` | Creator page with follow button | Everyone |
| `/my-characters` | Your characters | Logged in |
| `/characters/new`, `/characters/:id/edit` | Create / edit a character | Logged in |
| `/profile` | Edit your profile and avatar | Logged in |

## Documentation

| Document | Contents |
| --- | --- |
| [Project Overview](docs/project-overview-problem-statement.md) | Problem statement, goals, and scope |
| [SRS](docs/software-requirement-specifications.md) | Requirements, decisions, and implementation status |
| [Database Design](docs/database-design.md) | Collections, fields, indexes, and data rules |
| [API Reference](docs/api-reference.md) | Every endpoint with requests, responses, and errors |
