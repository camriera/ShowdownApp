# Contributing to Showdown Simulator

Thanks for your interest in contributing to the Showdown Simulator! This guide will help you get started with contributing to our fan project recreating the classic MLB Showdown experience.

## 🎯 Project Mission

Our goal is to preserve and modernize the beloved MLB Showdown baseball card game for mobile devices while:
- Maintaining authentic gameplay mechanics
- Respecting intellectual property rights
- Building a positive community around the game
- Staying true to the original experience

## 🤝 How to Contribute

### Types of Contributions We Welcome

- **Bug fixes** and performance improvements
- **Game engine** enhancements and rule implementations
- **UI/UX improvements** and mobile optimization
- **Documentation** updates and clarifications
- **Testing** and quality assurance
- **Community features** and social functionality
- **Accessibility** improvements

### What We Don't Accept

- **Copyrighted content** (player images, team logos, official artwork)
- **Monetization features** (in-app purchases, ads, donations)
- **Unauthorized use** of MLB or WotC trademarks
- **Breaking changes** that compromise fair use protections

## 🚀 Getting Started

### 1. Setup Development Environment

**Prerequisites:**
- Node.js 18+
- Python 3.10+
- Git
- Expo CLI
- Android Studio or Xcode (for device testing)

**Clone and Setup:**
```bash
# Fork the repo on GitHub first, then:
git clone git@github.com:YOUR-USERNAME/ShowdownApp.git
cd ShowdownApp

# Setup mobile app
cd mobile
npm install

# Setup backend
cd ../backend
pip install -r requirements.txt

# Run tests to verify setup
npm test
```

### 2. Understanding the Codebase

```
ShowdownApp/
├── mobile/                 # React Native + Expo app
│   ├── src/
│   │   ├── components/     # Reusable UI components  
│   │   ├── screens/        # Screen-level components
│   │   ├── engine/         # Game logic implementation
│   │   ├── store/          # Redux state management
│   │   └── models/         # TypeScript interfaces
│   
├── backend/                # Python FastAPI server
│   ├── app/
│   │   ├── api/            # REST API endpoints
│   │   ├── services/       # Business logic
│   │   └── schemas/        # Pydantic data models
│   
└── docs/                   # Project documentation
```

**Key Files:**
- `mobile/src/engine/GameEngine.ts` - Core game loop
- `mobile/src/engine/phases/` - Pitch/Swing/Result phases  
- `mobile/src/store/slices/gameSlice.ts` - Game state management
- `backend/app/services/card_service.py` - Card generation wrapper

## 📋 Development Guidelines

### Code Style

**TypeScript/React Native:**
```typescript
// Use PascalCase for components
export const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  // Use camelCase for variables and functions
  const calculatePoints = (stats: PlayerStats): number => {
    // Prefer explicit types
    return stats.hitting + stats.fielding;
  };
  
  return <View>{/* Component JSX */}</View>;
};
```

**Python:**
```python
# Use snake_case for functions and variables
def generate_player_card(name: str, year: str) -> PlayerCard:
    """Use docstrings for function documentation."""
    # Prefer type hints
    card_data = fetch_player_stats(name, year)
    return process_card_data(card_data)
```

### Testing Requirements

**Before submitting a PR:**
```bash
# Run all tests
npm test                    # Mobile tests
cd backend && pytest       # Backend tests
npm run lint               # Linting
npm run type-check         # TypeScript validation
```

**Test Coverage:**
- New game engine logic requires unit tests
- UI components need basic render tests
- API endpoints require integration tests
- Critical paths need E2E tests

### Documentation Standards

- **Code comments** for complex game rules/calculations
- **JSDoc** for public TypeScript functions
- **Docstrings** for Python functions
- **README updates** for new features
- **Type definitions** for all data models

## 🔄 Contribution Workflow

### 1. Pick an Issue

- Browse [open issues](https://github.com/camriera/ShowdownApp/issues)
- Look for `good first issue` or `help wanted` labels
- Comment on the issue to claim it
- Ask questions if requirements are unclear

### 2. Create a Feature Branch

```bash
# Start from main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-description
```

### 3. Make Your Changes

**Commit Guidelines:**
- Use clear, descriptive commit messages
- Follow [conventional commits](https://www.conventionalcommits.org/) format
- Make atomic commits (one logical change per commit)

```bash
# Good commit messages:
git commit -m "feat(engine): implement fatigue system for pitchers"
git commit -m "fix(ui): correct chart display on small screens"  
git commit -m "docs: update game rules documentation"

# Avoid:
git commit -m "fixes"
git commit -m "WIP"
git commit -m "misc changes"
```

### 4. Test Your Changes

```bash
# Test mobile app
cd mobile
npm test
npm run lint

# Test backend
cd backend  
pytest
python -m flake8

# Manual testing
npm start  # Test on device/simulator
```

### 5. Submit a Pull Request

**PR Requirements:**
- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated (if needed)
- [ ] No legal/IP concerns introduced
- [ ] Performance impact considered

**PR Template:**
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] No regressions introduced

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No IP/legal concerns
```

## 🎮 Game Development Guidelines

### Implementing Game Rules

When adding new game mechanics, ensure:

1. **Accuracy to Original Rules**
```typescript
// Reference official sources in comments
// Source: MLB Showdown 2001 Rulebook, Section 4.3
const calculateAdvantage = (pitchResult: number, batterOnBase: number): Advantage => {
  return pitchResult > batterOnBase ? Advantage.PITCHER : Advantage.BATTER;
};
```

2. **Testable Implementation**
```typescript
// Make functions pure for easy testing
export const resolveChartResult = (chart: Chart, roll: number): ChartResult => {
  // Pure function - no side effects
  return chart.entries.find(entry => 
    roll >= entry.range[0] && roll <= entry.range[1]
  )?.result || ChartResult.ERROR;
};
```

3. **Configurable Rules**
```typescript
// Support both Classic (2000-01) and Expanded (2002-05) rules
interface GameConfig {
  ruleSet: 'classic' | 'expanded';
  allowExtendedCharts: boolean;
  strategyCardLimit: number;
}
```

### UI/UX Considerations

- **Mobile-first design** (touch-friendly, readable text)
- **Accessibility** (screen readers, color contrast)
- **Performance** (smooth animations, fast loading)
- **Offline support** (local storage, graceful degradation)

## 🐛 Bug Reports

Use the [issue template](https://github.com/camriera/ShowdownApp/issues/new) with:

**Required Information:**
- Device/platform (iOS 16, Android 12, etc.)
- App version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/logs if applicable

**Priority Levels:**
- **Critical**: App crashes, game-breaking bugs
- **High**: Major feature not working as designed
- **Medium**: Minor UI issues, edge cases
- **Low**: Cosmetic issues, nice-to-have improvements

## 💡 Feature Requests

Before suggesting new features:

1. Check [existing issues](https://github.com/camriera/ShowdownApp/issues) for duplicates
2. Consider if it aligns with project goals
3. Think about implementation complexity
4. Ensure it doesn't introduce IP concerns

**Good Feature Ideas:**
- Enhanced game statistics
- Tournament bracket system
- Historical player rosters
- Accessibility improvements
- Performance optimizations

**Ideas We Can't Implement:**
- Player photos/images
- Official team logos
- Monetization features
- Licensed content integration

## 📞 Getting Help

**Questions about contributing?**
- Open a [Discussion](https://github.com/camriera/ShowdownApp/discussions)
- Comment on relevant issues
- Review existing documentation

**Technical questions?**
- Check [docs/](./docs/) folder
- Look at existing code examples
- Ask in issue comments

## 🏆 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Hall of Fame documentation
- GitHub contributors page

## 📋 Legal Guidelines

**Important**: As a fan project, we must be careful about intellectual property.

**✅ Safe Contributions:**
- Original code implementations
- Player names and statistics (public domain)
- Generic UI designs
- Documentation and tutorials

**❌ Avoid:**
- Player photographs or likenesses
- Team logos or uniforms
- Copyrighted artwork or designs
- Official MLB Showdown card layouts
- Monetization features

**When in Doubt:**
- Ask in the issue or PR comments
- Reference the legal guidelines in README.md
- Err on the side of caution

---

## Thank You! ⚾

Your contributions help preserve and modernize a beloved game for the community. Whether you're fixing bugs, adding features, or improving documentation, every contribution matters.

**Happy coding, and play ball! ⚾**