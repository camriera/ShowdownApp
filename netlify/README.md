# Netlify Functions Backend

This directory contains the serverless backend functions for the Showdown App, deployed on Netlify and connected to a Neon PostgreSQL database.

## 📁 Structure

```
netlify/
├── functions/
│   ├── cards-generate.ts  # POST /api/cards-generate - Generate player cards
│   ├── cards-search.ts    # GET /api/cards-search - Search cached cards
│   └── db.ts              # PostgreSQL connection pool
└── tsconfig.json          # TypeScript configuration
```

## 🚀 Local Development

### Prerequisites

1. **Neon PostgreSQL Database**
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project
   - Copy your connection string

2. **Environment Variables**
   - Copy `.env.example` to `.env` in the root directory
   - Add your Neon database URL:
     ```bash
     DATABASE_URL=postgresql://username:password@ep-example.us-east-1.postgres.neon.tech/showdown_db
     NODE_ENV=development
     ```

### Running Locally

#### Option 1: Full Stack (Mobile + Functions)
```bash
# From root directory
npm run dev
```
This starts:
- Mobile app on port 8081
- Netlify Dev server on port 9000

#### Option 2: Functions Only
```bash
# From root directory
npm run dev:functions
```
Functions will be available at: `http://localhost:9000/api/`

#### Option 3: Direct Functions Server (no mobile)
```bash
npm run dev:functions-only
```
Functions will be available at: `http://localhost:9999/`

### Testing the Database Connection

```bash
npm run db:test
```

This will verify your `DATABASE_URL` is configured correctly.

## 📡 API Endpoints

### Generate Card
```bash
POST http://localhost:9000/api/cards-generate

Request Body:
{
  "name": "Mike Trout",
  "year": "2021",
  "setVersion": "EXPANDED"  // optional
}

Response:
{
  "card": { ... },
  "cached": false,
  "generatedAt": "2024-01-08T12:00:00.000Z"
}
```

### Search Cards
```bash
GET http://localhost:9000/api/cards-search?name=Trout&year=2021

Response:
{
  "cards": [ ... ],
  "count": 1
}
```

## 🧪 Testing with curl

### Generate a card:
```bash
curl -X POST http://localhost:9000/api/cards-generate \
  -H "Content-Type: application/json" \
  -d '{"name":"Mike Trout","year":"2021"}'
```

### Search cards:
```bash
curl http://localhost:9000/api/cards-search?name=Trout
```

## 📊 Database Schema

The functions expect the following table:

```sql
CREATE TABLE player_cards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  year VARCHAR(4) NOT NULL,
  card_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name, year)
);
```

Run migrations:
```bash
npm run db:migrate
```

Populate with sample data:
```bash
npm run db:populate
```

## 🔧 Configuration

### netlify.toml
- **Functions directory**: `netlify/functions`
- **Node bundler**: esbuild (compiles TypeScript automatically)
- **External modules**: `pg` (native PostgreSQL driver)
- **Redirects**: `/api/*` → `/api/*`

### Environment Variables

**Required:**
- `DATABASE_URL` - Neon PostgreSQL connection string

**Optional:**
- `NODE_ENV` - Set to `development` for local testing

## 🚨 Common Issues

### "Cannot find module 'pg'"
- Make sure `pg` is installed: `npm install pg`
- Verify `netlify.toml` has `external_node_modules = ["pg"]`

### "Connection timeout"
- Check your `DATABASE_URL` is correct
- Verify your Neon database is running (not paused)
- Run `npm run db:test` to diagnose

### "Function not found"
- Ensure you're using the correct URL pattern
- Local: `http://localhost:9000/api/cards-generate`
- Production: `https://your-site.netlify.app/api/cards-generate`

### Mobile app can't connect
- Verify mobile `.env` has: `EXPO_PUBLIC_API_URL=http://localhost:9000/api`
- Restart Expo after changing `.env` files
- Check that Netlify Dev is running on port 9000

## 📦 Deployment

Deploy to production:
```bash
npm run deploy
```

Or use Netlify's automatic deployment from GitHub.

### Production Environment Variables

In your Netlify dashboard, add:
- `DATABASE_URL` - Your production Neon database URL
- `NODE_ENV` - Set to `production`

## 🔗 Resources

- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [Neon PostgreSQL Docs](https://neon.tech/docs/introduction)
- [Showdownbot API](https://www.showdownbot.com/api)
