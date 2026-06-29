# Personalized Card
> Write a message, pick a mini-game, and turn it into a little surprise for someone you love.

Live: [personalized-card-steel.vercel.app](https://personalized-card-steel.vercel.app)

---

## What it does

The sender fills out a card (recipient name, their name, a personal message, and a mini-game). The app saves the card to a database and generates a unique shareable link. The recipient opens the link, plays the mini-game to "unlock" the card, then reads the message revealed as a letter.

---

## How it works — full pipeline

```
[Sender fills form]
       │
       ▼
[Clicks "Create Card"]
       │
       ├─ Confetti loading overlay appears
       │
       ▼
POST /api/cards  (Vercel serverless function)
       │
       ├─ Validates fields (to, from, message, selectedGame)
       ├─ Generates a unique 6-character code (e.g. "k4z9xr")
       ├─ Checks Supabase to ensure the code isn't already taken
       └─ Inserts card data into Supabase → returns { code }
       │
       ▼
[Frontend receives code]
       │
       ├─ Overlay fades out
       └─ Opens preview in a new tab: /?c=k4z9xr&preview=1
              │
              ▼
       [Recipient opens share link: /?c=k4z9xr]
              │
              ▼
       GET /api/cards/:code  (Vercel serverless function)
              │
              └─ Fetches card data from Supabase
              │
              ▼
       [Gameplay view — recipient plays the mini-game]
              │
              └─ On game complete → Letter view reveals the message
```

---

## AI message helper pipeline

```
[User clicks "Write me a draft"]
       │
       ▼
POST /api/draft  (Vercel serverless function)
       │
       ├─ Receives: prompt, tone, purpose, length
       ├─ Builds a system prompt (style examples, tone, length, anti-cliché rules)
       └─ Sends to Groq API (llama-3.3-70b-versatile model)
              │
              ▼
       [AI returns message text]
              │
              ▼
       [Message fills the textarea]

       ── If /api/draft fails (Groq down, rate limit, timeout) ──
       Falls back to local template helpers in /message/*.js
```

---

## Project structure

```
/
├── index.html              — Single-page app shell (all views live here)
├── main.js                 — App logic: state, routing, form, AI draft, game loading
├── style.css               — All styling (warm cream + orange palette)
│
├── api/
│   ├── _db.js              — Supabase client (shared across API routes)
│   ├── cards.js            — POST /api/cards — saves a new card
│   ├── cards/[code].js     — GET /api/cards/:code — fetches a card by code
│   ├── draft.js            — POST /api/draft — AI message generation via Groq
│   ├── health.js           — GET /api/health — uptime check
│   └── keepalive.js        — GET /api/keepalive — DB ping that keeps Supabase awake
│
├── games/
│   ├── gameRegistry.js     — Maps game IDs to their modules
│   ├── gameBalloons.js     — Pop all balloons to unlock
│   ├── gameCatcher.js      — Catch falling objects
│   ├── gameClicker.js      — Click target a number of times
│   ├── gamePuzzle.js       — Solve a tile puzzle
│   ├── gameSimon.js        — Simon Says memory game
│   └── gameSnake.js        — Snake game
│
└── message/
    ├── helperRegistry.js   — Maps tone keys to helper modules
    ├── helperSweet.js      — "Warm & Sweet" tone templates
    ├── helperFunny.js      — "Funny" tone templates
    ├── helperMysterious.js — "Mysterious" tone templates
    ├── helperBirthday.js   — "Birthday" tone templates
    ├── helperAnniversary.js — "Anniversary" tone templates
    └── helperApology.js    — "Apology" tone templates
```

---

## Testing & automation

**Unit tests** (Jest) — cover the card API logic in `tests/`:

```bash
npm test
```

**End-to-end tests** (Playwright) — drive the full pipeline (fill form → AI draft → create card → play game → reveal letter) for **all six games**, then verify the share link works for a fresh recipient. Every run records a video.

```bash
npm run e2e          # headless, runs against production by default
npm run e2e:demo     # slow, headed walkthrough
```

| Env var | Purpose |
|---|---|
| `E2E_BASE_URL` | Target site (defaults to the live production URL) |
| `E2E_SLOWMO` | ms delay before each action (default 150; set `0` for full speed) |
| `E2E_PAUSE` | ms to hold at each milestone, for clearer demo videos |

**GitHub Actions** (`.github/workflows/`)

| Workflow | Trigger | What it does |
|---|---|---|
| `keepalive.yml` | Daily (cron) | Pings `/api/keepalive` so the free-tier Supabase project isn't auto-paused for inactivity |
| `e2e.yml` | After each successful production deploy | Runs the Playwright suite against the live site and uploads the report/videos |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript (no framework) |
| Hosting | Vercel (static + serverless functions) |
| Database | Supabase (Postgres) |
| AI | Groq API — `llama-3.3-70b-versatile` |

---

## Environment variables

| Variable | Used in |
|---|---|
| `SUPABASE_URL` | `api/_db.js` |
| `SUPABASE_KEY` | `api/_db.js` |
| `GROQ_API_KEY` | `api/draft.js` |
