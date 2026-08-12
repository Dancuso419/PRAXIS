# Praxis — Student Union E-Voting System

## Product Requirements Document (PRD)

**Version:** 2.0
**Status:** Draft for Review

---

## 1. Product Overview

Praxis is a web-based Student Union E-Voting System designed to digitize and automate student union elections within tertiary institutions. The system provides a secure, transparent, and efficient platform for conducting elections, managing candidates, verifying voters, casting votes, and publishing election results.

The platform aims to eliminate challenges associated with traditional paper-based elections such as vote manipulation, ballot stuffing, delayed vote counting, lack of transparency, and low voter participation.

---

## 2. Problem Statement

Traditional student union elections are often characterized by:

- Manual vote counting
- Delayed result announcements
- Possibility of electoral malpractice
- High administrative workload
- Poor record management
- Limited accessibility for students

Praxis addresses these challenges by providing a secure online voting environment that automates election management and result computation, while preserving voter anonymity and providing a verifiable audit trail.

---

## 3. Product Goals

### Primary Goals

- Provide a secure, anonymous electronic voting platform
- Ensure transparency throughout the election process
- Reduce election administration workload
- Increase student participation in elections
- Deliver fast and accurate election results

### Secondary Goals

- Improve voter confidence
- Enhance election monitoring
- Maintain election records digitally
- Support future scalability for larger elections

---

## 4. Target Users

| User Type | Description |
|---|---|
| **Students (Voters)** | Students who are eligible to participate in student union elections |
| **Candidates** | Students contesting for elective positions |
| **Election Administrators** | Authorized personnel responsible for creating and managing elections |

---

## 5. User Roles & Permissions

### 5.1 Student

**Responsibilities:**
- Register account
- Verify school email
- Login securely
- View elections
- View candidates
- Read candidate manifestos
- Cast votes
- View election results
- Download own vote receipt

### 5.2 Election Officer (Standard Admin)

**Responsibilities:**
- Create and edit elections
- Manage candidates
- Manage announcements
- Monitor voter turnout
- View audit logs (read-only)

**Cannot:** activate/deactivate elections, publish final results, or modify eligibility rules without Super Admin approval.

### 5.3 Super Admin

**Responsibilities:**
- All Election Officer permissions
- Activate and deactivate elections
- Configure eligibility rules
- Publish or withhold results
- Approve or reject recount/dispute requests
- Manage Election Officer accounts
- Full audit log access (read + export)

> **Rationale:** Splitting admin privileges into two tiers prevents a single compromised or malicious account from unilaterally activating an election, altering eligibility, or publishing results — a critical control for election integrity.

---

## 6. Functional Requirements

### 6.1 User Registration

Students shall be able to register using:

- Full Name
- Matric Number
- School Email Address
- Password
- Faculty, Department, and Academic Level (captured at registration, not just at eligibility-check time)

**Requirements:**

- School email must belong to the institution domain
- Matric number must be unique and validated (format check at minimum; cross-reference against institutional records if available — see 6.9)
- Email address must be unique
- Passwords must be hashed using a strong, salted algorithm (e.g., bcrypt/argon2) — never stored in plaintext or reversible encryption

### 6.2 Email Verification

The system shall:

- Send a time-limited verification link after registration
- Activate accounts only after successful verification
- Prevent unverified users from voting
- Allow users to request a new verification link if the original expires

### 6.3 Authentication

The system shall provide:

- Login functionality
- Logout functionality
- Password reset functionality (via verified email, time-limited token)
- Session management with automatic timeout after inactivity
- Rate limiting / lockout after repeated failed login attempts

### 6.4 Election Management

**Election Officers** may create/edit election drafts. **Super Admins** must approve activation.

Election information includes:

- Election title
- Description
- Start date and time
- End date and time
- Election status (Draft, Scheduled, Active, Closed, Results Published)
- Positions contested (e.g., President, VP, Financial Secretary)
- Applicable eligibility rules (linked from 6.9)

An election cannot transition to **Active** unless: eligibility rules are set, at least one candidate exists per position, and start/end times are valid.

### 6.5 Candidate Management

Administrators shall be able to:

- Add, edit, and remove candidates
- Mark a candidate as disqualified (with reason logged) without deleting their record, to preserve audit history

Candidate information includes:

- Full Name
- Position contested
- Department
- Level
- Profile picture
- Manifesto
- Campaign slogan

### 6.6 Candidate Profile Pages

Students shall be able to:

- View candidate information
- Read manifestos
- View candidate photographs
- Compare candidates side-by-side before voting

### 6.7 Voting System

The system shall:

- Allow students to vote electronically
- Restrict voting to eligible, verified students
- Restrict voting to elections in **Active** status, within the configured time window
- Prevent duplicate voting **enforced at the database level** via a unique constraint on (student_id, election_id, position) — not merely a UI-level check
- Decouple the vote's content from the voter's identity once cast (see 6.7.1)

**Rules:**

- One vote per position
- One vote per student per election
- Votes cannot be modified or retracted after submission

#### 6.7.1 Vote Anonymity & Ballot Secrecy

To guarantee that a cast vote cannot be traced back to how a specific student voted:

- Upon submission, the vote payload (candidate selection) is separated from voter identity and stored in an independent, anonymized vote ledger
- A voter-identity record confirms **that** a student voted (for duplicate-prevention and turnout tracking) but holds **no link** to their ballot content
- The Vote Receipt ID (6.8) is a cryptographic proof-of-submission token that lets a student verify their vote was recorded, without revealing their selection to anyone — including administrators
- No administrator role, including Super Admin, shall have query access that joins voter identity to ballot content

### 6.8 Vote Confirmation

After successful voting, the system shall:

- Display a confirmation message
- Generate a unique, cryptographically signed Vote Receipt ID
- Allow the student to save/download this receipt
- Store receipt metadata (timestamp, election ID, receipt hash) for auditing — without storing the vote's content alongside voter identity

### 6.9 Eligibility Rules & Enrollment Verification

Administrators shall define voting eligibility per election based on:

- Faculty
- Department
- Academic level
- Verification status

**Eligibility check flow:**

1. At registration, the student's declared faculty/department/level is captured
2. Where institutional data is available (see Future Enhancements, Section 9), this is cross-checked against enrollment records
3. Where no institutional integration exists, eligibility is validated at **registration time**, not deferred to vote time — a student who fails eligibility checks is informed immediately, with a clear reason and an appeals contact, rather than discovering it after registering and attempting to vote

Only eligible, verified students shall be permitted to vote in a given election.

### 6.10 Election Announcements

Administrators shall be able to publish announcements such as:

- Election schedules
- Voting reminders
- Election updates
- Result announcements

Students shall view announcements from their dashboard, with unread announcements flagged.

### 6.11 Results Management

The system shall:

- Automatically count votes from the anonymized vote ledger
- Calculate winners per position (simple majority, unless configured otherwise)
- Hold results in a **pending** state after election closure until Super Admin publication
- Prevent result access (by students or Election Officers) before publication
- Support a **recount**: Super Admin can trigger a recomputation from the immutable vote ledger; recount actions are logged with initiator, timestamp, and reason

### 6.12 Dispute & Recount Process

- Candidates (or their representatives) may formally contest results through a defined dispute window (e.g., 48 hours post-publication)
- Disputes are logged with claimant, reason, and timestamp
- Super Admin reviews and may trigger a recount (6.11) or escalate to institutional electoral committee
- All dispute actions and resolutions are recorded in the audit log and visible in a results-history view

### 6.13 Voter Turnout Analytics

The system shall provide:

- Total registered/eligible voters
- Total votes cast
- Participation percentage
- Real-time turnout tracking during active elections (visible to admins only, aggregate numbers only — never partial results)

### 6.14 Audit Logging

The system shall maintain immutable, timestamped logs for:

- Election creation, edits, activation, closure
- Candidate creation, edits, disqualification
- Result computation and publication
- Recount triggers and dispute resolutions
- Administrative account actions (role changes, login attempts)

Audit logs are append-only and exportable by Super Admins for institutional review.

### 6.15 Election Countdown

Students shall be able to view:

- Time remaining before election starts
- Time remaining before election ends

---

## 7. Non-Functional Requirements

### Security

- Passwords hashed with a strong, salted algorithm (bcrypt/argon2)
- HTTPS enforced across all endpoints
- Role-based access control (Student / Election Officer / Super Admin)
- Voter identity cryptographically decoupled from ballot content (6.7.1)
- Protection against duplicate voting enforced at the database/transaction level
- Protection against common web vulnerabilities (CSRF, XSS, SQL injection)
- Rate limiting on authentication and voting endpoints

### Reliability

- Consistent, atomic vote recording (a vote is either fully recorded or not at all — no partial writes)
- Data integrity checks on the vote ledger
- Fault tolerance: system remains available during elections; documented backup/failover plan for the voting window

### Performance

- Fast page loading (target: under 2 seconds on standard connections)
- Vote submission processed and confirmed within a target response time (e.g., under 3 seconds)
- Efficient result computation, even at scale

### Usability

- Responsive design
- Mobile-friendly interface
- Simple, accessible navigation (WCAG 2.1 AA as a baseline target)

### Scalability

- System shall support concurrent voting load equal to the full eligible voter population attempting to vote within the final hours of an election window (a defined peak-load target should be set per institution, e.g., X concurrent users)

---

## 8. Success Metrics

| Metric | Target |
|---|---|
| Eligible student registration success rate | ≥ 95% complete registration without support intervention |
| Vote recording accuracy | 100% match between votes cast and votes counted (verified via audit ledger) |
| Duplicate voting incidents | 0 |
| System uptime during active election windows | ≥ 99.5% |
| Vote submission latency | < 3 seconds at peak load |
| Voter turnout (institution-defined baseline) | Increase over prior paper-based election turnout |
| Post-election disputes requiring recount | Tracked and reported per election; process completion within defined SLA (e.g., 5 business days) |

---

## 9. Future Enhancements

- Two-factor authentication
- Biometric verification
- Direct integration with institutional student information systems (SIS) for real-time enrollment/eligibility verification
- Mobile application support
- Advanced election analytics and historical trend reporting
- Independent third-party audit/verification tooling for vote ledger integrity

---

## 10. Product Name

**Praxis** — Student Union E-Voting System
