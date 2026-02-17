# 🎵 YouTube Audio Backend Server

This backend server extracts real YouTube audio URLs for your React Native music app.

## ⚡ Quick Start

### Windows Users
```bash
start.bat
```

### Mac/Linux Users  
```bash
chmod +x start.sh
./start.sh
```

### Manual Setup
```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Edit .env and add your YouTube API key
# YOUTUBE_API_KEY=your_api_key_here

# 4. Start server
npm run dev
```

## 🔑 Getting YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project or select existing one
3. Enable "YouTube Data API v3"
4. Go to Credentials → Create Credentials → API Key
5. Copy the API key to your `.env` file

## 🚀 Features

- ✅ **Real YouTube audio extraction**
- ✅ **High-quality audio streams**
- ✅ **Search integration**
- ✅ **Trending music**
- ✅ **Direct streaming endpoints**
- ✅ **Metadata fetching**
- ✅ **Background processing**

## 📡 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Server status |
| `GET /api/audio/:videoId` | Get audio stream URL |
| `GET /api/stream/:videoId` | Direct audio stream |
| `GET /api/search?q=query` | Search videos |
| `GET /api/trending` | Get trending music |
| `GET /api/video/:videoId` | Video metadata |

## 🔧 Usage in React Native

The React Native app will automatically detect if this backend is running and use real YouTube audio when available.

**Backend Available** ✅ → Real YouTube Audio  
**Backend Offline** ⚠️ → Fallback Audio (still works!)

## 🛠️ Development

```bash
npm run dev     # Start with auto-reload
npm start       # Start production mode
```

## 📊 Monitoring

- Health check: `http://localhost:3001/health`
- Server logs show all requests and audio extractions
- YouTube API quota usage tracked automatically

## 🚨 Important

- Keep your YouTube API key secure
- Monitor your API quota (10,000 units/day free)
- Respect YouTube's Terms of Service
- For production, deploy to a cloud service

## 📈 Deploying to Production

See [YOUTUBE_BACKEND_SETUP.md](../YOUTUBE_BACKEND_SETUP.md) for deployment options:
- Heroku
- Vercel  
- Railway
- DigitalOcean

## 🎯 Status Indicators

Your React Native app will show:

🟢 **Real YouTube Audio** - Backend connected, using actual YouTube streams  
🟠 **Fallback Audio** - Backend offline, using alternative high-quality audio  
⏳ **Checking...** - Connecting to backend server

## 💡 Tips

- Start this server before opening your React Native app for best experience
- Server runs on port 3001 by default (configurable in .env)
- API key only needs YouTube Data API v3 enabled
- Audio extraction happens server-side for better performance