# Client-Side Migration Guide

## Overview
The Gitune app has been refactored to run **entirely client-side** without requiring a backend server. All YouTube music discovery and management now happens directly in the app using the YouTube Data API.

## What Changed

### 1. **Removed Backend Dependencies**
- ❌ No longer requires the backend server running on Render
- ❌ No need to deploy/maintain `backend-server/`
- ✅ All operations are now purely client-side

### 2. **YouTubeAudioService Refactoring**
**File**: `src/api/youtubeAudioService.ts`

**Before**: 
```typescript
// Made HTTP requests to backend URLs
fetch(`${BACKEND_SERVER_URL}/api/audio/${videoId}`)
fetch(`${BACKEND_SERVER_URL}/api/search?q=${query}`)
```

**After**:
```typescript
// Calls YouTube API functions directly
searchMusic(this.apiKey, query, maxResults)
getTrendingMusic(this.apiKey, maxResults)
getMusicRecommendations(this.apiKey, songTitle, maxResults)
```

### 3. **API Key Management**
The YouTube Data API key must be provided by users. This is now **required** to use the app:

```typescript
// Initialize with API key
youtubeAudioService.setApiKey(userApiKey);

// Check if configured
youtubeAudioService.isConfigured()
```

### 4. **Audio Playback**
- **Metadata**: Fetched directly from YouTube API ✅
- **Search & Discovery**: Works directly from YouTube API ✅
- **Audio Extraction**: Uses fallback demo audio (client-side extraction from YouTube is not possible due to CORS/DRM restrictions)

### 5. **VideosScreen Updates**
**File**: `src/screens/VideosScreen.tsx`

- `loadUserSettings()`: Now loads YouTube API key from user profile
- `loadTrendingMusic()`: Uses `youtubeAudioService.getTrendingMusic()` directly
- `handleSearch()`: Uses `youtubeAudioService.searchYouTube()` directly
- `playSong()`: Uses `youtubeAudioService.getRecommendations()` for similar tracks
- Status indicator: Shows "Client-Side Ready" instead of "Real YouTube"

## How to Use

### 1. **Get a YouTube API Key**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable YouTube Data API v3
4. Create an API key (restriction to Android apps optional)
5. Copy the key

### 2. **Add API Key to App**
1. Open Profile/Settings in the app
2. Add your YouTube API key
3. The app will automatically initialize the service

### 3. **Use the App**
- Browse trending music (from YouTube)
- Search for songs/artists (from YouTube)
- Get recommendations based on currently playing song
- Players with sample audio files

## Technical Details

### Methods in YouTubeAudioService

```typescript
// Configuration
setApiKey(apiKey: string)
isConfigured(): boolean
checkBackendHealth(): Promise<boolean>

// Music Discovery  
searchYouTube(query: string, maxResults?: number): Promise<Song[]>
getTrendingMusic(maxResults?: number, regionCode?: string): Promise<Song[]>
getRecommendations(songTitle: string, maxResults?: number): Promise<Song[]>

// Audio Playback
getAudioUrlWithFallback(song: Song): Promise<{type, url, info}>
getYouTubeVideoUrl(videoId: string): string
getEmbedUrl(videoId: string): string

// Utils
formatDuration(duration: string | number): string
formatViewCount(count: string | number): string
```

### Fallback Audio
Since direct YouTube audio extraction is not possible on the client-side (due to CORS and DRM restrictions), the app uses demo audio files from [SoundHelix](https://www.soundhelix.com/examples/mp3):

- 8 different demo audio tracks (rotating based on video ID hash)
- Same for all users (no personalization)
- For production use, consider:
  - YouTube Premium Music API (requires YouTube Music subscription)
  - Embedding YouTube player ([YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference))
  - Integration with music streaming services (Spotify, Apple Music, etc.)

## Backend Server (Optional)

If you still want to use the backend server for enhanced audio extraction via yt-dlp:

1. Keep the `backend-server/` folder
2. Deploy it separately (Render, Heroku, etc.)
3. The app will automatically use it if available
4. If backend is unavailable, falls back to client-side + demo audio

## Environment Variables

No special environment variables needed for client-side mode. Users provide their YouTube API key via the app's Profile section.

## Troubleshooting

### "YouTube API key not configured"
- ✓ Get a YouTube API key from Google Cloud Console
- ✓ Add it in the app's Profile/Settings section
- ✓ Reload the app

### "No music found"
- ✓ Check your YouTube API key is valid
- ✓ Verify you have API quota remaining
- ✓ Try a different search term

### "Backend unavailable, using fallback audio"
- This is normal! The app now works completely without a backend
- You're using demo audio for playback
- To get real YouTube audio, deploy the optional backend server

## Summary of Benefits

✅ **No backend required** - runs on client device only  
✅ **Faster deployment** - no server to maintain  
✅ **Better privacy** - all processing local  
✅ **Lower costs** - no server infrastructure  
✅ **Offline metadata** - caches can be added easily  

## Summary of Trade-offs

⚠️ **No real YouTube audio extraction** - uses demo audio  
⚠️ **API quota limits** - subject to Google's rate limits  
⚠️ **Requires API key** - users must provide their own  
⚠️ **No background downloads** - can't pre-download metadata  

---

**Version**: 1.0.0 (Client-Side Only)  
**Last Updated**: 2026-03-30
