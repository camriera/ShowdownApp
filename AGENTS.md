# Development Guide for AI Coding Agents

This document provides essential information for AI coding agents working on the Showdown Simulator project - a React Native + Expo mobile app with Netlify Functions backend, recreating the classic MLB Showdown baseball card game.

## 🏗️ Project Architecture

### Frontend: React Native + Expo (TypeScript)
- **Navigation**: React Navigation 7+ (Stack Navigator)
- **Styling**: React Native StyleSheet (native components)
- **Animations**: React Native Reanimated + Expo Sensors
- **Testing**: Jest + React Native Testing Library
- **State**: React hooks and context (no Redux)

### Backend: Netlify Functions (TypeScript)
- **Runtime**: Node.js 18+ serverless functions
- **Database**: Neon PostgreSQL (serverless)
- **Card Generation**: Integration with showdownbot.com API
- **Deployment**: Netlify Edge Functions

## 🚀 Build, Test, and Development Commands

### Root-Level Commands (Orchestration)
```bash
# Setup and verification
npm run setup                  # Install all dependencies (root + mobile)
npm run verify                 # Verify Node.js, deps, env vars, database
npm run verify-setup           # Check development environment setup

# Development (run full stack)
npm run dev                    # Start mobile app + Netlify functions (local mode)
npm run dev:tunnel             # Start with tunnel mode (WSL2/remote access)

# Database commands
npm run db:test                # Test database connection
npm run db:migrate             # Run database schema migrations
npm run db:populate            # Populate database with sample cards (2-3 mins)

# Build and deployment
npm run build                  # Build mobile app
npm run build:functions        # Build Netlify functions
npm run deploy                 # Deploy to Netlify production

# Testing
npm test                       # Run mobile app tests
npm run test:functions         # Run function tests (not implemented yet)

# Linting
npm run lint                   # Run mobile app linting
```

### Mobile App Commands
```bash
cd mobile

# Development
npm start                      # Start Expo development server
npm run start:tunnel           # Start with tunnel mode (remote access)
npm run ios                    # Run on iOS simulator
npm run android                # Run on Android emulator
npm run web                    # Run in web browser

# Testing
npm test                       # Run all tests
npm run test:watch             # Run tests in watch mode

# Code quality
npm run lint                   # Run ESLint
npm run type-check             # TypeScript type checking
```

### Netlify Functions (Backend)
```bash
# The backend runs via Netlify CLI - use root-level commands

# Local development
npm run dev                    # Start functions at http://localhost:9000/api/

# Functions are accessible at:
# POST http://localhost:9000/api/cards-generate
# GET  http://localhost:9000/api/cards-search

# Or via API redirect:
# POST http://localhost:9000/api/cards-generate
# GET  http://localhost:9000/api/cards-search
```

### Testing with curl
```bash
# Generate a card
curl -X POST http://localhost:9000/api/cards-generate \
  -H "Content-Type: application/json" \
  -d '{"name":"Mike Trout","year":"2021"}'

# Search cached cards
curl http://localhost:9000/api/cards-search?name=Trout
```

## 📝 Code Style Guidelines

### TypeScript/React Native

#### File Organization
```typescript
// File naming: PascalCase for components, camelCase for utilities
// GameEngine.tsx, PlayerCard.tsx, gameUtils.ts, cardHelpers.ts

// Directory structure (mobile/src/):
src/
├── components/          # Reusable UI components
├── screens/            # Screen-level components
├── engine/             # Game logic (pure TypeScript)
├── controllers/        # Game state controllers
├── models/             # TypeScript interfaces/types
├── api/                # API client modules
├── hooks/              # Custom React hooks
├── navigation/         # React Navigation setup
├── utils/              # Helper functions
├── constants/          # App-wide constants
└── __tests__/          # Test files
```

#### Imports
```typescript
// Order: React → React Native → Third-party → Internal (relative)
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { GameEngine } from '../engine/GameEngine';
import { PlayerCard } from '../models/Card';
import { calculateAdvantage } from '../utils/gameUtils';
```

#### Component Structure
```typescript
// Use function declarations for components
interface Props {
  player: PlayerCard;
  onSelect: (player: PlayerCard) => void;
}

export const PlayerCardComponent: React.FC<Props> = ({ player, onSelect }) => {
  // Hooks first, in order: state, navigation, effects, custom hooks
  const [isSelected, setIsSelected] = useState(false);
  const navigation = useNavigation();
  
  useEffect(() => {
    // Effects logic
  }, []);

  // Event handlers
  const handlePress = () => {
    setIsSelected(!isSelected);
    onSelect(player);
  };

  // Render
  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Text style={styles.playerName}>{player.name}</Text>
    </TouchableOpacity>
  );
};

// Styles at bottom of file
const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

#### Types and Interfaces
```typescript
// Use interfaces for object shapes
interface PlayerCard {
  id: string;
  name: string;
  year: string;
  playerType: 'Pitcher' | 'Hitter';
  command: number;
  chart: ChartEntry[];
}

// Use type aliases for unions and computed types
type GamePhase = 'PITCH' | 'ADVANTAGE' | 'SWING' | 'RESULT';
type ChartResult = 'SO' | 'GB' | 'FB' | 'BB' | '1B' | '2B' | '3B' | 'HR';

// Export types from models/ directory
export type { PlayerCard, GamePhase, ChartResult };
```

#### Error Handling
```typescript
// Use Result pattern for error-prone operations
type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

const generateCard = async (name: string, year: string): Promise<Result<PlayerCard>> => {
  try {
    const response = await fetch(`/api/cards-generate`, {
      method: 'POST',
      body: JSON.stringify({ name, year }),
    });
    
    if (!response.ok) {
      return { success: false, error: new Error(`API error: ${response.status}`) };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
};
```

### Netlify Functions (TypeScript)

#### File Organization
```typescript
// File naming: kebab-case for function files
// cards-generate.ts, cards-search.ts, db.ts

// Directory structure (netlify/functions/):
functions/
├── cards-generate.ts   # POST endpoint for card generation
├── cards-search.ts     # GET endpoint for card search
└── db.ts              # Database connection utilities
```

#### Function Structure
```typescript
// Netlify Functions use Handler type from @netlify/functions
import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';

export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    // Parse request
    const body = JSON.parse(event.body || '{}');
    
    // Business logic here
    const result = await processRequest(body);
    
    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

#### Database Connection
```typescript
// Use connection pooling for PostgreSQL
import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

// Use in function
async function queryDatabase() {
  const pool = getPool();
  const result = await pool.query('SELECT * FROM player_cards WHERE name = $1', ['Mike Trout']);
  return result.rows;
}
```

## 🧪 Testing Patterns

### React Native Tests (Jest + React Native Testing Library)
```typescript
// File: mobile/src/__tests__/GameEngine.test.ts
import { GameEngine } from '../engine/GameEngine';
import { PlayerCard } from '../models/Card';

describe('GameEngine', () => {
  describe('pitch phase', () => {
    it('should give pitcher advantage when pitch result > batter on-base', () => {
      const pitcher = { control: 3 };
      const batter = { onBase: 10 };
      const roll = 8; // Result: 8 + 3 = 11 > 10
      
      const advantage = GameEngine.calculateAdvantage(pitcher, batter, roll);
      
      expect(advantage).toBe('PITCHER');
    });
    
    it('should give batter advantage when pitch result <= batter on-base', () => {
      const pitcher = { control: 5 };
      const batter = { onBase: 15 };
      const roll = 10; // Result: 10 + 5 = 15 <= 15
      
      const advantage = GameEngine.calculateAdvantage(pitcher, batter, roll);
      
      expect(advantage).toBe('BATTER');
    });
  });
});
```

### Component Tests
```typescript
// File: mobile/src/__tests__/components/PlayerCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PlayerCardComponent } from '../../components/PlayerCard';

describe('PlayerCardComponent', () => {
  const mockPlayer = {
    id: '1',
    name: 'Mike Trout',
    year: '2021',
    playerType: 'Hitter',
    command: 10,
    onBase: 15,
  };

  it('renders player name correctly', () => {
    const { getByText } = render(<PlayerCardComponent player={mockPlayer} />);
    expect(getByText('Mike Trout')).toBeTruthy();
  });

  it('calls onSelect when pressed', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <PlayerCardComponent player={mockPlayer} onSelect={onSelect} />
    );
    
    fireEvent.press(getByText('Mike Trout'));
    expect(onSelect).toHaveBeenCalledWith(mockPlayer);
  });
});
```

### API/Integration Tests (Future)
```typescript
// File: mobile/src/__tests__/api/cardsApi.test.ts
import { generateCard } from '../../api/cardsApi';

describe('Cards API', () => {
  it('should fetch card from backend', async () => {
    const card = await generateCard('Mike Trout', '2021');
    
    expect(card.name).toBe('Mike Trout');
    expect(card.year).toBe('2021');
    expect(card.playerType).toMatch(/Pitcher|Hitter/);
  });
});
```

## 📁 Naming Conventions

### Files and Directories
- **React Native Components**: PascalCase (`PlayerCard.tsx`, `GameScreen.tsx`)
- **Utilities/Helpers**: camelCase (`gameUtils.ts`, `cardHelpers.ts`)
- **Netlify Functions**: kebab-case (`cards-generate.ts`, `cards-search.ts`)
- **Directories**: camelCase (`components/`, `screens/`, `engine/`)

### Variables and Functions
- **TypeScript**: camelCase (`playerName`, `calculateAdvantage`, `fetchCard`)
- **React Components**: PascalCase (`PlayerCard`, `GameBoard`, `DiceRoller`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_POINTS`, `DEFAULT_DECK_SIZE`, `API_BASE_URL`)
- **Interfaces/Types**: PascalCase (`PlayerCard`, `GameState`, `ChartEntry`)

### Environment Variables
- **Root .env**: `DATABASE_URL`, `NODE_ENV`
- **Mobile .env**: Prefix with `EXPO_PUBLIC_` for client-side access
  - `EXPO_PUBLIC_API_URL`
  - `EXPO_PUBLIC_ENV`

## 🚨 Important Project-Specific Rules

### Legal Compliance (CRITICAL)
- **Never include**: Player images, team logos, copyrighted artwork
- **Always use**: Generic names for teams ("New York" not "Yankees")  
- **Required disclaimers**: Mark all generated content as unofficial fan project
- **Card images**: Only use images from showdownbot.com API (with permission)
- **Attribution**: Always credit Wizards of the Coast for original game design

### Game Accuracy
- **MLB Showdown rules**: Must match original WotC mechanics exactly
- **Card generation**: Use showdownbot.com API integration (see `netlify/functions/cards-generate.ts`)
- **Test coverage**: All game logic requires comprehensive testing
- **Authentic mechanics**: Preserve classic 2000-2005 era gameplay

### Code Quality
- **TypeScript**: Strict mode enabled, no `any` types without justification
- **Testing**: Minimum 80% coverage for game engine logic
- **Documentation**: All public APIs documented with examples
- **Error Handling**: Use try-catch with proper logging, graceful fallbacks

### Database
- **Connection**: Use `getPool()` from `netlify/functions/db.ts`
- **Queries**: Always use parameterized queries to prevent SQL injection
- **Caching**: Cache all generated cards to reduce API calls
- **Migrations**: Run schema changes through `npm run db:migrate`

### Development Workflow
1. **Environment Setup**: Always run `npm run verify` after setup
2. **Local Development**: Use `npm run dev` for full stack
3. **WSL2 Users**: Use `npm run dev:tunnel` for proper networking
4. **Database**: Test connection with `npm run db:test` before running app
5. **Testing**: Run tests before committing code changes

## 📚 Key Project Files

### Configuration
- `package.json` - Root workspace configuration and scripts
- `mobile/package.json` - Mobile app dependencies and scripts
- `netlify.toml` - Netlify Functions configuration
- `database/schema.sql` - PostgreSQL database schema

### Documentation
- `README.md` - Project overview and quick start
- `LOCAL_SETUP.md` - Detailed setup instructions
- `TEST_BACKEND.md` - Backend testing guide
- `WSL2_TUNNEL_QUICKSTART.md` - WSL2 networking setup
- `ARCHITECTURE.md` - Technical architecture details
- `COMMON_ERRORS.md` - Troubleshooting guide

### Backend Functions
- `netlify/functions/cards-generate.ts` - Card generation endpoint
- `netlify/functions/cards-search.ts` - Card search endpoint
- `netlify/functions/db.ts` - Database utilities

### Game Engine
- `mobile/src/engine/GameEngine.ts` - Core game logic
- `mobile/src/controllers/` - Game state management
- `mobile/src/models/` - TypeScript type definitions

This guide ensures consistent, high-quality code that respects the project's legal constraints while delivering an authentic MLB Showdown experience.