# Praxis — Technology Stack

This document lists every technology used in Praxis and explains what it does in the
project. For how the application works, see [README.md](./README.md).

Praxis is a full stack JavaScript application. The frontend is a single page React app,
the backend is a REST API built with Express, and data is stored in a SQLite database
accessed through the Prisma ORM.

---

## Architecture at a glance

```
Browser (React SPA)  ->  REST API (Express)  ->  Prisma ORM  ->  SQLite database
        Vercel                     Render
```

The browser sends JSON requests to the API. The API authenticates each request, applies
role rules, runs the operation through Prisma, and returns JSON. The frontend is hosted on
Vercel and the backend on Render.

---

## Frontend

| Technology | Version | Use case in Praxis |
|------------|---------|--------------------|
| **React** | 19 | Builds the entire user interface as reusable components (election cards, candidate cards, the live tally, forms, the bottom navigation, dropdown menus). State and rendering are handled with React hooks. |
| **Vite** | 8 | The build tool and dev server. Provides instant hot reload during development and produces the optimised production bundle deployed to Vercel. |
| **React Router** | 7 | Handles client side routing and protected routes. Maps URLs like `/dashboard`, `/elections`, `/admin`, and `/account` to pages, and restricts routes by role. |
| **Axios** | 1 | The HTTP client used to call the backend API. A shared instance attaches the auth token to every request and redirects to login on a 401 response. |
| **React Context** | (built into React) | The `AuthContext` stores the signed in user and token, exposes `login`, `logout`, and `refreshUser`, and persists the session in `localStorage`. |
| **CSS (custom)** | plain CSS variables | A single design system in `index.css` using CSS custom properties for the green and milky white theme, spacing, radii, shadows, responsive breakpoints, and motion. No CSS framework is used. |
| **Custom SVG icons** | inline components | An `Icon` component renders a consistent stroke icon set, avoiding an external icon dependency and keeping the bundle small. |
| **oxlint** | 1 | A fast linter used to catch unused variables and common mistakes in the frontend code. |

---

## Backend

| Technology | Version | Use case in Praxis |
|------------|---------|--------------------|
| **Node.js** | 18+ | The JavaScript runtime that executes the server. |
| **Express** | 5 | The web framework that defines the REST API. It routes requests to controllers for auth, elections, candidates, voting, announcements, audit logs, and admin user management. |
| **Prisma** | 6 | The ORM and data layer. The schema in `schema.prisma` defines all models (User, Election, Position, Candidate, Vote, VoterRecord, and more). Prisma generates a typed client, runs the vote as an atomic transaction, and enforces the unique constraint that blocks double voting. |
| **@prisma/client** | 6 | The generated query client the controllers call to read and write data. |
| **SQLite** | (file based) | The database. Stored as a single file (`praxis.db`), it keeps setup simple and portable, which suits a project of this size. |
| **jsonwebtoken (JWT)** | 9 | Issues a signed token on login and verifies it on every protected request. This gives stateless authentication, so the server does not store sessions. |
| **bcryptjs** | 3 | Hashes passwords with a salt before they are stored, so plain passwords are never saved. It also verifies passwords at login and when changing a password. |
| **cors** | 2 | Controls which frontend origins may call the API. It is configured from the `FRONTEND_URL` environment variable so the deployed Vercel site is allowed. |
| **express-rate-limit** | 8 | Applies rate limiting to sensitive endpoints (login, registration, voting) to reduce brute force and abuse. |
| **nodemailer** | 9 | Sends email for account verification and password reset. Verification is currently disabled, but the integration is in place. |
| **dotenv** | 17 | Loads configuration (database URL, JWT secret, allowed origin, super admin password) from a `.env` file so secrets stay out of the code. |
| **uuid** | 14 | Generates unique identifiers where needed. |
| **nodemon** | 3 (dev) | Restarts the server automatically on file changes during development. |

---

## Security building blocks

These pieces work together to protect the election:

- **bcryptjs** keeps passwords unreadable even if the database is exposed.
- **jsonwebtoken** proves who is making each request without server side sessions.
- **Role middleware** checks the caller's role before allowing admin actions, enforcing the
  Student, Election Officer, and Super Admin boundary.
- **Prisma transactions and a unique constraint** guarantee one vote per position and keep
  the ballot separated from the voter identity.
- **express-rate-limit** and **cors** reduce abuse and restrict who can reach the API.

---

## Hosting and tooling

| Tool | Use case |
|------|----------|
| **Vercel** | Hosts the React frontend. Connected to the GitHub repository, so every push to `main` builds and deploys automatically. The backend URL is provided at build time through the `VITE_API_URL` environment variable. |
| **Render** | Hosts the Express backend as a web service. On startup it runs the seed so the accounts and demo data are available, and it reads secrets from environment variables. |
| **Git and GitHub** | Version control and the source of truth that both hosts deploy from. |

---

## Why this stack

- **One language everywhere.** JavaScript on both the frontend and backend removes context
  switching and allows shared validation logic.
- **Component driven UI.** React keeps a data heavy interface (tables, live tallies, forms)
  organised and reusable.
- **A typed data layer.** Prisma reduces the risk of malformed queries and makes the schema
  easy to evolve, while SQLite keeps the setup light for a project of this scale.
- **Stateless, standard auth.** JWT plus bcrypt is a well understood, scalable pattern that
  needs no session store.
