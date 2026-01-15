# 🏃 Local Development Setup

This guide will help you run the Showdown App locally with the Netlify backend connected to your Neon PostgreSQL database.

## ✅ Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] npm 9+ installed
- [ ] Neon PostgreSQL account and database created
- [ ] Database connection string obtained
- [ ] Git repository cloned

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies

```bash
# From root directory
npm install

# Install mobile dependencies
cd mobile
npm install
cd ..
```

### 2. Configure Environment Variables

**Root `.env` file** (for Netlify Functions):
```bash
# Copy example and edit
cp .env.example .env
```

Edit `.env` and add your Neon database URL:
```env
DATABASE_URL=postgresql://username:password@ep-example.us-east-1.postgres.neon.tech/showdown_db
NODE_ENV=development
```

**Mobile `.env` file** (already created):
```env
EXPO_PUBLIC_API_URL=http://localhost:9000/api
```

### 3. Setup Database

```bash
# Run schema migration
npm run db:migrate

# Optional: Populate with sample player cards (takes 2-3 minutes)
npm run db:populate
```

### 4. Test Database Connection

```bash
npm run db:test
```

You should see:
```
✅ Database connected: { now: 2024-01-08T12:00:00.000Z }
```

### 5. Start Development Servers

```bash
# Start both mobile app and backend functions
npm run dev
```

This will start:
- **Mobile App**: http://localhost:8081 (Expo Dev Server)
- **Backend API**: http://localhost:9000 (Netlify Dev Server)

You can scan the QR code with Expo Go app to run on your phone.

## 📱 Running Mobile App

### On iOS Simulator
```bash
cd mobile
npm run ios
```

### On Android Emulator
```bash
cd mobile
npm run android
```

### On Physical Device
1. Install **Expo Go** app from App Store / Play Store
2. Scan the QR code from the terminal
3. App will load and connect to your local backend

## 🧪 Testing the Backend

### Test with curl

**Generate a card:**
```bash
curl -X POST http://localhost:9000/api/cards-generate \
  -H "Content-Type: application/json" \
  -d '{"name":"Mike Trout","year":"2021"}'
```

**Search cards:**
```bash
curl http://localhost:9000/api/cards-search?name=Trout
```

### Test from mobile app
1. Open the app in Expo Go
2. Navigate to "Generate Card" screen
3. Enter a player name and year
4. Click "Generate"
5. Card should appear with data from your Neon database

## 🔧 Available Scripts

### Development
```bash
npm run dev                 # Start mobile + functions
npm run dev:mobile          # Start mobile app only
npm run dev:functions       # Start Netlify functions only
npm run dev:functions-only  # Start functions on port 9999 (no mobile)
```

### Database
```bash
npm run db:test      # Test database connection
npm run db:migrate   # Run schema migrations
npm run db:populate  # Populate with sample cards
```

### Testing
```bash
npm test             # Run mobile app tests
npm run test:functions  # Run function tests (coming soon)
```

### Building
```bash
npm run build           # Build mobile app
npm run build:functions # Build Netlify functions
```

### Deployment
```bash
npm run deploy       # Deploy to Netlify production
```

## 🐛 Troubleshooting

### Database Connection Issues

**Error: "Connection timeout"**
- Check your `DATABASE_URL` is correct in `.env`
- Verify your Neon database is not paused (check Neon dashboard)
- Try running `npm run db:test` to diagnose

**Error: "Cannot find module 'pg'"**
```bash
npm install pg
```

### Netlify Functions Issues

**Error: "Function not found"**
- Make sure Netlify Dev is running: `npm run dev:functions`
- Verify URL pattern: `http://localhost:9000/api/cards-generate`
- Check `netlify.toml` configuration

**Functions not compiling TypeScript**
- Verify `netlify/tsconfig.json` exists
- Check `node_bundler = "esbuild"` in `netlify.toml`

### Mobile App Issues

**App can't connect to backend**
- Verify `mobile/.env` has correct API URL
- Restart Expo: Press `r` in terminal or shake device and tap "Reload"
- Ensure both services are running: `npm run dev`

**"Unable to resolve module"**
```bash
cd mobile
npm install
npx expo start --clear
```

**QR Code won't scan**
- Make sure phone and computer are on same WiFi network
- Try typing the URL manually in Expo Go app

## 📊 Verifying Setup

### 1. Check all services are running:
```bash
# Terminal 1: Should show Expo Dev Server
# Mobile app on http://localhost:8081

# Terminal 2: Should show Netlify Dev Server
# Functions on http://localhost:9000
```

### 2. Test API endpoint in browser:
```
http://localhost:9000/api/cards-generate
```
Should return: `{"error":"Method not allowed"}` (because it's a POST endpoint)

### 3. Test in mobile app:
- Open app in Expo Go
- Should see home screen without errors
- Try generating a card - should work!

## 🎯 Next Steps

Once everything is working:

1. **Read the documentation**:
   - `README.md` - Project overview
   - `ARCHITECTURE.md` - System design
   - `AGENTS.md` - Development guide
   - `netlify/README.md` - Backend API details

2. **Explore the code**:
   - `mobile/src/` - React Native app
   - `netlify/functions/` - Backend API
   - `database/schema.sql` - Database structure

3. **Make your first change**:
   - Try modifying a component in `mobile/src/components/`
   - Add a new API endpoint in `netlify/functions/`
   - Experiment with the game engine in `mobile/src/engine/`

## 💡 Tips

- **Save time**: Run `npm run db:populate` to get 20+ real player cards immediately
- **Hot reload**: Both mobile and functions support hot reload - just save your changes!
- **Debugging**: Use `console.log()` in functions - logs appear in the Netlify Dev terminal
- **Mobile debugging**: Shake device → Debug → Toggle remote debugging

## 🆘 Still Having Issues?

1. Check the [GitHub Issues](https://github.com/camriera/ShowdownApp/issues)
2. Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. Ask in [GitHub Discussions](https://github.com/camriera/ShowdownApp/discussions)

---

**You're all set! Time to build something awesome! ⚾**
