# Red Tape Translator — Runbook

## What this app does
Citizens describe their situation in plain English. Claude matches them to Indian
government schemes they qualify for and drafts their application letter.

## First-time setup

### Prerequisites
- Node.js 18+, Python 3.11+, PostgreSQL 16+ (or Docker)
- Anthropic API key, Clerk account

### Backend
```bash
cd backend
cp .env.example .env       # fill in your keys
pip install -r requirements.txt
python -m app.db.database  # creates tables (runs on startup too)
python -m app.db.seed      # seeds 25 government schemes
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
cp .env.example .env       # fill VITE_CLERK_PUBLISHABLE_KEY
npm install
npm run dev
```

### Docker (everything at once)
```bash
cp .env.example .env       # root level
docker-compose up --build
```

## Making someone an admin
```bash
# via API (requires existing admin token):
PATCH /admin/users/{user_id}/make-admin

# or directly in DB:
UPDATE users SET is_admin = true WHERE email = 'you@example.com';
```

## Adding new schemes
Edit `backend/app/db/seed.py` → add to `SCHEMES` list → re-run seed script.

## Rate limits
Default: 10 messages/minute per IP. Change `RATE_LIMIT_PER_MINUTE` in `.env`.

## Key environment variables
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | Claude API key |
| `CLERK_SECRET_KEY` | Clerk backend secret |
| `CLERK_JWT_ISSUER` | Your Clerk domain (from dashboard) |
| `RATE_LIMIT_PER_MINUTE` | API rate limit (default 10) |

## Monitoring
- Health check: `GET /health`
- Admin stats: `GET /admin/stats` (requires admin token)
- All logs via `uvicorn` stdout — pipe to Railway/Render log drain