// YouTube Audio Extraction Backend Service
// This Node.js/Express backend handles YouTube audio extraction safely

// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const youtubedl = require('youtube-dl-exec');
const fetch = require('node-fetch');
const { PassThrough } = require('stream');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for React Native app
app.use(cors());
app.use(express.json());

// YouTube Data API setup
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
let youtube = null;

if (YOUTUBE_API_KEY && YOUTUBE_API_KEY !== 'demo_key_replace_with_real_key' && YOUTUBE_API_KEY.length > 10) {
  youtube = google.youtube({
    version: 'v3',
    auth: YOUTUBE_API_KEY
  });
  console.log('✅ YouTube Data API configured with key:', YOUTUBE_API_KEY.substring(0, 8) + '...');
  console.log('🎵 Ready to serve real YouTube audio!');
} else {
  console.log('⚠️  YouTube Data API not properly configured');
  console.log('   Current API key in .env:', YOUTUBE_API_KEY ? YOUTUBE_API_KEY.substring(0, 8) + '...' : 'not set');
  console.log('   Add your API key to .env file: YOUTUBE_API_KEY=your_key_here');
}

// Route 1: Get video metadata using YouTube Data API
app.get('/api/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    if (!youtube) {
      return res.status(503).json({ 
        error: 'YouTube Data API not configured',
        message: 'Please add YOUTUBE_API_KEY to .env file'
      });
    }
    
    const response = await youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: [videoId]
    });

    if (response.data.items.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = response.data.items[0];
    
    res.json({
      id: video.id,
      title: video.snippet.title,
      artist: video.snippet.channelTitle,
      duration: video.contentDetails.duration,
      thumbnail: video.snippet.thumbnails.medium.url,
      viewCount: video.statistics.viewCount,
      publishedAt: video.snippet.publishedAt
    });

  } catch (error) {
    console.error('Error fetching video metadata:', error);
    res.status(500).json({ error: 'Failed to fetch video metadata' });
  }
});

// Route 2: Get audio stream URL using yt-dlp (the key functionality)
app.get('/api/audio/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;

    console.log(`🎵 Extracting audio for video: ${videoId}`);

    // Validate video ID format
    if (!videoId || videoId.length !== 11) {
      return res.status(400).json({ error: 'Invalid YouTube video ID' });
    }

    // Use yt-dlp to get audio URL - much more reliable than ytdl-core
    const info = await youtubedl(`https://www.youtube.com/watch?v=${videoId}`, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: false,
      format: 'bestaudio[ext=m4a]/bestaudio',
      skipDownload: true,
    });

    if (!info || !info.url) {
      // Try to find URL in requested_formats or formats array
      let audioUrl = null;
      let container = 'm4a';
      let codecs = 'unknown';
      
      if (info.requested_formats) {
        const audioFormat = info.requested_formats.find(f => f.acodec !== 'none' && f.vcodec === 'none');
        if (audioFormat) {
          audioUrl = audioFormat.url;
          container = audioFormat.ext || 'm4a';
          codecs = audioFormat.acodec || 'unknown';
        }
      }
      
      if (!audioUrl && info.formats) {
        // Find best audio-only format
        const audioFormats = info.formats
          .filter(f => f.acodec !== 'none' && (f.vcodec === 'none' || !f.vcodec))
          .sort((a, b) => (b.abr || 0) - (a.abr || 0));
        
        if (audioFormats.length > 0) {
          audioUrl = audioFormats[0].url;
          container = audioFormats[0].ext || 'm4a';
          codecs = audioFormats[0].acodec || 'unknown';
        }
      }

      if (!audioUrl) {
        return res.status(404).json({ error: 'Could not extract audio URL' });
      }

      console.log(`✅ Audio extracted (from formats):`);
      console.log(`   Title: ${info.title}`);
      console.log(`   Container: ${container}`);

      return res.json({
        success: true,
        audioUrl: audioUrl,
        quality: 'best',
        container: container,
        codecs: codecs,
        duration: info.duration || 0,
        title: info.title || 'Unknown',
        author: info.uploader || info.channel || 'Unknown',
        videoId: videoId,
        extractedAt: new Date().toISOString()
      });
    }

    console.log(`✅ Audio extracted successfully:`);
    console.log(`   Title: ${info.title}`);
    console.log(`   Container: ${info.ext}`);

    res.json({
      success: true,
      audioUrl: info.url,
      quality: 'best',
      container: info.ext || 'm4a',
      codecs: info.acodec || 'unknown',
      duration: info.duration || 0,
      title: info.title || 'Unknown',
      author: info.uploader || info.channel || 'Unknown',
      videoId: videoId,
      extractedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Audio extraction failed:', error.message || error);
    res.status(500).json({ 
      error: 'Failed to extract audio URL',
      details: error.message || 'Unknown error',
      videoId: req.params.videoId
    });
  }
});

// Route 3: Stream audio directly via proxy (for expo-av compatibility)
app.get('/api/stream/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    console.log(`🔄 Starting stream proxy for video: ${videoId}`);
    
    // Validate video ID
    if (!videoId || videoId.length !== 11) {
      return res.status(400).json({ error: 'Invalid YouTube video ID' });
    }

    // Use yt-dlp to get audio URL
    const info = await youtubedl(`https://www.youtube.com/watch?v=${videoId}`, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: false,
      format: 'bestaudio[ext=m4a]/bestaudio',
      skipDownload: true,
    });

    // Extract the audio URL from the info
    let audioUrl = info.url;
    let container = info.ext || 'm4a';
    
    if (!audioUrl) {
      if (info.requested_formats) {
        const audioFormat = info.requested_formats.find(f => f.acodec !== 'none' && f.vcodec === 'none');
        if (audioFormat) {
          audioUrl = audioFormat.url;
          container = audioFormat.ext || 'm4a';
        }
      }
      if (!audioUrl && info.formats) {
        const audioFormats = info.formats
          .filter(f => f.acodec !== 'none' && (f.vcodec === 'none' || !f.vcodec))
          .sort((a, b) => (b.abr || 0) - (a.abr || 0));
        if (audioFormats.length > 0) {
          audioUrl = audioFormats[0].url;
          container = audioFormats[0].ext || 'm4a';
        }
      }
    }

    if (!audioUrl) {
      return res.status(404).json({ error: 'Could not extract audio URL for streaming' });
    }

    const contentType = container === 'webm' ? 'audio/webm' : 'audio/mp4';
    
    console.log(`📊 Streaming: ${info.title} (${container})`);

    // Proxy the audio URL
    const audioResponse = await fetch(audioUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'identity',
        'Range': req.headers.range || 'bytes=0-',
      }
    });

    if (!audioResponse.ok && audioResponse.status !== 206) {
      console.error('❌ Failed to fetch audio:', audioResponse.status, audioResponse.statusText);
      return res.status(502).json({ error: 'Failed to fetch audio from source' });
    }

    // Forward headers
    res.setHeader('Content-Type', contentType);
    if (audioResponse.headers.get('content-length')) {
      res.setHeader('Content-Length', audioResponse.headers.get('content-length'));
    }
    if (audioResponse.headers.get('content-range')) {
      res.setHeader('Content-Range', audioResponse.headers.get('content-range'));
      res.status(206);
    }
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Handle client disconnect
    req.on('close', () => {
      if (audioResponse.body) audioResponse.body.destroy();
    });

    // Pipe audio data to response
    audioResponse.body.pipe(res);

  } catch (error) {
    console.error('❌ Streaming failed:', error.message || error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to start stream',
        details: error.message || 'Unknown error',
        videoId: req.params.videoId
      });
    }
  }
});

// Route 4: Search YouTube videos
app.get('/api/search', async (req, res) => {
  try {
    const { q, maxResults = 20, type = 'video' } = req.query;

    if (!youtube) {
      return res.status(503).json({ 
        error: 'YouTube Data API not configured',
        message: 'Please add YOUTUBE_API_KEY to .env file',
        videos: [] 
      });
    }

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    console.log(`🔍 Searching YouTube for: ${q}`);

    const response = await youtube.search.list({
      part: ['snippet'],
      q: q + ' music', // Add music to search query for better results
      type: [type],
      maxResults: parseInt(maxResults),
      videoCategoryId: '10', // Music category
      order: 'relevance'
    });

    const videos = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      publishedAt: item.snippet.publishedAt,
      description: item.snippet.description?.substring(0, 150) + '...'
    }));

    console.log(`✅ Found ${videos.length} videos for: ${q}`);
    res.json({ 
      success: true, 
      videos,
      query: q,
      totalResults: videos.length
    });

  } catch (error) {
    console.error('❌ Search failed:', error);
    res.status(500).json({ 
      error: 'Search failed',
      details: error.message
    });
  }
});

// Route 5: Get trending music
app.get('/api/trending', async (req, res) => {
  try {
    const { maxResults = 20, regionCode = 'US' } = req.query;

    if (!youtube) {
      return res.status(503).json({ 
        error: 'YouTube Data API not configured',
        message: 'Please add YOUTUBE_API_KEY to .env file',
        videos: [] 
      });
    }

    console.log(`🔥 Getting trending music videos for region: ${regionCode}`);

    const response = await youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      chart: 'mostPopular',
      videoCategoryId: '10', // Music category
      maxResults: parseInt(maxResults),
      regionCode: regionCode
    });

    const videos = response.data.items.map(item => ({
      id: item.id,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      publishedAt: item.snippet.publishedAt,
      viewCount: item.statistics?.viewCount,
      likeCount: item.statistics?.likeCount,
      duration: item.contentDetails?.duration
    }));

    console.log(`✅ Found ${videos.length} trending videos`);
    res.json({ 
      success: true, 
      videos,
      regionCode,
      totalResults: videos.length
    });

  } catch (error) {
    console.error('❌ Trending fetch failed:', error);
    res.status(500).json({ 
      error: 'Failed to get trending videos',
      details: error.message
    });
  }
});

// Route 6: Get video details
app.get('/api/video/:videoId/details', async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!youtube) {
      // Fallback to yt-dlp for basic info
      const info = await youtubedl(`https://www.youtube.com/watch?v=${videoId}`, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        skipDownload: true,
      });
      return res.json({
        success: true,
        video: {
          id: videoId,
          title: info.title,
          artist: info.uploader || info.channel || 'Unknown',
          duration: info.duration,
          thumbnail: info.thumbnail,
          description: (info.description || '').substring(0, 300) + '...',
          publishedAt: info.upload_date,
          viewCount: info.view_count
        },
        source: 'yt-dlp'
      });
    }

    console.log(`📋 Getting details for video: ${videoId}`);

    const response = await youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: [videoId]
    });

    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const item = response.data.items[0];
    const video = {
      id: item.id,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      description: item.snippet.description?.substring(0, 500) + '...',
      publishedAt: item.snippet.publishedAt,
      duration: item.contentDetails?.duration,
      viewCount: item.statistics?.viewCount,
      likeCount: item.statistics?.likeCount,
      commentCount: item.statistics?.commentCount
    };

    console.log(`✅ Video details retrieved: ${item.snippet.title}`);
    res.json({ 
      success: true, 
      video,
      source: 'youtube-api'
    });

  } catch (error) {
    console.error('❌ Video details fetch failed:', error);
    res.status(500).json({ 
      error: 'Failed to get video details',
      details: error.message
    });
  }
});

// Route 7: Health check with API status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    youtubeApiConfigured: !!youtube,
    apiKey: YOUTUBE_API_KEY ? YOUTUBE_API_KEY.substring(0, 8) + '...' : 'not set',
    services: {
      ytDlp: 'active',
      youtubeDataApi: youtube ? 'configured' : 'not configured'
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 YouTube Audio Backend Server running on port ${PORT}`);
  console.log(`🔗 Available endpoints:`);
  console.log(`   GET  /api/health - Server health check`);
  console.log(`   GET  /api/audio/:videoId - Extract audio URL`);
  console.log(`   GET  /api/stream/:videoId - Stream audio directly`);
  if (youtube) {
    console.log(`   GET  /api/search?q=query - Search YouTube videos`);
    console.log(`   GET  /api/trending - Get trending music videos`);
    console.log(`   GET  /api/video/:videoId/details - Get video details`);
  }
  console.log(`\n🎵 Ready to serve YouTube audio!`);
});
// Server started above; export app for tests or external use
module.exports = app;