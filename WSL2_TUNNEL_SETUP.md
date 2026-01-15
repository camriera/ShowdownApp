# 🌐 WSL2 Tunnel Mode Setup

If you're running this app in WSL2 and need to access it from your phone, you'll need to use tunnel mode for both Expo and Netlify Functions.

## Why Tunneling?

WSL2 networking is isolated from Windows, making `localhost` on your phone unable to reach WSL2 services. Tunneling exposes your local servers via public URLs.

## 🚀 Quick Start

### Option 1: One Command (Recommended)
```bash
npm run dev:tunnel
```

This starts:
- 📱 Expo with `--tunnel` mode
- 🔧 Netlify Functions on localhost:9000
- 🌐 ngrok tunnel exposing functions publicly

### Option 2: Manual Control

**Terminal 1 - Functions:**
```bash
npm run dev:functions
```

**Terminal 2 - ngrok Tunnel:**
```bash
npm run tunnel:functions
```

**Terminal 3 - Expo Tunnel:**
```bash
npm run dev:mobile:tunnel
```

## 📋 Prerequisites

### 1. ngrok Setup (Required)

ngrok provides the public tunnel for your Netlify Functions.

**Sign up and get auth token:**
1. Go to https://ngrok.com and sign up (free tier is fine)
2. Get your authtoken: https://dashboard.ngrok.com/get-started/your-authtoken
3. Add to your root `.env` file:
   ```bash
   NGROK_AUTHTOKEN=your_token_here_2xxxxxxxxxxxxxxxx
   ```

**Or set as environment variable:**
```bash
export NGROK_AUTHTOKEN=your_token_here
```

### 2. Expo Account (Usually Already Set Up)

Expo tunnel mode requires an Expo account:
```bash
npx expo login
```

## 🎯 How It Works

### Without Tunnel (Local Only)
```
Phone ❌ → WSL2 localhost:9000 (can't reach)
Expo  ❌ → WSL2 localhost:8081 (can't reach from Windows)
```

### With Tunnel
```
Phone ✅ → Expo Tunnel URL (exp://xxx.tunnelme.com)
       ↓
       → https://xxxx-xx-xx-xxx-xxx.ngrok-free.app/api
       ↓
       → WSL2 localhost:9000 (Netlify Functions)
```

## 📱 Using the App

1. **Start tunnel mode:**
   ```bash
   npm run dev:tunnel
   ```

2. **Wait for tunnels to establish** (takes 10-20 seconds):
   ```
   [mobile] › Metro waiting on exp://192.168.x.x:8081
   [functions] ◈ Server now ready on http://localhost:9000
   [ngrok] ✅ Tunnel established!
   [ngrok] 📡 Public URL: https://xxxx.ngrok-free.app
   [ngrok] 🔧 Functions: https://xxxx.ngrok-free.app/api
   [ngrok] 📝 Updated mobile/.env
   ```

3. **Restart Expo** to pick up new API URL:
   - Press `r` in the Expo terminal
   - Or shake device and tap "Reload"

4. **Scan QR code** in Expo Go app

5. **App connects** to your local backend via ngrok tunnel!

## 🧪 Testing

### Test the ngrok tunnel:
```bash
# The tunnel script will print this command
curl https://xxxx.ngrok-free.app/api/cards-generate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Mike Trout","year":"2021"}'
```

### Check mobile .env was updated:
```bash
cat mobile/.env
# Should show: EXPO_PUBLIC_API_URL=https://xxxx.ngrok-free.app/api
```

## 🔧 Troubleshooting

### ngrok fails to start

**Error: `authtoken required`**
```bash
# Add to root .env
echo 'NGROK_AUTHTOKEN=your_token' >> .env
```

**Error: `failed to start tunnel`**
- Check your ngrok account limits (free tier: 1 tunnel, 40 connections/min)
- Make sure Netlify Functions are running first
- Try restarting: Stop all processes, then `npm run dev:tunnel`

### Expo tunnel fails

**Error: `Tunnel connection failed`**
```bash
# Login to Expo
npx expo login

# Clear Expo cache
cd mobile
npx expo start -c --tunnel
```

### Mobile app can't connect to functions

**Check mobile/.env:**
```bash
cat mobile/.env
```
Should have the ngrok URL, not localhost.

**Restart Expo after tunnel starts:**
The mobile app caches the API URL. You must reload:
- Press `r` in Expo terminal
- Or shake device → "Reload"

### Slow performance

Tunnels add latency (100-500ms per request). This is normal for tunnel mode.

**To reduce latency:**
- Use `npm run dev` (non-tunnel) when testing on Windows browser
- Use tunnel mode only when testing on physical device

## 🎚️ Available Scripts

| Script | What It Does |
|--------|--------------|
| `npm run dev` | Local mode (localhost only) |
| `npm run dev:tunnel` | **Full tunnel mode** (mobile + functions + ngrok) |
| `npm run dev:mobile:tunnel` | Expo tunnel only |
| `npm run tunnel:functions` | ngrok tunnel only |

## 💡 Pro Tips

### 1. Keep ngrok URL stable
Free ngrok URLs change each restart. For stable URLs:
- Upgrade to ngrok paid plan for custom domains
- Or restart less frequently

### 2. Faster iteration
When working on UI only (no backend changes):
```bash
# Terminal 1: Keep this running
npm run dev:functions
npm run tunnel:functions

# Terminal 2: Restart as needed
cd mobile && npm run start:tunnel
```

### 3. Development workflow
```bash
# Morning: Start tunnel mode
npm run dev:tunnel

# Make changes, hot reload works automatically

# Evening: Stop (Ctrl+C kills all 3 processes)
```

### 4. Test on multiple devices
ngrok URL is public! Share with teammates:
```
https://xxxx.ngrok-free.app/api
```

## 🔒 Security Notes

- ngrok free tier URLs are **publicly accessible** (but hard to guess)
- Don't commit sensitive data to your database
- ngrok URLs expire when you stop the tunnel
- For production, use Netlify's actual deployment (not ngrok)

## 📊 What's Happening Behind the Scenes

```
┌─────────────────────────────────────────┐
│  Your Phone (Expo Go)                   │
└───────────────┬─────────────────────────┘
                │ HTTPS (Expo Tunnel)
                ↓
┌─────────────────────────────────────────┐
│  Expo Infrastructure                    │
│  exp://xxx.tunnelme.com                 │
└───────────────┬─────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────┐
│  WSL2 - Expo Dev Server (:8081)         │
│  Mobile App Source Code                 │
└───────────────┬─────────────────────────┘
                │
                │ Calls API →
                ↓
┌─────────────────────────────────────────┐
│  ngrok Public URL                       │
│  https://xxxx.ngrok-free.app            │
└───────────────┬─────────────────────────┘
                │ HTTPS Tunnel
                ↓
┌─────────────────────────────────────────┐
│  WSL2 - Netlify Functions (:9000)       │
│  cards-generate, cards-search           │
└───────────────┬─────────────────────────┘
                │ PostgreSQL
                ↓
┌─────────────────────────────────────────┐
│  Neon Database (Cloud)                  │
│  player_cards table                     │
└─────────────────────────────────────────┘
```

## 🆘 Still Having Issues?

1. **Verify Netlify Functions work locally:**
   ```bash
   npm run dev:functions
   curl http://localhost:9000/api/cards-generate -X POST \
     -H "Content-Type: application/json" \
     -d '{"name":"Mike Trout","year":"2021"}'
   ```

2. **Verify ngrok works:**
   ```bash
   # In another terminal while functions are running
   npm run tunnel:functions
   # Should print the public URL
   ```

3. **Verify Expo tunnel works:**
   ```bash
   cd mobile
   npx expo start --tunnel
   # Should show tunnel URL and QR code
   ```

4. **Check all environment variables:**
   ```bash
   # Root .env
   cat .env | grep NGROK_AUTHTOKEN
   
   # Mobile .env (should auto-update)
   cat mobile/.env | grep EXPO_PUBLIC_API_URL
   ```

## 🎯 Success Checklist

- [ ] ngrok authtoken set in root `.env`
- [ ] Logged into Expo (`npx expo login`)
- [ ] `npm run dev:tunnel` starts all 3 services
- [ ] See "Tunnel established" message
- [ ] `mobile/.env` shows ngrok URL
- [ ] Expo shows tunnel URL and QR code
- [ ] Scanned QR code in Expo Go
- [ ] App loads and can generate cards

---

**Once everything is running, you can develop normally with hot reload on both mobile and backend!** 🚀
