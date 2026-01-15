# 🔧 Common Errors & Solutions

## Edge Functions Error (Safe to Ignore)

### Error Message
```
✖ Setting up the Edge Functions environment. This may take a couple of minutes.
 ›   Error: There was a problem setting up the Edge Functions environment. 
     To try a manual installation, visit https://ntl.fyi/install-deno.
```

### Why It Happens
Netlify Dev tries to set up **Edge Functions** (Deno runtime) automatically. Edge Functions are a different type of serverless function that run on Deno instead of Node.js.

### Why It's Safe to Ignore
- ✅ **Your functions still work perfectly** - They're Node.js functions, not Edge Functions
- ✅ **API calls succeed** - The error doesn't affect your app
- ✅ **This is just a warning** - Netlify Dev continues running normally

### Verify Your Functions Work
Despite the error, test that everything works:

```bash
curl "http://localhost:9000/api/cards-generate" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Mike Trout","year":"2021"}'
```

**Expected result:** You get card data back! ✅

### If You Want to Fix It (Optional)

The error happens because Deno isn't installed in your WSL2 environment. If you want to eliminate the error message:

**Option 1: Install Deno (Recommended)**
```bash
curl -fsSL https://deno.land/install.sh | sh
```

Then add to your `~/.bashrc` or `~/.zshrc`:
```bash
export DENO_INSTALL="$HOME/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"
```

Reload shell:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

**Option 2: Just Ignore It**
Your app works fine without Deno. The error is cosmetic only.

---

## Port Already in Use

### Error Message
```
[mobile] › Port 8081 is running this app in another window
```

### Solution
Kill the existing processes:

```bash
lsof -ti:8081 | xargs kill -9
lsof -ti:9000 | xargs kill -9
```

Or use `pkill`:
```bash
pkill -9 -f expo
pkill -9 -f netlify
```

Then restart:
```bash
npm run dev
```

---

## Database Connection Failed

### Error Message
```
❌ Database error: Connection timeout
```

### Solutions

**1. Check DATABASE_URL in .env:**
```bash
cat .env | grep DATABASE_URL
```

**2. Test connection:**
```bash
npm run db:test
```

**3. Verify Neon database is active:**
- Go to https://neon.tech dashboard
- Check if your database is paused (free tier auto-pauses after inactivity)
- Click to wake it up if needed

**4. Check firewall:**
```bash
# Test if you can reach Neon
curl -v https://ep-your-project.us-east-1.postgres.neon.tech 2>&1 | grep "Connected"
```

---

## Function Not Found (404)

### Error Message
```
Function not found...
```

### Solutions

**1. Check you're using the correct URL:**

**Local development:**
```
http://localhost:9000/api/cards-generate
```

**Production:**
```
https://your-site.netlify.app/api/cards-generate
```

Note: `/api/*` redirects to `/api/*` in production (see `netlify.toml`)

**2. Verify function files exist:**
```bash
ls netlify/functions/
# Should show: cards-generate.ts, cards-search.ts, db.ts
```

**3. Check Netlify Dev is running:**
```bash
ps aux | grep netlify
```

**4. Restart Netlify Dev:**
```bash
pkill -f netlify
npm run dev:functions
```

---

## Mobile App Can't Connect to Backend

### Symptoms
- App loads but card generation fails
- Network errors in console
- "Failed to fetch" errors

### Solutions

**1. Check mobile .env file:**
```bash
cat mobile/.env
```

Should show:
```
EXPO_PUBLIC_API_URL=http://localhost:9000/api
```

Or for WSL2 tunnel mode:
```
EXPO_PUBLIC_API_URL=https://xxxx.ngrok-free.app/api
```

**2. Restart Expo after changing .env:**
Press `r` in Expo terminal, or shake device and tap "Reload"

**3. Verify backend is running:**
```bash
curl http://localhost:9000/api/cards-generate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Mike Trout","year":"2021"}'
```

**4. For WSL2 - Use tunnel mode:**
```bash
npm run dev:tunnel
```

---

## ngrok Tunnel Fails (WSL2)

### Error Message
```
❌ Failed to start tunnel: authtoken required
```

### Solution

**1. Get ngrok authtoken:**
- Sign up: https://ngrok.com
- Get token: https://dashboard.ngrok.com/get-started/your-authtoken

**2. Add to root .env:**
```bash
echo 'NGROK_AUTHTOKEN=your_token_here' >> .env
```

**3. Restart tunnel:**
```bash
npm run dev:tunnel
```

### Error: Tunnel connection failed

**Check ngrok limits:**
- Free tier: 1 tunnel, 40 connections/minute
- If exceeded, wait or upgrade plan

**Restart everything:**
```bash
pkill -9 -f netlify && pkill -9 -f expo && pkill -9 -f node
npm run dev:tunnel
```

---

## Expo Tunnel Fails (WSL2)

### Error Message
```
Tunnel connection failed
```

### Solutions

**1. Login to Expo:**
```bash
npx expo login
```

**2. Clear Expo cache:**
```bash
cd mobile
npx expo start -c --tunnel
```

**3. Check your network:**
Expo tunnels may not work on some corporate/school networks. Try:
- Different WiFi network
- Mobile hotspot
- VPN

---

## TypeScript Errors

### Error in functions:
```
ERROR: Could not resolve "../utils/db"
```

### Solution
This was fixed by flattening the function structure. If you see this:

**Check function imports:**
```bash
grep "from './db'" netlify/functions/cards-*.ts
```

Should show:
```typescript
import { getPool } from './db';
```

NOT:
```typescript
import { getPool } from '../utils/db';  // ❌ Wrong
```

---

## Concurrently Errors

### All processes stop when one fails

This is expected behavior. If Expo or Netlify Dev crashes, all processes stop.

**Solutions:**

**1. Run separately for debugging:**
```bash
# Terminal 1
npm run dev:mobile

# Terminal 2
npm run dev:functions
```

**2. Check logs to see which failed:**
```
[mobile] npm run dev:mobile exited with code 1
```

Then debug that specific service.

---

## Verification Script Fails

### Running `npm run verify` shows errors

**Fix each issue one by one:**

```bash
npm run verify
```

Common issues:
- Missing .env file → `cp .env.example .env`
- Missing dependencies → `npm install && cd mobile && npm install`
- Database not connected → Check `DATABASE_URL` in `.env`

---

## Still Having Issues?

1. **Check all processes are stopped:**
   ```bash
   pkill -9 -f expo && pkill -9 -f netlify
   ```

2. **Verify setup:**
   ```bash
   npm run verify
   ```

3. **Start fresh:**
   ```bash
   npm run dev
   ```

4. **Check documentation:**
   - [LOCAL_SETUP.md](./LOCAL_SETUP.md)
   - [TEST_BACKEND.md](./TEST_BACKEND.md)
   - [WSL2_TUNNEL_SETUP.md](./WSL2_TUNNEL_SETUP.md)

5. **Enable debug mode:**
   ```bash
   DEBUG=* npm run dev
   ```

---

**Most errors are due to port conflicts or environment variables. Check these first!** 🔍
