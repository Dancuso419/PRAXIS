# Praxis — Build Guide

**Stack:** React (frontend) · Node.js + Express (backend) · SQLite (database) · JWT Auth
**Scope:** Final-year project, single-developer, small-scale deployment

---

## 1. Tech Stack Summary

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React (Vite) | Fast dev server, simple build |
| Backend | Node.js + Express | REST API |
| Database | SQLite | File-based, zero setup |
| ORM | Prisma | Type-safe queries, easy migrations, works well with SQLite |
| Auth | JWT + bcrypt | Stateless auth, secure password hashing |
| Email | Nodemailer (Gmail SMTP or Mailtrap for dev) | Verification & password reset emails |
| Hosting (optional) | Render/Railway (backend) + Vercel/Netlify (frontend) | Attach persistent disk for SQLite file if deploying |

---

## 2. Project Structure

```
praxis/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── electionController.js
│   │   │   ├── candidateController.js
│   │   │   ├── voteController.js
│   │   │   ├── announcementController.js
│   │   │   └── auditController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── electionRoutes.js
│   │   │   ├── candidateRoutes.js
│   │   │   ├── voteRoutes.js
│   │   │   └── announcementRoutes.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js       # verifies JWT
│   │   │   ├── roleMiddleware.js       # checks role (student/officer/super admin)
│   │   │   └── rateLimiter.js
│   │   ├── utils/
│   │   │   ├── hashPassword.js
│   │   │   ├── sendEmail.js
│   │   │   └── generateReceipt.js
│   │   ├── prismaClient.js
│   │   └── app.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Register.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ElectionDetails.jsx
│   │   │   ├── CandidateProfile.jsx
│   │   │   ├── VoteConfirmation.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── Results.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ElectionCard.jsx
│   │   │   ├── CandidateCard.jsx
│   │   │   ├── Countdown.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── api/
│   │   │   └── axiosInstance.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 3. Database Schema (Prisma)

Key design choice: **voter identity and ballot content live in separate tables with no linking key**, so no query can join "who voted" to "what they voted for." Duplicate voting is blocked with a unique constraint.

```prisma
// prisma/schema.prisma

datasource db {
  provider = "sqlite"
  url      = "file:./praxis.db"
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  STUDENT
  ELECTION_OFFICER
  SUPER_ADMIN
}

enum ElectionStatus {
  DRAFT
  SCHEDULED
  ACTIVE
  CLOSED
  RESULTS_PUBLISHED
}

model User {
  id            String   @id @default(uuid())
  fullName      String
  matricNumber  String   @unique
  email         String   @unique
  password      String
  faculty       String
  department    String
  level         String
  role          Role     @default(STUDENT)
  isVerified    Boolean  @default(false)
  createdAt     DateTime @default(now())

  votedRecords  VoterRecord[]
}

model Election {
  id          String         @id @default(uuid())
  title       String
  description String
  startTime   DateTime
  endTime     DateTime
  status      ElectionStatus @default(DRAFT)
  createdAt   DateTime       @default(now())

  eligibility EligibilityRule?
  candidates  Candidate[]
  positions   Position[]
  voterRecords VoterRecord[]
  votes       Vote[]
}

model EligibilityRule {
  id          String   @id @default(uuid())
  electionId  String   @unique
  faculty     String?
  department  String?
  level       String?

  election    Election @relation(fields: [electionId], references: [id])
}

model Position {
  id          String   @id @default(uuid())
  title       String
  electionId  String

  election    Election @relation(fields: [electionId], references: [id])
  candidates  Candidate[]
  votes       Vote[]
}

model Candidate {
  id             String   @id @default(uuid())
  fullName       String
  department     String
  level          String
  profilePicture String?
  manifesto      String
  slogan         String?
  isDisqualified Boolean  @default(false)
  disqualifyReason String?

  electionId     String
  positionId     String

  election       Election @relation(fields: [electionId], references: [id])
  position       Position @relation(fields: [positionId], references: [id])
  votes          Vote[]
}

// Tracks THAT a student voted — no link to ballot content
model VoterRecord {
  id          String   @id @default(uuid())
  userId      String
  electionId  String
  positionId  String
  votedAt     DateTime @default(now())
  receiptHash String   @unique

  user        User     @relation(fields: [userId], references: [id])
  election    Election @relation(fields: [electionId], references: [id])

  @@unique([userId, electionId, positionId]) // enforces one vote per position per student
}

// Tracks WHAT was voted for — no link to voter identity
model Vote {
  id          String   @id @default(uuid())
  electionId  String
  positionId  String
  candidateId String
  castAt      DateTime @default(now())

  election    Election  @relation(fields: [electionId], references: [id])
  position    Position  @relation(fields: [positionId], references: [id])
  candidate   Candidate @relation(fields: [candidateId], references: [id])
}

model Announcement {
  id        String   @id @default(uuid())
  title     String
  content   String
  createdAt DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(uuid())
  action    String
  actorId   String?
  details   String?
  createdAt DateTime @default(now())
}
```

> **Note on anonymity:** `VoterRecord` proves a student voted (for duplicate prevention + turnout stats). `Vote` stores the actual ballot. Since there's no foreign key between them, no report or admin query can reconstruct who voted for whom. This is the scoped-down, SQLite-friendly version of the anonymity requirement from the PRD (6.7.1) — document this design decision in your final report.

---

## 4. Core API Endpoints

```
POST   /api/auth/register
GET    /api/auth/verify-email/:token
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/reset-password

GET    /api/elections
GET    /api/elections/:id
POST   /api/elections              (Election Officer+)
PUT    /api/elections/:id          (Election Officer+)
POST   /api/elections/:id/activate (Super Admin only)
POST   /api/elections/:id/close    (Super Admin only)

GET    /api/elections/:id/candidates
POST   /api/candidates             (Election Officer+)
PUT    /api/candidates/:id         (Election Officer+)
DELETE /api/candidates/:id         (Election Officer+)

POST   /api/vote                   (Student, one-time per position)
GET    /api/vote/receipt/:id

GET    /api/elections/:id/results
POST   /api/elections/:id/publish-results  (Super Admin only)
POST   /api/elections/:id/recount          (Super Admin only)

GET    /api/announcements
POST   /api/announcements          (Election Officer+)

GET    /api/audit-logs             (Super Admin only)
```

---

## 5. Setup Instructions

### Backend

```bash
mkdir praxis && cd praxis
mkdir backend && cd backend
npm init -y
npm install express prisma @prisma/client bcrypt jsonwebtoken nodemailer dotenv cors express-rate-limit
npm install -D nodemon

npx prisma init --datasource-provider sqlite
# paste schema above into prisma/schema.prisma
npx prisma migrate dev --name init
```

`.env`:
```
DATABASE_URL="file:./praxis.db"
JWT_SECRET=your_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PORT=5000
```

Run: `npx nodemon server.js`

### Frontend

```bash
cd ..
npm create vite@latest frontend -- --template react
cd frontend
npm install axios react-router-dom
npm run dev
```

---

## 6. Build Order (Recommended Sequence)

Build in this order so each stage is demoable and testable before moving on:

1. **Auth** — register, email verification, login, JWT middleware, role middleware
2. **Election & Candidate CRUD** — admin-only endpoints, basic admin dashboard
3. **Student-facing views** — election list, candidate profiles, countdown
4. **Voting flow** — cast vote, enforce unique constraint, generate receipt
5. **Results** — vote tallying, publish/hold logic, results page
6. **Announcements**
7. **Audit logging** — hook into every admin action from steps 2–6
8. **Polish** — turnout analytics, responsive styling, error handling

This order front-loads the riskiest/most technically interesting parts (auth, vote integrity) so you have something substantial working early, with polish items left for whatever time remains.

---

## 7. Testing Checklist

- [ ] Duplicate vote attempt is rejected (unique constraint fires)
- [ ] Unverified student cannot vote
- [ ] Vote cannot be cast outside election's active time window
- [ ] Ineligible student (wrong faculty/dept/level) is blocked at registration or vote attempt
- [ ] Results are hidden until Super Admin publishes
- [ ] No API response ever joins `VoterRecord` and `Vote` by identity
- [ ] Audit log entry created for every admin action
- [ ] Password reset and email verification tokens expire correctly

---

## 8. Deployment Notes (Optional)

- If deploying to Render/Railway: attach a **persistent volume** for `praxis.db` — SQLite is a file, and ephemeral filesystems on these platforms wipe it on redeploy
- Set environment variables (`JWT_SECRET`, `EMAIL_*`) in the platform's dashboard, not in code
- For your final report, explicitly note: *SQLite chosen for project scope; a production deployment would migrate to PostgreSQL to handle concurrent-write load during peak voting periods.*
