# Product

## Register

product

## Users

Three roles inside a tertiary-institution student union election:

- **Students (voters)** — verified students on their own devices, usually on mobile, often during a short voting window. Their job: find the active election, read manifestos, and cast one vote per position with confidence it was recorded and kept secret.
- **Election Officers (standard admins)** — create and edit election drafts, manage candidates and announcements, and monitor turnout. Cannot activate elections or publish results.
- **Super Admins** — everything Officers can do, plus activate/close elections, set eligibility, publish/withhold results, trigger recounts, and access the full audit log.

Context is high-stakes and time-bounded: an election window is a peak-load moment where trust and clarity matter more than flourish.

## Product Purpose

Praxis digitizes student union elections end to end — registration, email verification, eligibility, candidate management, secure anonymous voting, cryptographic vote receipts, results publication, recounts, disputes, and an immutable audit trail. It exists to eliminate the failure modes of paper elections (manual counting, delayed results, malpractice, poor records) while preserving ballot secrecy and providing a verifiable audit trail.

Success = eligible students register and vote without support, zero duplicate votes, 100% count accuracy against the ledger, and results students and candidates trust.

## Brand Personality

**Trustworthy · Clear · Calm.**

The voice is institutional and reassuring, not salesy. Copy states what happens and why (especially around security, anonymity, and eligibility). The interface should feel like sanctioned election infrastructure that gets out of the way — confidence through restraint, never hype. Delight is reserved for meaningful moments (a cast vote, a verified receipt), never scattered decoration.

## Anti-references

- **Generic AI SaaS** — emoji icons, gradient-text headings, identical icon-card grids, hero-metric templates. The "AI made this" default.
- **Crypto / "blockchain voting"** — dark neon, hexagons, decorative glassmorphism, techno-hype. Reads speculative, not trustworthy.
- **Playful / gamified** — cartoon mascots, badges, confetti everywhere. Undercuts the seriousness of a real election.

## Design Principles

1. **Trust is the interface.** Every screen should make the integrity of the process legible — status, eligibility, anonymity, receipts — without shouting.
2. **Calm under load.** The busiest moment is the final voting hour. Prioritize clarity, fast feedback, and unambiguous state over choreography.
3. **Say it plainly.** Security and eligibility copy explains the "why" in human terms; no jargon, no fear, no hype.
4. **Earned familiarity.** Standard, predictable affordances (tables, forms, side nav) beat invented ones. The tool disappears into the task.
5. **Restraint with intent.** One accent, consistent iconography, purposeful color. Delight only at moments that matter (vote cast, receipt verified).

## Accessibility & Inclusion

- **WCAG 2.1 AA** baseline target (from the PRD).
- Body/placeholder text meets ≥4.5:1 contrast; muted tokens were tuned to pass on light surfaces.
- Full `prefers-reduced-motion` support — decorative motion (hero float, live pulse, dropdown pops) collapses to instant/crossfade.
- Keyboard-operable interactive surfaces (global search and notifications support arrow/Enter/Escape).
- Responsive, mobile-first behavior for voters on phones.
