# Design

Visual system for Praxis. Light, calm, product-register UI. Captured from `frontend/src/index.css` (single source of truth for tokens).

## Theme

Light theme only. Soft **milky** app background (`#F4F3EE`) with **milky-white** surfaces (`#FCFBF7`, no pure `#FFFFFF`), one **emerald** brand accent, and four pastel accent families (yellow, mint, teal, lavender) used for stat cards and iconography. The mood is institutional-but-approachable: trustworthy, uncluttered, low-glare. No dark mode, no glassmorphism, no gradients on text.

## Color

Tokens are hex (not OKLCH) to preserve the existing reference-matched identity.

### Brand (Emerald)
- `--primary` `#0D7E45` — primary actions, current selection, focus, links (passes AA for white button text)
- `--primary-dark` `#09622F`
- `--primary-2` `#2FBE74` — lighter emerald, used only as the second stop in brand gradients (logos, avatars, hero)
- `--primary-light` `#E4F3EA` — milky green tint for selected/active/hover backgrounds
- `--primary-glow` `rgba(13,126,69,0.15)` — focus ring

### Semantic status
- success `#22C55E` / light `#E8FFF3`
- warning `#F5A623` / light `#FFF8E7`
- danger `#EF4444` / light `#FFF0F0`
- info `#8B5CF6` / light `#F3EEFF`

### Pastel accent families (stat cards, icon chips)
- teal `#DFF3F1` on `#0C7768` (the `--accent-blue` token — kept the name, retuned off blue)
- mint `#E8FFF3` on `#0D7A3E`
- yellow `#FFF8E7` on `#B8860B`
- lavender `#F3EEFF` on `#7C3AED`

### Surfaces (milky, no pure white)
- `--bg` `#F4F3EE` (app), `--card-bg` / `--sidebar-bg` / `--header-bg` `#FCFBF7`
- `--border` `#E7E4DA`, `--border-light` `#F0EDE5` (warm milky borders)
- Component `background: white` and inline `'white'` fills were migrated to `var(--card-bg)` so surfaces stay milky everywhere.

### Ink (contrast-tuned to pass WCAG AA)
- `--text` `#1A1D2B`
- `--text-secondary` `#464C63`
- `--text-muted` `#5F647C` — ≥4.5:1 on white and `--bg`
- `--text-light` `#767B95` — small secondary text / placeholders only

**Rule:** body and placeholder text must clear 4.5:1. The muted/light tokens were darkened specifically to satisfy this; don't lighten them back for "elegance."

## Typography

- **One family: Inter** (system-ui fallback). Product UI needs no display/body pairing.
- Base 16px, line-height 1.6. Fixed rem scale (not fluid) — headings hold their size in sidebars and panels.
- Weights: 500 (body/labels), 600–700 (headings, buttons), 800–900 (page titles, hero, stat values).
- Page titles ~1.5rem; section headings ~1.1rem; body ~0.875rem; small/meta ~0.75–0.82rem.
- Monospace (Inter fallback) for receipt hashes, vote counts, countdown values.

## Layout

- **App shell:** fixed 260px sidebar + sticky 70px header + `max-width: 1280px` content well (`28px 32px` padding).
- Responsive is **structural**, not fluid type: sidebar collapses to an off-canvas drawer under 768px (hamburger toggle + overlay); grids drop columns at 1024/768/480.
- Grids use `repeat(auto-fill/fit, minmax(...))` for elections, candidates, features, stats.
- Radii: `--radius` 14px, `-sm` 8px, `-lg` 20px, `-pill` 100px.
- Shadows: xs→lg soft neutral scale (`rgba(0,0,0,0.04–0.1)`), never harsh.

## Iconography

- **Single stroke-icon system** in `src/components/Icon.jsx` — Lucide-style, 24×24 grid, ~1.9 stroke, `currentColor`. No emoji anywhere in UI.
- Icons pair with text via a flex row (`gap: 6–8px`); color inherits or uses a semantic token (e.g. success green on active states).
- Pastel icon chips (32–34px rounded squares) tint background + text from the same accent family.

## Z-index

Semantic scale in tokens: sticky 50 · overlay 90 · sidebar 100 · dropdown 200 · modal 300 · toast 400. No arbitrary values.

## Components

Every interactive component carries default / hover / focus / active / disabled states. Highlights:

- **Buttons:** primary (indigo gradient + glow), secondary (white/border), success/warning/danger, ghost, small, logout. Icons sit inline, optically nudged −1px.
- **Global search** (`GlobalSearch.jsx`): header input → fixed dropdown of elections/announcements, keyboard-navigable (↑/↓/Enter/Esc), clear button, `popIn` entrance.
- **Notifications** (`NotificationBell.jsx`): bell + unread badge, dropdown list with unread dot/highlight, relative timestamps, empty state, `localStorage` last-seen tracking.
- **Stat cards:** pastel background, big 800-weight value in the family's ink color.
- **Cards:** elections, candidates, announcements — white, 1px border, xs shadow, lift + primary border on hover. No nested cards.
- **Tables:** admin elections/audit — uppercase muted headers, row hover, pill status badges.
- **Status emblems:** circular tinted success/error marks (verify email, vote confirmation).
- **Forms:** 1.5px borders, `--bg` fill, primary focus ring; two-column `form-row` collapsing to one on mobile.

## Motion

- 150–250ms on most transitions; ease-out curves, no bounce/elastic.
- Purposeful only: state feedback, dropdown `popIn`, hover lifts, vote-confirmation pop, stat/section fade-in.
- **Hero visual** (`HeroVisual.jsx`) is the one expressive moment — floating cards, live pulse, growing bars, ballot-drop — confined to the marketing landing page.
- **Reduced motion:** a global `@media (prefers-reduced-motion: reduce)` block near-zeroes animation/transition durations and disables the hero/dropdown choreography.
