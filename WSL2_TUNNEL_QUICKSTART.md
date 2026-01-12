# 🚀 WSL2 Tunnel Mode - Quick Start

## TL;DR

For WSL2, use this instead of `npm run dev`:

```bash
npm run dev:tunnel
```

## Setup (One Time)

1. **Get ngrok token:**
   - Sign up: https://ngrok.com
   - Get token: https://dashboard.ngrok.com/get-started/your-authtoken

2. **Add to `.env`:**
   ```bash
   NGROK_AUTHTOKEN=your_token_here
   ```

3. **Login to Expo:**
   ```bash
   npx expo login
   ```

## Running

```bash
npm run dev:tunnel
```

**Wait 10-20 seconds** for tunnels to establish, you'll see:

```
[ngrok] ✅ Tunnel established!
[ngrok] 📡 Public URL: https://xxxx.ngrok-free.app
[ngrok] 🔧 Functions: https://xxxx.ngrok-free.app/.netlify/functions
[ngrok] 📝 Updated mobile/.env
```

**Restart Expo** (press `r` in terminal) to pick up new API URL.

**Scan QR code** in Expo Go app.

**Done!** App now connects to your local backend via tunnel.

## What This Does

- ✅ Expo runs in `--tunnel` mode (accessible from phone)
- ✅ Netlify Functions exposed via ngrok (accessible from phone)  
- ✅ Mobile app auto-configured to use ngrok URL
- ✅ All hot reload features work normally

## Why?

WSL2 networking is isolated. Your phone can't reach `localhost:8888` in WSL2. Tunnels make your local services publicly accessible.

## Full Details

See [WSL2_TUNNEL_SETUP.md](./WSL2_TUNNEL_SETUP.md) for comprehensive guide.

---

**That's it! Develop normally with full hot reload.** 🎉
