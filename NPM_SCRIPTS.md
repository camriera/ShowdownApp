# 📜 NPM Scripts Reference

Quick reference for all available npm scripts in the Showdown App project.

## 🚀 Development

### Start Full Stack
```bash
npm run dev
```
Starts both mobile app (port 8081) and Netlify functions (port 8888) concurrently with colored output.

### Mobile App Only
```bash
npm run dev:mobile
```
Starts Expo development server for the React Native app.
- Opens on `http://localhost:8081`
- Displays QR code for Expo Go app
- Supports hot reload

### Backend Functions Only
```bash
npm run dev:functions
```
Starts Netlify Dev server with functions.
- Functions available at `http://localhost:8888/.netlify/functions/`
- Auto-compiles TypeScript with esbuild
- Supports hot reload

### Backend Functions (Direct)
```bash
npm run dev:functions-only
```
Starts Netlify Functions server directly on port 9999.
- Functions available at `http://localhost:9999/`
- Useful when mobile app isn't needed

## 🗄️ Database

### Test Connection
```bash
npm run db:test
```
Verifies your `DATABASE_URL` is configured correctly.
- Connects to Neon PostgreSQL
- Runs `SELECT NOW()` query
- Shows ✅ or ❌ with error details

### Run Migrations
```bash
npm run db:migrate
```
Creates database schema from `database/schema.sql`.
- Creates `player_cards` table
- Sets up indexes
- **Requires**: `psql` installed and `$DATABASE_URL` set

### Populate Sample Data
```bash
npm run db:populate
```
Fetches 20+ popular MLB player cards from showdownbot.com and saves to database.
- Takes 2-3 minutes to complete
- Includes players like Mike Trout, Aaron Judge, etc.
- **Requires**: Database schema already migrated

## 🧪 Testing

### Mobile App Tests
```bash
npm test
```
Runs Jest tests for the mobile app.
- Tests components, game engine, and utilities
- Runs in watch mode by default

### Function Tests
```bash
npm run test:functions
```
Placeholder for backend function tests (coming soon).

## 🏗️ Building

### Build Mobile App
```bash
npm run build
```
Builds the mobile app for production.
- Creates optimized bundle
- Output in `mobile/dist/`

### Build Functions
```bash
npm run build:functions
```
Builds Netlify functions for deployment.
- Compiles TypeScript
- Bundles dependencies

## 🚢 Deployment

### Deploy to Production
```bash
npm run deploy
```
Deploys to Netlify production environment.
- Builds and uploads functions
- **Requires**: Netlify CLI authenticated
- **Tip**: Use Netlify's GitHub integration for automatic deployments

## 🔍 Code Quality

### Lint Mobile App
```bash
npm run lint
```
Runs ESLint on mobile app code.
- Checks for code style issues
- Reports errors and warnings

## 📦 Installation

### Install All Dependencies
```bash
npm install
```
Installs dependencies for root project (functions, database tools).

### Install Mobile Dependencies
```bash
cd mobile && npm install
```
Installs dependencies for React Native mobile app.

### Install Everything
```bash
npm install && cd mobile && npm install && cd ..
```
One-liner to install all dependencies.

## 🎯 Common Workflows

### First Time Setup
```bash
npm install && cd mobile && npm install && cd ..
npm run db:test
npm run db:migrate
npm run db:populate
npm run dev
```

### Daily Development
```bash
npm run dev  # Start everything
# OR
npm run dev:mobile     # Terminal 1
npm run dev:functions  # Terminal 2
```

### Test Backend API
```bash
npm run dev:functions  # Start backend
npm run db:test        # Verify database
# Then test with curl or mobile app
```

### Refresh Database
```bash
npm run db:migrate     # Recreate schema
npm run db:populate    # Reload sample data
```

### Before Committing
```bash
npm run lint           # Check code style
npm test               # Run tests
```

## 💡 Script Tips

### Concurrently Options
The `dev` script uses `concurrently` with:
- `-n "mobile,functions"` - Names for each process
- `-c "cyan,yellow"` - Colors for output
- Kills all processes when one exits (default behavior)

### Environment Variables
Scripts automatically load from:
- `.env` in root (for functions and database)
- `mobile/.env` (for mobile app)

### Debugging
Add `DEBUG=*` prefix to see verbose logs:
```bash
DEBUG=* npm run dev:functions
```

### Port Conflicts
If ports are in use:
- Mobile: Edit `mobile/package.json` scripts
- Functions: Edit `package.json` dev:functions script
- Update `mobile/.env` with new function port

## 📋 Script Summary Table

| Script | Purpose | Output |
|--------|---------|--------|
| `dev` | Start full stack | Mobile (8081) + Functions (8888) |
| `dev:mobile` | Start mobile only | Expo server (8081) |
| `dev:functions` | Start backend only | Netlify Dev (8888) |
| `dev:functions-only` | Start functions direct | Functions server (9999) |
| `db:test` | Test DB connection | ✅ or ❌ with timestamp |
| `db:migrate` | Run migrations | Creates tables |
| `db:populate` | Load sample data | 20+ player cards |
| `test` | Run mobile tests | Jest test results |
| `build` | Build mobile app | `mobile/dist/` |
| `build:functions` | Build functions | `.netlify/` |
| `deploy` | Deploy to production | Netlify deployment |
| `lint` | Lint mobile code | ESLint results |

## 🆘 Troubleshooting Scripts

### "Command not found"
Make sure you're in the root directory of the project.

### "Module not found"
Run `npm install` in root and `cd mobile && npm install`.

### Port already in use
Kill processes using ports 8081 or 8888:
```bash
lsof -ti:8081 | xargs kill
lsof -ti:8888 | xargs kill
```

### Database scripts fail
- Check `DATABASE_URL` in `.env`
- Verify `psql` is installed for `db:migrate`
- Run `npm run db:test` first

---

**Pro tip**: Add these to your shell aliases for faster access!
```bash
alias sd-dev="npm run dev"
alias sd-mobile="npm run dev:mobile"
alias sd-api="npm run dev:functions"
alias sd-db="npm run db:test"
```
