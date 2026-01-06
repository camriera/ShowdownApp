# MLB Showdown Head-to-Head Mobile Simulator
## Requirements Document v1.0

---

## 1. Project Overview

### 1.1 Mission Statement
Create a mobile application (iOS/Android) that faithfully recreates the MLB Showdown baseball card game experience (2000-2005) with modern mobile UX while preserving the authentic gameplay mechanics that made the original game beloved by fans.

### 1.2 Core Objectives
- **Preserve Legacy**: Maintain 100% accurate game rules and calculations from original MLB Showdown
- **Modernize Experience**: Bring the tabletop experience to mobile with intuitive touch interfaces
- **Community Focus**: Build a platform for existing fans while being accessible to newcomers
- **Legal Compliance**: Operate as a non-commercial fan project within fair use guidelines

---

## 2. Functional Requirements

### 2.1 MVP Features (Phase 1)

#### 2.1.1 Core Gameplay Engine
| Feature | Priority | Description | Acceptance Criteria |
|---------|----------|-------------|-------------------|
| **Pitch Phase** | P0 | d20 + Pitcher Control vs Batter On-Base | Correctly implements WotC advantage rules |
| **Swing Phase** | P0 | Advantage holder rolls d20, consults chart | Supports both Classic and Expanded charts |
| **Result Resolution** | P0 | Apply SO/GB/FB/BB/1B/2B/3B/HR outcomes | Accurate baserunner advancement |
| **Fatigue System** | P0 | IP-based Control penalties | Penalty = -1 per batter over IP limit |
| **Game Flow** | P0 | 9-inning games with proper inning/out tracking | Score tracking, winner determination |

#### 2.1.2 Player Card System
| Feature | Priority | Description | Acceptance Criteria |
|---------|----------|-------------|-------------------|
| **Card Generation** | P0 | Interface with mlb_showdown_card_bot | Real MLB stats → Showdown cards |
| **Chart Display** | P0 | Show player charts with d20 result ranges | Clear, readable chart presentation |
| **Position/Defense** | P0 | Display fielding positions and ratings | Support multi-position players |
| **Point Calculation** | P0 | Authentic WotC point values | Match original formulas exactly |

#### 2.1.3 Team Management
| Feature | Priority | Description | Acceptance Criteria |
|---------|----------|-------------|-------------------|
| **Roster Builder** | P0 | Create 25-man rosters within 5000 point cap | DCI Rule 523: bench = 1/5 points |
| **Lineup Card** | P0 | Set batting order and starting pitcher | 9-man lineup, pitcher rotation |
| **Quick Setup** | P0 | Auto-generate balanced teams for immediate play | Random but competitive rosters |

#### 2.1.4 User Interface
| Feature | Priority | Description | Acceptance Criteria |
|---------|----------|-------------|-------------------|
| **Game Screen** | P0 | Baseball diamond with runners, score, inning | Clear game state visibility |
| **Dice Animation** | P0 | Visual d20 roll with result highlight | Satisfying, not lengthy |
| **Card View** | P0 | Tap to view player details and charts | Quick access during gameplay |
| **Touch Controls** | P0 | Tap to advance phases, swipe for menus | Intuitive mobile gestures |

### 2.2 Post-MVP Features (Phases 2-4)

#### 2.2.1 Strategy Card System (Phase 2)
| Feature | Description | Implementation Notes |
|---------|-------------|---------------------|
| **60-Card Decks** | Constructed format with strategy cards | Offense (red), Defense (blue), Utility (white) |
| **Hand Management** | Draw 3 start + 1 per half-inning | Discard mechanics, cost system |
| **Card Effects** | Auto-advantage, rerolls, steal attempts | Phase-specific timing |

#### 2.2.2 Advanced Game Modes (Phase 3)
| Mode | Description | Target Users |
|------|-------------|-------------|
| **League Play** | Fantasy-style drafts with season schedule | Competitive players |
| **Tournament** | Single/double elimination brackets | Tournament organizers |
| **Historical** | Play with classic team rosters | Nostalgia enthusiasts |
| **Campaign** | Progress through MLB eras | Solo progression seekers |

#### 2.2.3 Social Features (Phase 4)
| Feature | Description | Benefits |
|---------|-------------|----------|
| **Online Multiplayer** | Real-time head-to-head games | Remote play with friends |
| **Leaderboards** | Global and friend rankings | Competitive motivation |
| **Replay System** | Share epic game moments | Community engagement |
| **Custom Tournaments** | User-created events | Community organization |

---

## 3. Technical Requirements

### 3.1 Platform Requirements

#### 3.1.1 Mobile Platforms
| Platform | Minimum Version | Target Devices | Notes |
|----------|----------------|----------------|-------|
| **iOS** | iOS 13+ | iPhone 8+ | React Native compatibility |
| **Android** | API 21+ (Android 5.0) | 2GB+ RAM devices | Expo Go support |

#### 3.1.2 Performance Requirements
| Metric | Target | Measurement | Critical Threshold |
|--------|--------|-------------|-------------------|
| **App Launch** | <3 seconds | Cold start to main menu | >8 seconds unacceptable |
| **Card Generation** | <2 seconds | API response time | >5 seconds poor UX |
| **Game Transitions** | <500ms | Phase to phase | >1 second breaks flow |
| **Memory Usage** | <150MB | Runtime allocation | >300MB crash risk |

### 3.2 Architecture Requirements

#### 3.2.1 Mobile App Stack
```typescript
React Native + Expo (TypeScript)
├── Navigation: React Navigation 6+
├── State: Redux Toolkit
├── Styling: Styled Components or NativeBase
├── Storage: AsyncStorage + SQLite
└── Testing: Jest + React Native Testing Library
```

#### 3.2.2 Backend API Stack
```python
Python 3.10+ with FastAPI
├── Card Generation: mlb_showdown_card_bot (forked)
├── Database: PostgreSQL
├── Authentication: JWT (future)
├── Deployment: Docker + Heroku/Railway
└── Testing: pytest + httpx
```

#### 3.2.3 Integration Points
| Component | Protocol | Format | Purpose |
|-----------|----------|--------|---------|
| **Card API** | HTTP/REST | JSON | Generate player cards |
| **Game Sync** | WebSocket | JSON | Real-time multiplayer |
| **Analytics** | HTTPS | Events | Usage tracking |

### 3.3 Data Requirements

#### 3.3.1 Local Storage
| Data Type | Storage Method | Size Estimate | Sync Strategy |
|-----------|----------------|---------------|---------------|
| **Game State** | AsyncStorage | <1MB | No sync needed |
| **Rosters** | SQLite | <10MB | Cloud backup |
| **Card Cache** | SQLite | <50MB | Refresh weekly |
| **User Preferences** | AsyncStorage | <1KB | Device-specific |

#### 3.3.2 Card Data Schema
```typescript
interface PlayerCard {
  id: string;
  name: string;
  year: string;
  team: string;
  playerType: 'Pitcher' | 'Hitter';
  
  // Core game stats
  command: number;        // Control (Pitcher) or On-Base (Hitter)
  outs: number;          // Chart outs total
  chart: ChartEntry[];   // d20 result mappings
  
  // Position players
  positions?: { [position: string]: number };
  speed?: number;
  
  // Pitchers
  ip?: number;           // Innings Pitched rating
  
  // Metadata
  points: number;
  hand: 'L' | 'R' | 'S';
  icons: string[];
  era: 'Classic' | 'Expanded';
}
```

---

## 4. User Experience Requirements

### 4.1 User Personas

#### 4.1.1 The Veteran (Primary)
**Background**: Played MLB Showdown 2000-2005, has physical cards
**Goals**: Relive nostalgia, play with friends remotely
**Pain Points**: Cards lost/damaged, no local players
**Key Features**: Authentic rules, online multiplayer, historical rosters

#### 4.1.2 The Newcomer (Secondary)  
**Background**: Baseball fan, plays mobile games, unfamiliar with Showdown
**Goals**: Learn the game, casual entertainment
**Pain Points**: Complex rules, steep learning curve
**Key Features**: Tutorial mode, quick play, simplified UI

#### 4.1.3 The Competitor (Secondary)
**Background**: Tournament player, strategy game enthusiast
**Goals**: Competitive play, rankings, tournaments
**Pain Points**: Limited local competition, no official support
**Key Features**: League mode, statistics, skill-based matching

### 4.2 User Journey Maps

#### 4.2.1 First-Time User Experience
```
1. App Download → 2. Tutorial → 3. First Game → 4. Win/Loss → 5. Retention Hook
   ├─ App Store     ├─ Rules      ├─ vs AI      ├─ Results   ├─ Collection
   ├─ Installation  ├─ Practice   ├─ Guidance   ├─ Stats     ├─ Achievement
   └─ Launch        └─ Demo       └─ Success    └─ Feedback  └─ Next Game
```

#### 4.2.2 Returning User Experience
```
1. App Launch → 2. Main Menu → 3. Game Choice → 4. Play → 5. Post-Game
   ├─ Quick load   ├─ Continue    ├─ Quick/Custom ├─ Enjoy  ├─ Save/Share
   └─ Recognize    └─ New Game    └─ Matchmaking  └─ Flow   └─ Progress
```

### 4.3 Accessibility Requirements

| Requirement | Implementation | WCAG Level |
|-------------|----------------|------------|
| **Screen Reader** | Semantic labels, accessible roles | AA |
| **Color Contrast** | 4.5:1 minimum for all text | AA |
| **Touch Targets** | 44px minimum tap area | AA |
| **Font Scaling** | Support system text size preferences | AA |
| **Motor Access** | Alternative input methods | AA |
| **Cognitive Load** | Clear navigation, undo actions | Custom |

### 4.4 Localization Requirements

#### 4.4.1 MVP Languages
- **English (US)**: Primary language, full feature support
- **Spanish (ES)**: Secondary, UI translation only

#### 4.4.2 Future Languages
- French (CA), Japanese, Korean (large baseball markets)

---

## 5. Business Requirements

### 5.1 Legal & Compliance

#### 5.1.1 Intellectual Property Strategy
| Asset | Strategy | Risk Level | Mitigation |
|-------|----------|------------|------------|
| **Player Names** | Public domain usage | Low | Use statistics only |
| **Team References** | City names only | Low | No logos or trademarks |
| **Game Mechanics** | Original implementation | Medium | Clean room development |
| **Card Generation** | Fork existing OSS | Low | MIT license compliance |

#### 5.1.2 Content Guidelines
**✅ Permitted Content:**
- Player names and publicly available statistics
- Generic team city references (e.g., "New York", "Boston")
- Original game rule implementations
- User-generated roster content

**❌ Prohibited Content:**
- Player photographs or likenesses
- Official team logos, uniforms, or designs
- Copyrighted MLB Showdown artwork
- Monetization features (ads, IAP, donations)

### 5.2 Success Metrics

#### 5.2.1 Engagement Metrics (Primary)
| Metric | Month 1 Target | Month 6 Target | Measurement Method |
|--------|---------------|----------------|-------------------|
| **Daily Active Users** | 50 | 500 | Analytics tracking |
| **Session Duration** | 20 minutes | 30 minutes | Time tracking |
| **Games per Session** | 1.5 | 2.0 | Game completion logs |
| **7-Day Retention** | 20% | 35% | Cohort analysis |
| **30-Day Retention** | 5% | 15% | Cohort analysis |

#### 5.2.2 Quality Metrics (Secondary)
| Metric | Target | Monitoring | Response Threshold |
|--------|--------|------------|-------------------|
| **App Store Rating** | 4.5+ | Weekly review | <4.0 immediate action |
| **Crash Rate** | <1% | Real-time monitoring | >2% emergency fix |
| **Load Time** | <3s | Performance tracking | >5s optimization needed |
| **Bug Reports/DAU** | <5% | Support tickets | >10% feature freeze |

### 5.3 Community Strategy

#### 5.3.1 Engagement Channels
| Channel | Purpose | Success Metrics |
|---------|---------|----------------|
| **GitHub** | Development transparency | Stars, forks, contributions |
| **Discord** | Community discussion | Active members, daily messages |
| **Reddit** | Fan community engagement | Subscribers, positive sentiment |
| **YouTube** | Tutorials, gameplay | Views, subscriber growth |

#### 5.3.2 Content Strategy
| Content Type | Frequency | Owner | Purpose |
|-------------|-----------|--------|---------|
| **Development Updates** | Bi-weekly | Product Team | Transparency |
| **Gameplay Tutorials** | Monthly | Community | User education |
| **Historical Features** | Quarterly | Community | Nostalgia content |
| **Tournament Coverage** | As needed | Community | Competitive scene |

---

## 6. Technical Architecture

### 6.1 System Design Principles

#### 6.1.1 Design Philosophy
- **Mobile-First**: Touch-optimized interfaces, thumb-friendly layouts
- **Offline-Capable**: Core gameplay works without internet
- **Performance-Driven**: Smooth 60fps animations, <3s load times
- **Modular Architecture**: Easy to extend with new features
- **Test-Driven**: High test coverage for game logic

#### 6.1.2 Scalability Considerations
| Component | Current Capacity | Scale Trigger | Scaling Strategy |
|-----------|-----------------|---------------|------------------|
| **API Server** | 1000 req/min | 80% capacity | Horizontal scaling |
| **Database** | 10GB | 8GB usage | Read replicas |
| **CDN** | 100GB/month | 80GB usage | Additional regions |
| **Push Notifications** | 10K/day | 8K usage | Premium service tier |

### 6.2 Data Flow Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Backend API   │    │  Card Bot       │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Game Engine │◄┼────┼►│ Card Service│◄┼────┼►│ MLB Stats   │ │
│ │             │ │    │ │             │ │    │ │ Processor   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │Redux Store  │ │    │ │ Database    │ │    │ │ Baseball    │ │
│ │             │ │    │ │             │ │    │ │ Reference   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 6.3 Security Requirements

#### 6.3.1 Data Protection
| Data Type | Protection Method | Compliance |
|-----------|------------------|------------|
| **User Profiles** | Encrypted at rest | COPPA compliant |
| **Game Sessions** | TLS in transit | Industry standard |
| **API Communications** | JWT tokens | OAuth 2.0 ready |

#### 6.3.2 Privacy Considerations
- **No Personal Data Collection**: Minimal user information required
- **Anonymous Analytics**: Aggregate usage data only
- **Local Storage First**: Game data stored on device
- **Opt-in Sharing**: User controls all data sharing

---

## 7. Development Roadmap

### 7.1 Phase Timeline

#### Phase 1: Foundation (Months 1-2)
**Goal**: Playable MVP with core mechanics
- [x] Project setup and documentation
- [ ] Game engine implementation (pitch/swing phases)
- [ ] Basic UI components (game screen, menus)
- [ ] Card generation API wrapper
- [ ] Local roster management
- **Milestone**: Two players can play a complete game on one device

#### Phase 2: Features (Months 3-4)
**Goal**: Full-featured single-player experience
- [ ] Strategy card system
- [ ] Enhanced UI with animations
- [ ] Historical player database
- [ ] Statistics tracking
- [ ] Tutorial system
- **Milestone**: New users can learn and enjoy the game solo

#### Phase 3: Multiplayer (Months 5-6)
**Goal**: Connected gaming experience
- [ ] Real-time online multiplayer
- [ ] User accounts and profiles
- [ ] Matchmaking system
- [ ] Tournament brackets
- **Milestone**: Friends can play together remotely

#### Phase 4: Community (Months 7-8)
**Goal**: Thriving community platform
- [ ] League management tools
- [ ] Advanced statistics
- [ ] Replay system
- [ ] Community features
- **Milestone**: Active daily community of 1000+ users

### 7.2 Resource Requirements

#### 7.2.1 Development Team
| Phase | Engineers | Designers | PM | Total |
|-------|-----------|-----------|-----|-------|
| **Phase 1** | 2 FTE | 0.5 FTE | 0.5 FTE | 3 FTE |
| **Phase 2** | 2 FTE | 0.5 FTE | 0.5 FTE | 3 FTE |
| **Phase 3** | 2.5 FTE | 0.5 FTE | 0.5 FTE | 3.5 FTE |
| **Phase 4** | 2.5 FTE | 0.5 FTE | 1 FTE | 4 FTE |

#### 7.2.2 Infrastructure Costs
| Service | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|---------|---------|---------|---------|---------|
| **Hosting** | $50/month | $100/month | $300/month | $500/month |
| **Database** | $25/month | $50/month | $150/month | $300/month |
| **CDN** | $10/month | $25/month | $75/month | $150/month |
| **Monitoring** | $0 | $50/month | $100/month | $200/month |
| **Total** | $85/month | $225/month | $625/month | $1150/month |

---

## 8. Risk Management

### 8.1 Technical Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|-------------------|
| **MLB Showdown Bot Dependency** | Medium | High | Fork and maintain independent version |
| **React Native Performance** | Low | Medium | Native modules for critical game logic |
| **Baseball Reference Rate Limits** | High | Medium | Local caching + API key rotation |
| **Mobile Platform Policy Changes** | Low | High | Multi-platform + web fallback |

### 8.2 Legal Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|-------------------|
| **IP Infringement Claims** | Low | High | Legal review, fair use compliance |
| **App Store Rejections** | Medium | Medium | Platform guidelines compliance |
| **User-Generated Content** | Medium | Low | Content moderation, clear ToS |

### 8.3 Business Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|-------------------|
| **Limited User Adoption** | Medium | High | Community-driven marketing |
| **Competition from Licensed Games** | Low | Medium | Focus on authenticity, community |
| **Developer Bandwidth** | High | Medium | Phased development, community contributions |
| **Platform Dependencies** | Medium | Medium | Open source strategy, multiple platforms |

---

## 9. Conclusion

This requirements document establishes a comprehensive roadmap for creating an authentic, community-driven mobile recreation of MLB Showdown that respects intellectual property while delivering modern gaming experiences to both nostalgic veterans and new players.

### 9.1 Success Criteria
1. **Authentic Gameplay**: 100% accurate rule implementation verified by community
2. **User Adoption**: 1000+ daily active users within 6 months
3. **Community Health**: Active development community with regular contributions
4. **Legal Compliance**: No IP violations, successful app store approvals
5. **Technical Excellence**: 4.5+ app store rating, <1% crash rate

### 9.2 Key Differentiators
- **Community-Driven**: Open source development with fan input
- **Authentic Experience**: Exact rule implementation using proven algorithms
- **Modern UX**: Touch-optimized interface for mobile-first experience
- **Preservation Focus**: Documenting and preserving classic game mechanics
- **Fair Use Compliance**: Legal operation as educational fan project

### 9.3 Long-Term Vision
Create the definitive digital platform for MLB Showdown that becomes the standard for online play, introduces new generations to the game, and demonstrates how classic tabletop experiences can successfully transition to modern mobile platforms while respecting original creators and intellectual property rights.

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Next Review**: February 2026