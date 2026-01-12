# ⚾ Showdown Simulator

A mobile recreation of the classic MLB Showdown baseball card game (2000-2005), built with React Native and powered by authentic player statistics.

> **Fan Project Disclaimer**: This is an unofficial, non-commercial fan project inspired by MLB Showdown by Wizards of the Coast. Not affiliated with MLB, MLBPA, or Wizards of the Coast.

## 🎯 Project Vision

Bring the beloved tabletop baseball simulation to mobile devices with:
- **Authentic gameplay** using original MLB Showdown rules
- **Real player statistics** via the `mlb_showdown_card_bot` integration
- **Cross-platform support** for iOS and Android
- **Modern UX** while preserving classic game mechanics
- **Community focus** for existing fans and newcomers

## 🏗️ Architecture

```
┌──────────────────────────────────────────┐
│   Mobile App (React Native + Expo)       │
│  ┌────────────┐  ┌───────────────────┐   │
│  │  Screens   │  │   Game Engine     │   │
│  │  Components│  │   (Pure TS Logic) │   │
│  └────────────┘  └───────────────────┘   │
└──────────────────────────────────────────┘
              │ HTTPS/REST │
┌──────────────────────────────────────────┐
│    Netlify Functions (Serverless)        │
│  ┌────────────────────────────────────┐  │
│  │  /api/cards/generate  (POST)       │  │
│  │  /api/cards/search    (GET)        │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
              │ PostgreSQL │
┌──────────────────────────────────────────┐
│  Neon PostgreSQL (Serverless DB)         │
│  - player_cards (cached card data)       │
│  - game_sessions (save/resume)           │
│  - rosters (custom teams)                │
└──────────────────────────────────────────┘
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system design.

## ⚡ Quick Start

**See [LOCAL_SETUP.md](./LOCAL_SETUP.md) for detailed setup instructions!**

### 5-Minute Setup

1. **Install and verify**:
   ```bash
   npm run setup        # Installs deps and verifies setup
   # OR manually:
   # npm install && cd mobile && npm install && cd ..
   # npm run verify     # Check everything is configured
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env and add your Neon PostgreSQL DATABASE_URL
   ```

3. **Setup database**:
   ```bash
   npm run db:test      # Verify connection
   npm run db:migrate   # Create tables
   npm run db:populate  # Add sample cards (optional, 2-3 mins)
   ```

4. **Start development**:
   ```bash
   npm run dev          # Starts mobile app + Netlify backend
   # WSL2? Use: npm run dev:tunnel (see WSL2_TUNNEL_SETUP.md)
   ```

5. **Open on device**:
   - Scan QR code with Expo Go app
   - Or run `cd mobile && npm run ios` for simulator

### 🌐 WSL2 Users?
If you're running in WSL2, use tunnel mode:
```bash
npm run dev:tunnel   # Exposes services via ngrok + Expo tunnel
```
See [WSL2_TUNNEL_QUICKSTART.md](./WSL2_TUNNEL_QUICKSTART.md) for quick setup!

### ✅ Verify Setup
```bash
npm run verify       # Checks Node.js, dependencies, env vars, and database
```

### 📚 Documentation

- **[LOCAL_SETUP.md](./LOCAL_SETUP.md)** - Complete local development setup guide
- **[TEST_BACKEND.md](./TEST_BACKEND.md)** - Testing your Netlify backend locally
- **[WSL2_TUNNEL_QUICKSTART.md](./WSL2_TUNNEL_QUICKSTART.md)** - WSL2 tunnel mode (2-min setup)
- **[COMMON_ERRORS.md](./COMMON_ERRORS.md)** - Troubleshooting guide
- **[netlify/README.md](./netlify/README.md)** - Backend API documentation
- **[NEXT_STEPS.md](./NEXT_STEPS.md)** - Development checklist and roadmap
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture details
- **[AGENTS.md](./AGENTS.md)** - AI development guide

## 🎮 Game Features

### Core Gameplay
- [x] **Pitch Phase**: d20 + Pitcher Control vs Batter On-Base
- [x] **Advantage System**: Determine who has advantage
- [x] **Swing Phase**: Advantage holder rolls, consults chart
- [x] **Result Resolution**: SO, GB, FB, BB, 1B, 2B, 3B, HR outcomes
- [ ] **Strategy Cards**: 60-card decks with special abilities
- [ ] **Fatigue System**: IP-based pitcher penalty system

### Game Modes
- [x] **Quick Play**: Auto-generated balanced teams
- [ ] **Custom Rosters**: Build teams within 5000 point cap
- [ ] **Historical Teams**: Play with classic lineups
- [ ] **Tournament Mode**: Single elimination brackets

### Technical Features  
- [x] **Authentic Cards**: Real MLB stats via showdownbot.com API integration
- [x] **Card Images**: Real card artwork generated by showdownbot.com
- [x] **Database Caching**: PostgreSQL storage for instant card retrieval
- [x] **Cross Platform**: iOS and Android support
- [x] **Graceful Fallback**: Works offline with sample data if database unavailable
- [ ] **Offline Play**: Full local storage for rosters/games
- [ ] **Real-time Multiplayer**: Online head-to-head games

## 🗂️ Project Structure

```
ShowdownApp/
├── mobile/                    # React Native app (Expo + TypeScript)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── screens/           # Screen-level components
│   │   ├── engine/            # Game logic (GameEngine.ts)
│   │   ├── models/            # TypeScript interfaces
│   │   ├── api/               # API client modules
│   │   └── utils/             # Helper functions
│   └── __tests__/             # Mobile app tests
│
├── netlify/
│   └── functions/             # Serverless backend (TypeScript)
│       ├── cards/             # Card generation/search endpoints
│       ├── games/             # Game session endpoints (future)
│       ├── rosters/           # Roster management (future)
│       └── utils/             # Database utilities
│
├── database/
│   └── schema.sql             # PostgreSQL schema
│
├── docs/                      # Documentation
│   ├── REQUIREMENTS.md        # Full requirements
│   ├── GAME_RULES.md          # MLB Showdown mechanics
│   └── API.md                 # Backend API docs
│
├── NEXT_STEPS.md              # Development checklist
├── ARCHITECTURE.md            # Technical architecture
└── AGENTS.md                  # AI development guide
```

## 🎯 Development Roadmap

### Phase 1: Foundation (Months 1-2)
- [x] Project setup and architecture
- [x] Basic UI components and navigation  
- [x] Core game engine implementation
- [ ] Backend API for card generation
- [ ] Single device two-player mode

### Phase 2: Features (Months 3-4)
- [ ] Strategy card system
- [ ] Roster builder with validation
- [ ] Enhanced UI with animations
- [ ] Player statistics and history

### Phase 3: Multiplayer (Months 5-6)
- [ ] Real-time online gameplay
- [ ] User accounts and profiles
- [ ] Tournament system
- [ ] Community features

### Phase 4: Polish (Months 7-8)
- [ ] App Store submission
- [ ] Performance optimization
- [ ] Advanced statistics
- [ ] Replay system

## 🤝 Contributing

We welcome contributions from the MLB Showdown community! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📱 Screenshots

*Coming soon - app is in early development*

## 🧪 Testing

```bash
# Run mobile tests
cd mobile && npm test

# Run backend tests  
cd backend && pytest

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Mobile App
- iOS: TestFlight beta → App Store
- Android: Internal testing → Google Play

### Backend API
- Development: Local development server
- Production: Heroku/Railway deployment

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚖️ Legal Notice

This is an unofficial fan project created to preserve and modernize the classic MLB Showdown game experience. We use publicly available baseball statistics and original game implementations.

- **Not affiliated** with MLB, MLBPA, or Wizards of the Coast
- **No player images or likenesses** are used
- **No team logos or trademarked designs** are included  
- **Educational and preservation purpose** under fair use
- **Original MLB Showdown** created by Wizards of the Coast (2000-2005)

## 🙏 Acknowledgments

- **Wizards of the Coast** for creating the original MLB Showdown
- **mgula57** for the [mlb_showdown_card_bot](https://github.com/mgula57/mlb_showdown_card_bot)
- **MLB Showdown community** for keeping the game alive
- **Baseball-Reference.com** for statistical data

## 📞 Contact

- **GitHub Issues**: [Bug reports and feature requests](https://github.com/camriera/ShowdownApp/issues)
- **Discussions**: [Community discussion board](https://github.com/camriera/ShowdownApp/discussions)

---

**Built with ❤️ for the MLB Showdown community**