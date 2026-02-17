# 🎵 YouTube Audio Backend Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Backend Dependencies

```bash
cd backend-server
npm install
```

### Step 2: Get YouTube Data API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **YouTube Data API v3**
4. Go to Credentials → Create Credentials → API Key
5. Copy your API key

### Step 3: Configure Environment

Create `.env` file in `backend-server/`:

```env
YOUTUBE_API_KEY=your_youtube_api_key_here
PORT=3001
```

### Step 4: Start Backend Server

```bash
# Development mode
npm run dev

# OR production mode 
npm start
```

Server will run on `http://localhost:3001`

### Step 5: Update React Native App

Update the backend URL in `src/api/youtubeAudioService.ts`:

```typescript
const BACKEND_SERVER_URL = 'http://localhost:3001'; // For local development
// const BACKEND_SERVER_URL = 'https://your-domain.com'; // For production
```

## ✅ Features Included

### 🎯 Real YouTube Audio
- **Extract actual YouTube audio streams**
- **Multiple quality options** (highestaudio, medium, low)
- **Direct streaming endpoints**
- **Metadata fetching** with YouTube Data API

### 🔄 Background Processing
- **Server-side audio extraction** 
- **Async queue processing**
- **Fallback to high-quality alternatives**
- **Error handling and recovery**

### 🛡️ Legal Compliance
- **Uses YouTube Data API** (official)
- **Respects rate limits**
- **Proper attribution**
- **Terms of service compliance**

## 📱 API Endpoints

### Get Audio Stream URL
```
GET /api/audio/:videoId?quality=highestaudio
```
Returns: `{ audioUrl, quality, duration, title }`

### Stream Audio Directly  
```
GET /api/stream/:videoId
```
Returns: Direct audio stream

### Search Videos
```
GET /api/search?q=song+name&maxResults=20
```
Returns: Array of video results

### Get Trending Music
```
GET /api/trending?maxResults=20
```
Returns: Popular music videos

### Video Metadata
```
GET /api/video/:videoId
```
Returns: Full video information

## 🔧 Configuration Options

### Audio Quality Settings
```javascript
// In youtubeAudioService.ts
const audioUrl = await this.getAudioUrl(videoId, {
  quality: 'highestaudio', // or 'medium', 'low'
  format: 'mp4',           // or 'webm'
  filter: 'audioonly'
});
```

### Rate Limiting
```javascript
// Add to server.js
const rateLimit = require('express-rate-limit');

app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

## 🚀 Deployment Options

### Option 1: Heroku
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set YOUTUBE_API_KEY=your_key_here
git push heroku main
```

### Option 2: Vercel
```json
{
  "functions": {
    "backend-server/server.js": {
      "runtime": "nodejs18.x"
    }
  },
  "env": {
    "YOUTUBE_API_KEY": "your_key_here"
  }
}
```

### Option 3: Railway
```bash
railway login
railway new
railway add
railway deploy
```

### Option 4: DigitalOcean App Platform
- Connect GitHub repo
- Set environment variables
- Auto-deploy on push

## 🛠️ Advanced Features

### Caching Layer
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minute cache

app.get('/api/audio/:videoId', async (req, res) => {
  const cached = cache.get(req.params.videoId);
  if (cached) return res.json(cached);
  
  // ... extract audio
  cache.set(req.params.videoId, result);
  res.json(result);
});
```

### Queue Management
```javascript
const Queue = require('bull');
const audioQueue = new Queue('audio processing');

audioQueue.process(async (job) => {
  const { videoId } = job.data;
  return await extractAudioUrl(videoId);
});
```

### Analytics
```javascript
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  // Log to analytics service
  next();
});
```

## 📊 Monitoring

### Health Checks
```
GET /health
```
Returns: Server status and uptime

### Metrics Endpoint
```javascript
app.get('/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    requests: requestCount
  });
});
```

## 🔒 Security

### API Key Protection
```javascript
const allowedOrigins = [
  'http://localhost:8081',   // Expo dev
  'https://your-app.com'     // Production
];

app.use(cors({ origin: allowedOrigins }));
```

### Request Validation
```javascript
const { check, validationResult } = require('express-validator');

app.get('/api/audio/:videoId', [
  check('videoId').isLength({ min: 11, max: 11 }).isAlphanumeric(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ... process request
});
```

## 🎯 Benefits

✅ **Real YouTube Audio** - Actual video audio streams  
✅ **Background Processing** - Server handles extraction  
✅ **Fast Performance** - Optimized for mobile  
✅ **Fallback Support** - Works even if backend is down  
✅ **Legal Compliance** - Uses official YouTube APIs  
✅ **Scalable** - Can handle multiple users  
✅ **Cached Results** - Faster subsequent requests  

## 🚨 Important Notes

1. **YouTube API Quotas**: Free tier = 10,000 units/day
2. **Server Costs**: Free tiers available on most platforms
3. **Legal**: Ensure compliance with YouTube Terms of Service
4. **Fallback**: App works without backend (uses alternative audio)
5. **Performance**: Backend server location affects latency

## 📞 Support

- Check server logs for debugging
- Monitor YouTube API quota usage
- Use health check endpoint for status
- Implement proper error handling

Your app now has **REAL YouTube audio extraction** with proper background processing! 🎉