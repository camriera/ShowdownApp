# Development Guide for AI Coding Agents

This document provides essential information for AI coding agents working on the Showdown Simulator project - a React Native + Python FastAPI recreation of the classic MLB Showdown baseball card game.

## 🏗️ Project Architecture

### Frontend: React Native + Expo (TypeScript)
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation 6+
- **Styling**: Styled Components or NativeBase
- **Testing**: Jest + React Native Testing Library

### Backend: Python 3.10+ FastAPI
- **Database**: PostgreSQL
- **Card Generation**: mlb_showdown_card_bot (forked)
- **Testing**: pytest + httpx

## 🚀 Build, Test, and Development Commands

### Mobile App (React Native)
```bash
# Setup and development
cd mobile
npm install                    # Install dependencies
npm start                      # Start Expo development server
npm run ios                    # Run on iOS simulator
npm run android               # Run on Android emulator

# Testing
npm test                       # Run all tests
npm test -- --watch           # Run tests in watch mode
npm test GameEngine.test.ts    # Run specific test file
npm test -- --testNamePattern="pitch phase"  # Run tests matching pattern

# Linting and formatting
npm run lint                   # Run ESLint
npm run lint:fix              # Fix auto-fixable ESLint issues
npm run type-check            # TypeScript type checking
```

### Backend API (Python)
```bash
# Setup and development
cd backend
pip install -r requirements.txt    # Install dependencies
uvicorn app.main:app --reload      # Start development server
uvicorn app.main:app --reload --port 8001  # Custom port

# Testing
pytest                              # Run all tests
pytest tests/unit/                  # Run unit tests only
pytest tests/integration/          # Run integration tests
pytest tests/test_cards.py         # Run specific test file
pytest -k "test_generate_card"     # Run tests matching pattern
pytest --cov=app tests/            # Run with coverage report

# Linting and formatting
python -m flake8 app/              # Code style checking
python -m black app/               # Code formatting
python -m mypy app/                # Type checking
```

### Full Project
```bash
# Run both frontend and backend
npm run dev                    # If configured in root package.json
# Or manually start both:
# Terminal 1: cd backend && uvicorn app.main:app --reload
# Terminal 2: cd mobile && npm start
```

## 📝 Code Style Guidelines

### TypeScript/React Native

#### File Organization
```typescript
// File naming: PascalCase for components, camelCase for utilities
// GameEngine.tsx, PlayerCard.tsx, gameUtils.ts, cardHelpers.ts

// Directory structure:
src/
├── components/          # Reusable UI components
├── screens/            # Screen-level components  
├── engine/             # Game logic (pure TypeScript)
├── store/              # Redux slices and selectors
├── models/             # TypeScript interfaces/types
├── hooks/              # Custom React hooks
├── utils/              # Helper functions
└── __tests__/          # Test files
```

#### Imports
```typescript
// Order: React → Third-party → Internal (absolute) → Relative
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { GameEngine } from '@/engine/GameEngine';
import { PlayerCard } from '@/models/Card';
import { RootState } from '@/store';

import { calculateAdvantage } from './gameUtils';
```

#### Component Structure
```typescript
// Use function declarations for components
interface Props {
  player: PlayerCard;
  onSelect: (player: PlayerCard) => void;
}

export const PlayerCardComponent: React.FC<Props> = ({ player, onSelect }) => {
  // Hooks first, in order: state, effects, custom hooks
  const [isSelected, setIsSelected] = useState(false);
  const dispatch = useDispatch();
  
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
    <TouchableOpacity onPress={handlePress}>
      <Text>{player.name}</Text>
    </TouchableOpacity>
  );
};
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
    const response = await fetch(`/api/cards/generate`, {
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

### Python/FastAPI

#### File Organization
```python
# File naming: snake_case for all Python files
# card_service.py, roster_validation.py, game_engine.py

# Directory structure:
app/
├── api/                # FastAPI route modules
├── services/           # Business logic
├── schemas/            # Pydantic models
├── models/             # Database models (future)
├── utils/              # Helper functions
└── tests/              # Test files
```

#### Imports
```python
# Order: Standard library → Third-party → Internal
import json
import logging
from typing import Optional, Dict, List

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel

from app.services.card_service import CardService
from app.schemas.card import PlayerCard, ChartEntry
```

#### Function Structure
```python
# Use type hints for all function parameters and returns
from typing import Optional, Dict, Any

def generate_player_card(
    name: str, 
    year: str, 
    set_version: Optional[str] = "EXPANDED"
) -> Dict[str, Any]:
    """
    Generate a Showdown player card from MLB statistics.
    
    Args:
        name: Player name or Baseball Reference ID
        year: Season year (1871-present)
        set_version: "CLASSIC", "EXPANDED", or specific year
        
    Returns:
        Dictionary containing card data and metadata
        
    Raises:
        ValueError: If player/year combination not found
        HTTPException: If external API fails
    """
    if not name or not year:
        raise ValueError("Name and year are required")
    
    try:
        # Implementation here
        pass
    except Exception as e:
        logging.error(f"Card generation failed for {name} {year}: {str(e)}")
        raise HTTPException(status_code=500, detail="Card generation failed")
```

#### Error Handling
```python
# Use proper exception handling and logging
import logging
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class CardGenerationError(Exception):
    """Custom exception for card generation failures."""
    pass

async def generate_card(name: str, year: str) -> PlayerCard:
    try:
        # Card generation logic
        result = await external_api_call(name, year)
        return PlayerCard(**result)
    except ValueError as e:
        logger.warning(f"Invalid input: {name}, {year} - {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except CardGenerationError as e:
        logger.error(f"Card generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal card generation error")
```

## 🧪 Testing Patterns

### TypeScript/React Native Tests
```typescript
// Use descriptive test names and group related tests
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

### Python Tests
```python
import pytest
from app.services.card_service import CardService
from app.schemas.card import PlayerCard

class TestCardService:
    """Test card generation functionality."""
    
    @pytest.fixture
    def card_service(self):
        return CardService()
    
    def test_generate_valid_player_card(self, card_service):
        """Should generate valid card for known player/year."""
        result = card_service.generate_card("Mike Trout", "2021")
        
        assert result.name == "Mike Trout"
        assert result.year == "2021"
        assert result.player_type == "Hitter"
        assert result.points > 0
    
    def test_generate_card_invalid_player(self, card_service):
        """Should raise exception for invalid player."""
        with pytest.raises(ValueError, match="Player not found"):
            card_service.generate_card("Fake Player", "2021")
```

## 📁 Naming Conventions

### Files and Directories
- **TypeScript**: PascalCase for components (`PlayerCard.tsx`), camelCase for utilities (`gameUtils.ts`)
- **Python**: snake_case for all files (`card_service.py`, `roster_validation.py`)
- **Directories**: kebab-case or camelCase consistently within each language

### Variables and Functions
- **TypeScript**: camelCase (`playerName`, `calculateAdvantage`)
- **Python**: snake_case (`player_name`, `calculate_advantage`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_POINTS`, `DEFAULT_DECK_SIZE`)

### Types and Classes
- **TypeScript**: PascalCase (`PlayerCard`, `GameEngine`)
- **Python**: PascalCase (`PlayerCard`, `CardService`)

## 🚨 Important Project-Specific Rules

### Legal Compliance (CRITICAL)
- **Never include**: Player images, team logos, copyrighted artwork
- **Always use**: Generic names for teams ("New York" not "Yankees")  
- **Required disclaimers**: Mark all generated content as unofficial fan project

### Game Accuracy
- **MLB Showdown rules**: Must match original WotC mechanics exactly
- **Card calculations**: Use authentic formulas from mlb_showdown_card_bot
- **Test coverage**: All game logic requires comprehensive testing

### Code Quality
- **TypeScript**: Strict mode enabled, no `any` types without justification
- **Python**: Type hints required for all public functions
- **Testing**: Minimum 80% coverage for game engine logic
- **Documentation**: All public APIs documented with examples

This guide ensures consistent, high-quality code that respects the project's legal constraints while delivering an authentic MLB Showdown experience.