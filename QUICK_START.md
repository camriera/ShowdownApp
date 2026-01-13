# Quick Start Guide

Get the ShowdownApp running in 2 minutes.

## First Time Setup

```bash
# 1. Install dependencies
npm install
cd mobile && npm install && cd ..

# 2. Verify your development environment
npm run verify-setup

# If any checks fail, follow the instructions in DEVELOPMENT.md
```

## Daily Development

### Option A: Local Development (Recommended)
Test on your machine or simulator:

```bash
npm run dev
```

Then:
- **Web**: Open http://localhost:8081
- **Simulator**: Scan the QR code shown in terminal
- **Device on LAN**: Open http://your-ip:8081

### Option B: Phone Testing Outside LAN
Test on a physical phone anywhere (requires ngrok):

```bash
npm run dev:tunnel
```

Then:
1. Wait for ngrok URL to appear
2. Press `r` in Expo terminal to reload
3. Scan QR code on your phone

---

**That's it!** See DEVELOPMENT.md for more details and troubleshooting.
