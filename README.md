# Praxis — Student Union E-Voting System

Praxis is a web platform for running student union elections online. It lets students
register, verify their eligibility, read candidate manifestos, and cast secret ballots,
while administrators create elections, manage candidates, publish results, and keep an
audit trail. This document explains how the system works. For the technologies used and
why, see [TECH-STACK.md](./TECH-STACK.md).

---

## 1. What the system does

Praxis replaces manual, paper based student elections with a secure digital process. It
solves the common problems of paper voting: slow counting, delayed results, ballot
tampering, and poor record keeping. Every vote is counted automatically from an
anonymised ledger, and the result of each position is computed the moment an election
closes and is published.

---

## 2. User roles

The system has three roles, each with a different level of access.

| Role | What they can do |
|------|------------------|
| **Student (Voter)** | Register, sign in, browse elections, read manifestos, cast one vote per position, and view their vote receipt. |
| **Election Officer** | Create and edit elections, manage candidates, post announcements, and view the live tally and turnout. Cannot activate elections or publish results. |
| **Super Admin** | Everything an officer can do, plus activate and close elections, publish results, trigger recounts, and create or remove officer accounts. |

This split is deliberate. Separating "prepare an election" from "activate it and publish
results" means no single account can unilaterally start an election or declare a winner.

---

## 3. How a student votes (the main flow)

1. **Register.** The student signs up with their name, matric number, institutional email,
   password, faculty, department, and level.
2. **Sign in.** After registering, the student logs in. (Email verification exists in the
   system but is turned off at this stage, so accounts are active immediately.)
3. **Browse elections.** The dashboard and the Elections page show active, upcoming, and
   past elections, each with a live countdown.
4. **Review candidates.** The student opens an election, reads each candidate's manifesto
   and slogan, and can compare candidates per position.
5. **Cast the vote.** The student selects one candidate for each position and submits.
   The system checks eligibility and prevents voting twice for the same position.
6. **Get a receipt.** After voting, the student receives a unique receipt hash that proves
   their vote was recorded, without revealing who they voted for.

---

## 4. How ballot secrecy works

When a vote is submitted, the system writes two separate records in a single transaction:

- An **anonymous ballot** in the vote ledger, holding only the chosen candidate, position,
  and election. It contains no reference to the voter.
- A **voter record** that confirms the student took part (used to prevent double voting and
  to track turnout). It holds a receipt hash but no link to the ballot content.

Because these two records are stored separately, no query, not even by a Super Admin, can
trace how any individual voted. A database level unique constraint on
(student, election, position) guarantees one vote per position, enforced at the data layer
rather than only in the interface.

---

## 5. How an election is run (admin flow)

1. **Create.** An Election Officer creates an election with a title, description, start and
   end times, and a list of positions (President, Secretary, and so on).
2. **Add candidates.** Officers add candidates to each position, including manifesto and
   slogan. A candidate can be disqualified with a logged reason instead of being deleted,
   preserving history.
3. **Set eligibility (optional).** A Super Admin can restrict an election to a faculty,
   department, or level. If no rule is set, all verified students may vote.
4. **Activate.** A Super Admin activates the election. Voting is only allowed while the
   election is active and within its time window.
5. **Monitor.** Officers and Super Admins can open a **Live Tally** that shows per candidate
   counts and turnout, refreshing automatically. This view is never visible to students.
6. **Close and publish.** After the end time the election closes. A Super Admin publishes
   the results, which are computed from the vote ledger and shown ranked per position with
   the winner highlighted.
7. **Recount (if needed).** A Super Admin can trigger a recount, which recomputes the
   result from the immutable ledger and logs the action.

---

## 6. Results and transparency

- While an election is active, no one, including admins, can see the public result. Only
  the admin only live tally exposes running counts.
- Once closed and published, every student can view the final result for that election:
  each position with vote counts, percentages, and the winner.
- Every sensitive action (creating and activating elections, managing candidates,
  publishing results, recounts, and officer account changes) is written to an append only
  **audit log** for accountability.

---

## 7. Other features

- **Announcements.** Admins publish notices (schedules, reminders, results). Students see
  them on the dashboard, and unread ones are flagged by a notification bell.
- **Account settings.** Any user can update their profile and change their password.
- **User management.** A Super Admin can create and remove Election Officer accounts.
- **Responsive design.** The interface adapts to phones, with a bottom navigation bar and a
  collapsible sidebar on larger screens.

---

## 8. Accounts for testing

The database seed creates these accounts. Passwords shown are the local defaults.

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@praxis.edu` | `admin123` |
| Election Officer | `officer@praxis.edu` | `officer123` |
| Student | `student@praxis.edu` | `student123` |

---

## 9. Running it locally

```bash
# Backend
cd backend
cp .env.example .env      # set DATABASE_URL and JWT_SECRET
npm install
npm run db:seed           # create default accounts
node prisma/demo-seed.js  # optional: add demo elections
npm run dev               # http://localhost:5000

# Frontend (in a second terminal)
cd frontend
npm install
npm run dev               # http://localhost:5173
```

Open `http://localhost:5173` and sign in with one of the accounts above.
