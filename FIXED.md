# ✅ Fixed: `npm run dev` Error

## Problem
Running `npm run dev` caused port conflicts and function resolution errors.

## Root Causes
1. **Port conflict**: Netlify Dev was trying to use port 8081 (same as Expo)
2. **Function structure**: Nested `/cards/` subfolder wasn't compatible with Netlify bundler
3. **Import paths**: `../utils/db` imports failed in esbuild

## Solutions Applied

### 1. Flattened Function Structure
**Before:**
```
netlify/functions/
├── cards/
│   ├── generate.ts
│   └── search.ts
└── utils/
    └── db.ts
```

**After:**
```
netlify/functions/
├── cards-generate.ts
├── cards-search.ts
└── db.ts
```

### 2. Fixed Import Paths
Changed from `import { getPool } from '../utils/db'`  
To: `import { getPool } from './db'`

### 3. Updated API Endpoints
**Mobile app config updated** (`mobile/src/api/config.ts`):
- `/cards/generate` → `/cards-generate`
- `/cards/search` → `/cards-search`

### 4. Simplified Netlify Dev Config
**`netlify.toml`:**
```toml
[dev]
  framework = "#static"
  port = 9000
  autoLaunch = false
```

### 5. Updated Scripts
**`package.json`:**
```json
{
  "dev:mobile": "cd mobile && npm start",
  "dev:functions": "netlify dev --offline",
  "dev": "concurrently -n \"mobile,functions\" -c \"cyan,yellow\" \"npm:dev:mobile\" \"npm:dev:functions\""
}
```

## ✅ Result

**Both servers now run successfully:**

```bash
npm run dev
```

- ✅ Mobile app: `http://localhost:8081` (Expo Dev Server)
- ✅ Backend API: `http://localhost:9000` (Netlify Dev Server)

## 📡 Working API Endpoints

### Generate Card
```bash
POST http://localhost:9000/api/cards-generate

{
  "name": "Mike Trout",
  "year": "2021"
}
```

### Search Cards
```bash
GET http://localhost:9000/api/cards-search?name=Trout
```

## 🧪 Verified Working

```bash
curl "http://localhost:9000/api/cards-generate" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Mike Trout","year":"2021"}'
```

**Response:**
```json
{
  "card": {
    "id": "troutmi01-2021",
    "name": "Mike Trout",
    "year": "2021",
    "team": "LAA",
    "playerType": "Hitter",
    "points": 640,
    "imageUrl": "https://www.showdownbot.com/static/output/..."
  },
  "cached": true,
  "generatedAt": "2026-01-09T00:31:46.829Z"
}
```

## 🎯 What to Do Now

1. **Start development:**
   ```bash
   npm run dev
   ```

2. **Open Expo Go app** and scan the QR code

3. **Test in the app:**
   - Navigate to card generation
   - Enter "Mike Trout" / "2021"  
   - Click generate
   - Card should load from your Neon database!

## 📚 Updated Documentation

All docs have been updated to reflect the correct structure:
- ✅ `LOCAL_SETUP.md`
- ✅ `TEST_BACKEND.md`
- ✅ `netlify/README.md`
- ✅ `QUICK_REFERENCE.md`

## 🚀 Ready to Develop!

Your full stack is now working:
- ✅ Mobile app connects to local backend
- ✅ Backend functions compile correctly
- ✅ Database connection works
- ✅ Card generation and caching works
- ✅ Both services run in parallel with hot reload

**Happy coding!** ⚾
