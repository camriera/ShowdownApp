# 🧪 Testing the Backend Locally

Quick reference for testing your Netlify Functions + Neon Database setup.

## 🔥 Quick Tests

### 1. Database Connection
```bash
npm run db:test
```
✅ Success: `✅ Database connected: { now: 2024-01-08T12:00:00.000Z }`
❌ Failure: Check your `DATABASE_URL` in `.env`

### 2. Start Backend Server
```bash
npm run dev:functions
```
Should see:
```
◈ Netlify Dev ◈
◈ Loaded function cards/generate http://localhost:8888/.netlify/functions/cards/generate
◈ Loaded function cards/search http://localhost:8888/.netlify/functions/cards/search
```

### 3. Test Generate Card Endpoint

**Using curl:**
```bash
curl -X POST http://localhost:8888/.netlify/functions/cards/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mike Trout",
    "year": "2021"
  }'
```

**Using httpie (if installed):**
```bash
http POST localhost:8888/.netlify/functions/cards/generate \
  name="Mike Trout" \
  year="2021"
```

**Expected response:**
```json
{
  "card": {
    "id": "troutmi01-2021",
    "name": "Mike Trout",
    "year": "2021",
    "team": "LAA",
    "playerType": "Hitter",
    "command": 10,
    "outs": 15,
    "chart": [...],
    "points": 540,
    "hand": "R",
    "imageUrl": "https://www.showdownbot.com/..."
  },
  "cached": false,
  "generatedAt": "2024-01-08T12:00:00.000Z"
}
```

### 4. Test Search Endpoint

**Search by name:**
```bash
curl "http://localhost:8888/.netlify/functions/cards/search?name=Trout"
```

**Search by year:**
```bash
curl "http://localhost:8888/.netlify/functions/cards/search?year=2021"
```

**Search by player type:**
```bash
curl "http://localhost:8888/.netlify/functions/cards/search?playerType=Hitter"
```

## 🎯 Test Different Players

Try generating these popular players:

```bash
# Modern superstars
curl -X POST http://localhost:8888/.netlify/functions/cards/generate \
  -H "Content-Type: application/json" \
  -d '{"name":"Aaron Judge","year":"2022"}'

curl -X POST http://localhost:8888/.netlify/functions/cards/generate \
  -H "Content-Type: application/json" \
  -d '{"name":"Shohei Ohtani","year":"2021"}'

# Legendary pitchers
curl -X POST http://localhost:8888/.netlify/functions/cards/generate \
  -H "Content-Type: application/json" \
  -d '{"name":"Pedro Martinez","year":"2000"}'

curl -X POST http://localhost:8888/.netlify/functions/cards/generate \
  -H "Content-Type: application/json" \
  -d '{"name":"Randy Johnson","year":"2001"}'
```

## 🔍 Verify Database Caching

### First Request (generates new card):
```bash
time curl -X POST http://localhost:8888/.netlify/functions/cards/generate \
  -H "Content-Type: application/json" \
  -d '{"name":"Mike Trout","year":"2021"}'
```
Response will have `"cached": false` and take 5-10 seconds.

### Second Request (retrieves from cache):
```bash
time curl -X POST http://localhost:8888/.netlify/functions/cards/generate \
  -H "Content-Type: application/json" \
  -d '{"name":"Mike Trout","year":"2021"}'
```
Response will have `"cached": true` and take < 1 second!

## 📊 Check Database Directly

If you have `psql` installed:

```bash
psql $DATABASE_URL -c "SELECT name, year, (card_data->>'points')::int as points FROM player_cards ORDER BY (card_data->>'points')::int DESC LIMIT 10;"
```

This shows the top 10 players by point value in your database.

## 🌐 Test from Browser

### Using Browser DevTools Console

Open `http://localhost:8888` in your browser, then open DevTools Console (F12) and run:

```javascript
// Generate a card
fetch('http://localhost:8888/.netlify/functions/cards/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Mike Trout', year: '2021' })
})
  .then(r => r.json())
  .then(data => console.log(data));

// Search cards
fetch('http://localhost:8888/.netlify/functions/cards/search?name=Trout')
  .then(r => r.json())
  .then(data => console.log(data));
```

### Using Postman or Insomnia

**Generate Card:**
- Method: `POST`
- URL: `http://localhost:8888/.netlify/functions/cards/generate`
- Headers: `Content-Type: application/json`
- Body (JSON):
  ```json
  {
    "name": "Mike Trout",
    "year": "2021",
    "setVersion": "EXPANDED"
  }
  ```

**Search Cards:**
- Method: `GET`
- URL: `http://localhost:8888/.netlify/functions/cards/search?name=Trout&year=2021`

## 🚨 Common Error Responses

### 400 Bad Request
```json
{
  "error": "Name and year are required"
}
```
**Fix**: Include both `name` and `year` in request body.

### 404 Not Found
```json
{
  "error": "Player not found: Fake Player (2021)"
}
```
**Fix**: Check player name spelling or try a different year.

### 405 Method Not Allowed
```json
{
  "error": "Method not allowed"
}
```
**Fix**: Use `POST` for `/generate`, `GET` for `/search`.

### 500 Internal Server Error
```json
{
  "error": "Card generation failed after all retries"
}
```
**Fix**: Check Netlify Dev logs for details. Might be showdownbot.com API issue.

## 🎪 Test from Mobile App

Once your backend is running, test it from the mobile app:

1. **Start backend**: `npm run dev:functions`
2. **Start mobile app**: `cd mobile && npm start`
3. **Open app** in Expo Go
4. **Navigate** to "Generate Card"
5. **Enter**: Name: "Mike Trout", Year: "2021"
6. **Click**: "Generate Card"
7. **Verify**: Card appears with correct data and image

## 📈 Performance Testing

### Test response times:
```bash
# Generate new card (first time)
time curl -X POST http://localhost:8888/.netlify/functions/cards/generate \
  -H "Content-Type: application/json" \
  -d '{"name":"Mike Trout","year":"2021"}' \
  -o /dev/null -s

# Retrieve cached card (second time)
time curl -X POST http://localhost:8888/.netlify/functions/cards/generate \
  -H "Content-Type: application/json" \
  -d '{"name":"Mike Trout","year":"2021"}' \
  -o /dev/null -s
```

Expected:
- **First request**: 5-15 seconds (calls showdownbot.com API)
- **Cached request**: < 1 second (reads from database)

## 🔬 Debug Mode

Enable verbose logging:

```bash
DEBUG=* npm run dev:functions
```

Watch function logs in real-time:
```bash
# In another terminal
tail -f $(find .netlify -name "*.log" | head -1)
```

## ✅ Success Checklist

- [ ] `npm run db:test` shows database connected
- [ ] `npm run dev:functions` starts without errors
- [ ] Can generate card with curl for Mike Trout 2021
- [ ] Second request for same card returns `cached: true`
- [ ] Can search cards by name
- [ ] Mobile app can connect to backend
- [ ] Card images load in mobile app

## 💡 Pro Tips

1. **Faster testing**: Use `npm run db:populate` first - gives you 20+ cached cards instantly
2. **Watch mode**: Keep `npm run dev:functions` running - changes auto-reload!
3. **Network testing**: Use `ngrok` to expose localhost and test from phone on different network
4. **Bulk testing**: Write a script to generate multiple cards at once

---

**All tests passing? You're ready to develop! 🎉**
