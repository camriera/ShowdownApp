# ⚡ Quick Reference

Essential commands and endpoints for Showdown App development.

## 🚀 Start Development

```bash
npm run dev              # Start mobile + backend (localhost)
npm run dev:tunnel       # WSL2 tunnel mode (mobile + backend + ngrok)
npm run dev:mobile       # Mobile only
npm run dev:functions    # Backend only
```

**WSL2 Users:** Use `npm run dev:tunnel` to expose services via ngrok.  
See [WSL2_TUNNEL_SETUP.md](./WSL2_TUNNEL_SETUP.md) for details.

## 🗄️ Database

```bash
npm run db:test          # Test connection
npm run db:migrate       # Create schema
npm run db:populate      # Add sample cards
```

## ✅ Verify & Test

```bash
npm run verify           # Full system check
npm test                 # Run mobile tests
```

## 📡 API Endpoints (Local)

### Generate Card
```bash
POST http://localhost:9000/api/cards-generate
Content-Type: application/json

{
  "name": "Mike Trout",
  "year": "2021"
}
```

### Search Cards
```bash
GET http://localhost:9000/api/cards-search?name=Trout&year=2021
```

## 🧪 Quick Test

```bash
curl -X POST http://localhost:9000/api/cards-generate \
  -H "Content-Type: application/json" \
  -d '{"name":"Mike Trout","year":"2021"}'
```

## 📱 Mobile URLs

- **Dev Server**: http://localhost:8081
- **API Config**: `mobile/.env`
  ```
  EXPO_PUBLIC_API_URL=http://localhost:9000/api
  ```

## 🔧 Environment Files

- **Root `.env`**: Database connection for functions
  ```
  DATABASE_URL=postgresql://...
  NODE_ENV=development
  ```

- **Mobile `.env`**: API endpoint for mobile app
  ```
  EXPO_PUBLIC_API_URL=http://localhost:9000/api
  ```

## 🐛 Common Fixes

### Mobile can't connect
```bash
# Restart Expo
cd mobile && npm start -- --clear

# Check backend is running
npm run dev:functions
```

### Database issues
```bash
npm run db:test          # Check connection
# Fix DATABASE_URL in .env if failed
```

### Function not found
```bash
# Verify URL format
http://localhost:9000/api/cards-generate
```

## 📚 Documentation

- [LOCAL_SETUP.md](./LOCAL_SETUP.md) - Complete setup guide
- [TEST_BACKEND.md](./TEST_BACKEND.md) - Backend testing
- [NPM_SCRIPTS.md](./NPM_SCRIPTS.md) - All scripts
- [netlify/README.md](./netlify/README.md) - API docs
- [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) - Setup summary

## 🎯 Project Structure

```
ShowdownApp/
├── mobile/                 # React Native app
│   └── src/
│       ├── api/           # API client (hits your backend)
│       ├── components/    # UI components
│       ├── screens/       # App screens
│       └── engine/        # Game logic
├── netlify/
│   └── functions/         # Backend API
│       ├── cards/         # Card endpoints
│       └── utils/         # Database utilities
├── database/
│   └── schema.sql         # PostgreSQL schema
└── scripts/
    └── populateCards.js   # Sample data loader
```

## 🎮 Development Workflow

1. Start everything: `npm run dev`
2. Make changes (hot reload automatic)
3. Test mobile: Open Expo Go app
4. Test backend: Use curl or mobile app
5. Check logs in terminal

## 🚢 Deploy to Production

```bash
# Setup Netlify
netlify login
netlify init

# Set environment variables in Netlify dashboard
DATABASE_URL=<your-production-neon-url>
NODE_ENV=production

# Deploy
npm run deploy

# Or use automatic GitHub deployment
git push origin main
```

## 📊 Ports

- **Mobile App**: 8081 (Expo Dev Server)
- **Backend API**: 9000 (Netlify Dev)
- **Alt Functions**: 9999 (Direct Functions Server)

## 🆘 Need Help?

```bash
npm run verify           # Diagnose issues
```

Check the docs:
- Setup issues → [LOCAL_SETUP.md](./LOCAL_SETUP.md)
- Backend issues → [TEST_BACKEND.md](./TEST_BACKEND.md)
- Script questions → [NPM_SCRIPTS.md](./NPM_SCRIPTS.md)

---

**Keep this handy while developing!** 📌
