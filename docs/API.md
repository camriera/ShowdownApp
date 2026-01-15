# Showdown Simulator API Documentation

This document describes the backend API endpoints for the Showdown Simulator, which wraps the `mlb_showdown_card_bot` to provide player card generation and game services.

---

## Base URL

```
Development: http://localhost:8000
Production: https://api.showdownsim.com  # TBD
```

## Authentication

Currently no authentication required for MVP. Future versions will include:
- JWT tokens for user accounts
- Rate limiting by IP
- API keys for third-party access

---

## Endpoints

### 1. Health Check

```http
GET /health
```

**Description**: Check API service status

**Response**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-01-06T19:00:00Z",
  "services": {
    "database": "connected",
    "card_bot": "available"
  }
}
```

---

### 2. Generate Player Card

```http
POST /api/cards-generate
```

**Description**: Generate a Showdown player card from MLB statistics

**Request Body**:
```json
{
  "name": "Mike Trout",
  "year": "2021", 
  "set_version": "EXPANDED",
  "era": "DYNAMIC",
  "expansion": "BS"
}
```

**Parameters**:
| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `name` | string | Yes | Player name or Baseball Reference ID | - |
| `year` | string | Yes | Season year (1871-present) | - |
| `set_version` | string | No | "CLASSIC", "EXPANDED", or specific year | "EXPANDED" |
| `era` | string | No | "DYNAMIC" or specific era | "DYNAMIC" |
| `expansion` | string | No | Expansion abbreviation | "BS" |

**Response (Success)**:
```json
{
  "name": "Mike Trout",
  "year": "2021",
  "bref_id": "troutmi01",
  "player_type": "Hitter",
  
  "command": 12,
  "outs": 14,
  "chart": [
    {
      "range": [1, 6],
      "result": "SO"
    },
    {
      "range": [7, 14], 
      "result": "GB"
    },
    {
      "range": [15, 16],
      "result": "FB"
    },
    {
      "range": [17, 17],
      "result": "BB"
    },
    {
      "range": [18, 19],
      "result": "1B"
    },
    {
      "range": [20, 20],
      "result": "HR"
    }
  ],
  
  "positions": {
    "OF": 2,
    "CF": 3
  },
  "speed": 15,
  
  "points": 520,
  "team": "LAA",
  "hand": "R",
  "icons": ["★"]
}
```

**Response (Error)**:
```json
{
  "error": "Player not found on Baseball Reference",
  "error_code": "PLAYER_NOT_FOUND",
  "details": {
    "name": "Mike Trout",
    "year": "1999",
    "suggestion": "Try years 2009-present for Mike Trout"
  }
}
```

**Error Codes**:
| Code | Description |
|------|-------------|
| `PLAYER_NOT_FOUND` | Player/year combination not found |
| `INVALID_YEAR` | Year outside valid range |
| `RATE_LIMITED` | Too many requests to Baseball Reference |
| `CARD_GENERATION_FAILED` | Internal error in card calculation |

---

### 3. Search Players

```http
GET /api/cards-search?query={name}&year={year}&limit={limit}
```

**Description**: Search for players by name

**Parameters**:
| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `query` | string | Yes | Player name (minimum 2 characters) | - |
| `year` | string | No | Filter by specific year | - |
| `limit` | number | No | Maximum results | 10 |

**Example Request**:
```http
GET /api/cards-search?query=trout&year=2021&limit=5
```

**Response**:
```json
{
  "players": [
    {
      "name": "Mike Trout",
      "bref_id": "troutmi01",
      "years_active": ["2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2021"],
      "primary_position": "CF",
      "teams": ["LAA"]
    },
    {
      "name": "Steven Trout", 
      "bref_id": "troutst01",
      "years_active": ["1978", "1979", "1980"],
      "primary_position": "P",
      "teams": ["CHA"]
    }
  ],
  "total": 2,
  "query": "trout"
}
```

---

### 4. Validate Roster

```http
POST /api/rosters/validate
```

**Description**: Validate a team roster against DCI tournament rules

**Request Body**:
```json
{
  "roster": {
    "name": "My Team",
    "lineup": [
      {
        "id": "player_1",
        "name": "Mike Trout",
        "position": "CF",
        "points": 520,
        "batting_order": 3
      }
      // ... 8 more lineup players
    ],
    "bench": [
      {
        "id": "player_10", 
        "name": "Bench Player",
        "position": "OF",
        "points": 200
      }
      // ... bench players
    ],
    "pitchers": [
      {
        "id": "pitcher_1",
        "name": "Starter 1", 
        "role": "SP",
        "points": 450,
        "rotation_order": 1
      }
      // ... all pitchers
    ]
  }
}
```

**Response (Valid)**:
```json
{
  "valid": true,
  "total_points": 4890,
  "point_breakdown": {
    "lineup": 3200,
    "bench_hitters": 160,
    "pitchers": 1530
  },
  "validation_details": {
    "roster_size": 25,
    "lineup_size": 9, 
    "starter_count": 4,
    "starter_order_valid": true
  }
}
```

**Response (Invalid)**:
```json
{
  "valid": false,
  "errors": [
    "Total points (5120) exceeds cap of 5000",
    "Must have exactly 4 starting pitchers (found 3)",
    "Starting pitchers must be ordered by point value (highest to lowest)"
  ],
  "total_points": 5120,
  "point_breakdown": {
    "lineup": 3500,
    "bench_hitters": 220, 
    "pitchers": 1400
  }
}
```

---

### 5. Random Player

```http
GET /api/cards/random?era={era}&edition={edition}&player_type={type}
```

**Description**: Get a random player for quick game setup

**Parameters**:
| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `era` | string | No | "DEADBALL", "STEROID", etc. | Any |
| `edition` | string | No | "2001", "2004", etc. | Any |
| `player_type` | string | No | "Hitter" or "Pitcher" | Any |

**Example Request**:
```http
GET /api/cards/random?era=STEROID&player_type=Hitter
```

**Response**:
```json
{
  "name": "Barry Bonds",
  "year": "2001", 
  "bref_id": "bondsba01",
  "player_type": "Hitter",
  "command": 15,
  "outs": 9,
  "chart": [
    // ... chart data
  ],
  "positions": {
    "LF": 1
  },
  "speed": 8,
  "points": 590,
  "team": "SFG",
  "hand": "L",
  "icons": ["★", "♦"]
}
```

---

### 6. Historical Teams

```http
GET /api/teams/historical?year={year}
```

**Description**: Get pre-built historical team rosters

**Parameters**:
| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `year` | string | No | Filter by specific year | All years |

**Response**:
```json
{
  "teams": [
    {
      "id": "2001_mariners",
      "name": "2001 Seattle Mariners",
      "year": "2001",
      "wins": 116,
      "description": "Record-setting regular season team",
      "total_points": 4950,
      "lineup": [
        // ... 9 position players
      ],
      "pitchers": [
        // ... pitching staff
      ]
    }
    // ... more teams
  ]
}
```

---

## Data Models

### Player Card Schema

```typescript
interface PlayerCard {
  // Identity
  name: string;
  year: string;
  bref_id: string;
  player_type: 'Pitcher' | 'Hitter';
  
  // Core game stats  
  command: number;        // Control (P) or On-Base (H)
  outs: number;          // Chart outs count
  chart: ChartEntry[];   // Result mappings
  
  // Position players only
  positions?: { [position: string]: number };
  speed?: number;
  
  // Pitchers only  
  ip?: number;           // Innings Pitched rating
  
  // Metadata
  points: number;
  team: string;
  hand: 'L' | 'R' | 'S'; // Left, Right, Switch
  icons: string[];       // Achievement icons
  era: 'Classic' | 'Expanded';
}

interface ChartEntry {
  range: [number, number]; // [start, end] inclusive
  result: string;          // 'SO', 'GB', 'FB', 'BB', '1B', '2B', '3B', 'HR'
}
```

### Roster Schema

```typescript
interface Roster {
  name: string;
  lineup: LineupPlayer[];      // 9 players
  bench: BenchPlayer[];        // Variable count  
  pitchers: PitcherPlayer[];   // 4+ starters + relievers
}

interface LineupPlayer extends PlayerCard {
  batting_order: number;       // 1-9
  primary_position: string;    // Starting position
}

interface PitcherPlayer extends PlayerCard {
  role: 'SP' | 'RP' | 'CL';   // Starter, Reliever, Closer
  rotation_order?: number;     // 1-4 for starters
}
```

---

## Rate Limiting

| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| `/api/cards-generate` | 60 requests | 1 minute | Baseball Reference limitation |
| `/api/cards-search` | 120 requests | 1 minute | Lighter database queries |
| `/api/rosters/validate` | 30 requests | 1 minute | Complex calculations |
| All others | 300 requests | 1 minute | General limit |

**Rate Limit Headers**:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1641484800
```

**Rate Limit Exceeded Response**:
```json
{
  "error": "Rate limit exceeded",
  "error_code": "RATE_LIMITED", 
  "retry_after": 30
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "error": "Human-readable error message",
  "error_code": "MACHINE_READABLE_CODE",
  "details": {
    // Additional context
  },
  "timestamp": "2026-01-06T19:00:00Z",
  "request_id": "req_123456789"
}
```

### HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| `200` | OK | Successful request |
| `400` | Bad Request | Invalid input parameters |
| `404` | Not Found | Player/resource not found |
| `422` | Unprocessable Entity | Valid format, invalid data |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |
| `503` | Service Unavailable | Temporary outage |

---

## Development Setup

### Local Development

1. **Install Dependencies**:
```bash
cd backend
pip install -r requirements.txt
```

2. **Environment Variables**:
```bash
# .env file
DATABASE_URL=postgresql://localhost:5432/showdown
BASEBALL_REF_CACHE_TTL=3600
DEBUG=true
```

3. **Run Server**:
```bash
uvicorn app.main:app --reload --port 8000
```

4. **API Documentation**:
```
http://localhost:8000/docs  # Swagger UI
http://localhost:8000/redoc # ReDoc
```

### Testing

```bash
# Unit tests
pytest tests/unit/

# Integration tests
pytest tests/integration/

# API tests with coverage
pytest --cov=app tests/
```

### Production Deployment

```bash
# Docker build
docker build -t showdown-api .

# Environment variables
export DATABASE_URL=postgresql://prod-db:5432/showdown
export BASEBALL_REF_CACHE_TTL=7200

# Run container
docker run -p 8000:8000 showdown-api
```

---

This API serves as the foundation for the mobile app's card generation and game logic, providing reliable access to authentic MLB Showdown player data while respecting rate limits and fair use policies.