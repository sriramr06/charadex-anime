# CharaDex

A MERN web app for creating, organizing, and discovering original characters (OCs).

See [docs/](docs/) for the project overview, SRS, and database design.

## Project structure

```text
chardex/
├── client/                 # React frontend (Vite)
│   ├── public/
│   └── src/
│       ├── api/            # axios instance and API call helpers
│       ├── components/     # reusable UI pieces (Navbar, CharacterCard, ...)
│       ├── context/        # React context (AuthContext)
│       ├── pages/          # route-level pages (Explore, Login, ...)
│       ├── App.jsx
│       ├── index.css       # global styles
│       └── main.jsx
├── server/                 # Express backend
│   ├── config/             # database and Cloudinary setup
│   ├── controllers/        # request handling logic
│   ├── middleware/         # auth, upload, and error middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── utils/              # small helper functions
│   ├── .env.example
│   └── server.js           # app entry point
└── docs/
```

## Running locally

**1. Server**

```bash
cd server
cp .env.example .env    # then fill in your values
npm install
npm run dev             # http://localhost:5000
```

**2. Client** (in a second terminal)

```bash
cd client
npm install
npm run dev             # http://localhost:5173
```

During development, the client forwards `/api` requests to the server via the Vite proxy.
