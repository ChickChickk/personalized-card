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
       ├─ Receives: to, tone, detail
       ├─ Builds a prompt string
       └─ Sends to Groq API (llama-3.1-8b-instant model)
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
│   └── health.js           — GET /api/health — uptime check
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

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript (no framework) |
| Hosting | Vercel (static + serverless functions) |
| Database | Supabase (Postgres) |
| AI | Groq API — `llama-3.1-8b-instant` |

---

## Environment variables

| Variable | Used in |
|---|---|
| `SUPABASE_URL` | `api/_db.js` |
| `SUPABASE_KEY` | `api/_db.js` |
| `GROQ_API_KEY` | `api/draft.js` |
