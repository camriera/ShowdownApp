# Development Guide

This document explains how to run the ShowdownApp for local development and phone testing.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Expo CLI (installed via `npm install` in mobile/)
- Netlify CLI (installed via `npm install` at root)

### For Phone Testing Outside LAN (Optional)

If you want to test on a physical phone outside your local network, you'll need ngrok:

1. Sign up at https://ngrok.com (free tier is fine)
2. Get your auth token from https://dashboard.ngrok.com/get-started/your-authtoken
3. Set the environment variable in your `.env` file:
   ```
   NGROK_AUTHTOKEN=your_token_here
   ```

## How API URLs Are Managed

The app needs to know where to find the backend API. This is handled by environment files:

| Command | Env File | API URL | Where API Runs |
|---------|----------|---------|----------------|
| `npm run dev` | `mobile/.env` | `http://localhost:9000/api` | Your machine (local) |
| `npm run dev:tunnel` | `mobile/.env.tunnel` | `https://xxxxx.ngrok-free.dev/api` | Public internet |

**How it works:**
- `npm run dev` runs `scripts/ensure-local-env.js` to write `mobile/.env`
- `npm run dev:tunnel` updates `mobile/.env.tunnel` and then syncs `mobile/.env`
- Each command sets the correct API URL before Expo starts
- When you switch between `npm run dev` and `npm run dev:tunnel`, restart Expo (press `r`)

---

## Development Workflows

### Local Development (Recommended for Daily Development)

**Use this for testing on web, iOS simulator, or Android emulator locally.**

```bash
npm run dev
```

This automatically:
1. Sets `EXPO_PUBLIC_API_URL=http://localhost:9000/api` (or WSL IP when running inside WSL)
2. Starts Expo mobile app on http://localhost:8081
3. Starts Netlify Functions backend API on http://localhost:9000

Access the app:
- **Web**: Open http://localhost:8081 in your browser
- **Simulator**: Scan the QR code in Expo terminal
- **Physical device on same LAN**: Use your machine's IP (e.g., `192.168.x.x:8081`)

The app will connect to your local API (no ngrok needed).

### Phone Testing Outside LAN (Remote Testing)

**Use this when you need to test on a physical phone outside your local network.**

```bash
npm run dev:tunnel
```

This starts:
- **Expo**: Mobile app with tunnel configuration
- **Netlify Functions**: Backend API on port 9000
- **ngrok Tunnel**: Exposes your local API to the public internet

The script will:
1. Wait for Netlify dev server to start
2. Create an ngrok tunnel and print the public URL
3. Automatically update `mobile/.env` with the tunnel URL
4. **⚠️ Important**: You must restart the Expo app to pick up the new tunnel URL

Steps:
1. Run `npm run dev:tunnel`
2. Wait for the ngrok URL to appear in the output
3. Press `r` in the Expo terminal to reload the app
4. Scan the Expo QR code on your phone
5. The app will now connect through the ngrok tunnel to the public URL

**Switching Back to Local Dev:**
When you're done with remote testing:
1. Stop the tunnel (Ctrl+C)
2. Run `npm run dev` (automatically sets local URL)
3. Reload Expo again (press `r`)

### Port Configuration

- **Netlify Functions**: Port 9000 (used by both dev workflows)
- **ngrok Tunnel**: Forwards port 9000 to the public internet
- **Expo**: Port 8081 (web/dev client)

## Troubleshooting

### App connecting to wrong API endpoint

**Problem**: App is hitting ngrok tunnel when running `npm run dev` (local)

**Solution**:
- Make sure you ran `npm run dev` (not just started Expo separately)
- The `dotenv -e mobile/.env.local` flag should load the local URL
- Restart Expo (press `r` in terminal)

**Check**:
- Verify you're running the right npm command
- If issues persist, restart everything: stop all processes and run `npm run dev` again

### "Port 9000 did not respond"
- Make sure Netlify dev is running: `netlify dev --offline --no-open --port 9000`
- Check that no other process is using port 9000

### "NGROK_AUTHTOKEN not set"
- Add `NGROK_AUTHTOKEN=your_token` to your `.env` file
- Or set the environment variable: `export NGROK_AUTHTOKEN=your_token`

### App not connecting through ngrok tunnel
1. Check that `mobile/.env` has the correct ngrok `EXPO_PUBLIC_API_URL` (printed by tunnel script)
2. Make sure you restarted the Expo app after the tunnel was set up (press `r`)
3. Verify ngrok tunnel is still open (should print "Tunnel will stay open")

### "Tunnel closed unexpectedly"
- Check for auth errors in the tunnel output
- Verify your ngrok auth token is valid
- Check that Netlify dev is still running on port 9000

## Scripts Reference

| Script | Purpose | Typical Use |
|--------|---------|-------------|
| `npm run dev` | Local development | Daily development on web/simulator/LAN |
| `npm run dev:tunnel` | Remote development | Testing on physical phone outside LAN |
| `npm run verify-setup` | Check environment | First time setup, before running dev |
| `npm run tunnel:functions` | Advanced: ngrok tunnel only | Manual control (normally called by dev:tunnel) |
| `npm run build` | Build mobile app | Preparing for production deployment |
| `npm run build:functions` | Build Netlify functions | Preparing for Netlify deployment |

**How Env Files Are Loaded:**
- Uses `dotenv -e` CLI flag to load environment files per npm command
- `npm run dev` loads `mobile/.env.local`
- `npm run dev:tunnel` loads `mobile/.env.tunnel`
- No additional scripts needed!

## Environment Files

### `.env` (Root)
Contains global configuration:
```
NGROK_AUTHTOKEN=your_token_here      # Optional: for phone testing outside LAN
DATABASE_URL=your_db_url              # Neon.tech PostgreSQL
CLOUDINARY_URL=cloudinary://...       # Image hosting
```

### `mobile/.env` (Local Development)
Used by `npm run dev`. Auto-written each run with a local API URL:

```
EXPO_PUBLIC_API_URL=http://localhost:9000/api
```

**Note:** In WSL, this auto-detects your WSL IP so Windows can reach the API.

### `mobile/.env.tunnel` (Remote Development)
Updated by the tunnel script when you run `npm run dev:tunnel`:

```
EXPO_PUBLIC_API_URL=https://xxxxx.ngrok-free.dev/api
```

**Auto-generated** - Updated each time you run `npm run dev:tunnel` with a fresh ngrok URL.

### Environment File Switching

Just run the appropriate npm command and restart Expo:

```bash
npm run dev          # Writes mobile/.env (local)
npm run dev:tunnel   # Updates mobile/.env.tunnel and syncs mobile/.env
```

No manual file management needed!
