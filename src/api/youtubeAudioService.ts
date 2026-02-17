// Enhanced YouTube Service with Real Audio Extraction
import { Song } from './youtube';

// Backend URL — update this after deploying to Render
// For local dev: 'http://192.168.100.46:3001'
// For production: 'https://your-app-name.onrender.com'
const BACKEND_SERVER_URL = 'https://project-dream-backend.onrender.com';

export interface YouTubeAudioInfo {
  success: boolean;
  audioUrl: string;
  quality: string;
  container: string;
  codecs: string;
  duration: number;
  title: string;
  author: string;
  videoId: string;
  extractedAt: string;
}

export interface VideoSearchResponse {
  success: boolean;
  videos: Array<{
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
    publishedAt: string;
    description?: string;
  }>;
  query?: string;
  totalResults: number;
}

export interface TrendingResponse {
  success: boolean;
  videos: Array<{
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
    publishedAt: string;
    viewCount?: string;
    likeCount?: string;
    duration?: string;
  }>;
  regionCode: string;
  totalResults: number;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  youtubeApiConfigured: boolean;
  apiKey: string;
  services: {
    ytDlp: string;
    youtubeDataApi: string;
  };
}

export class YouTubeAudioService {
  private backendHealthy: boolean = false;
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 60000; // 1 minute
  
  /**
   * Check backend health and YouTube API status
   */
  async checkBackendHealth(): Promise<boolean> {
    const now = Date.now();
    
    // Don't check too frequently
    if (this.backendHealthy && (now - this.lastHealthCheck) < this.healthCheckInterval) {
      return this.backendHealthy;
    }

    try {
      console.log('🏥 Checking YouTube backend health...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${BACKEND_SERVER_URL}/api/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const health: HealthStatus = await response.json();
        this.backendHealthy = true;
        this.lastHealthCheck = now;
        
        console.log('✅ Backend healthy:', {
          youtubeApiConfigured: health.youtubeApiConfigured,
          services: health.services
        });
        
        return true;
      } else {
        throw new Error(`Health check failed with status: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Backend not available:', (error as any)?.message);
      this.backendHealthy = false;
      this.lastHealthCheck = now;
      return false;
    }
  }
  
  /**
   * Get real YouTube audio stream URL with enhanced error handling
   */
  async getAudioUrl(videoId: string, quality: string = 'highestaudio'): Promise<YouTubeAudioInfo | null> {
    if (!await this.checkBackendHealth()) {
      console.log('🔄 Backend unavailable, skipping real audio extraction');
      return null;
    }

    try {
      console.log(`🎵 Extracting audio for video: ${videoId}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(
        `${BACKEND_SERVER_URL}/api/audio/${videoId}?quality=${quality}`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const audioInfo: YouTubeAudioInfo = await response.json();
      
      if (audioInfo.success && audioInfo.audioUrl) {
        console.log('✅ Real YouTube audio extracted successfully:');
        console.log(`   Title: ${audioInfo.title}`);
        console.log(`   Quality: ${audioInfo.quality}`);
        console.log(`   Duration: ${audioInfo.duration}s`);
        return audioInfo;
      } else {
        throw new Error('No audio URL in response');
      }
      
    } catch (error) {
      console.error('❌ Failed to get YouTube audio URL:', (error as any)?.message);
      return null;
    }
  }

  /**
   * Stream YouTube audio directly
   */
  getDirectStreamUrl(videoId: string): string {
    return `${BACKEND_SERVER_URL}/api/stream/${videoId}`;
  }

  /**
   * Get video metadata from YouTube API
   */
  async getVideoDetails(videoId: string): Promise<Song | null> {
    if (!await this.checkBackendHealth()) {
      console.log('🔄 Backend unavailable, video details not available');
      return null;
    }

    try {
      console.log(`📋 Getting video details for: ${videoId}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(`${BACKEND_SERVER_URL}/api/video/${videoId}/details`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.video) {
        const video = data.video;
        console.log(`✅ Video details retrieved: ${video.title}`);
        
        return {
          id: video.id,
          title: video.title,
          artist: video.artist,
          duration: this.formatDuration(video.duration),
          thumbnail: video.thumbnail,
          channelTitle: video.artist,
          viewCount: this.formatViewCount(video.viewCount)
        };
      } else {
        throw new Error('No video details available');
      }
      
    } catch (error) {
      console.error('❌ Failed to get video metadata:', (error as any)?.message);
      return null;
    }
  }

  /**
   * Search YouTube with enhanced backend
   */
  async searchYouTube(query: string, maxResults = 20): Promise<Song[]> {
    if (!await this.checkBackendHealth()) {
      console.log('🔄 Backend unavailable, search not available');
      return [];
    }

    try {
      console.log(`🔍 Searching YouTube for: ${query}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(
        `${BACKEND_SERVER_URL}/api/search?q=${encodeURIComponent(query)}&maxResults=${maxResults}`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Search failed: ${response.status}`);
      }
      
      const data: VideoSearchResponse = await response.json();
      
      if (data.success && data.videos) {
        console.log(`✅ Found ${data.videos.length} videos for: ${query}`);
        return data.videos.map((video: any) => ({
          id: video.id,
          title: video.title,
          artist: video.artist,
          duration: 'Unknown', // Will be fetched when playing
          thumbnail: video.thumbnail,
          channelTitle: video.artist
        }));
      } else {
        console.log(`🔍 No videos found for: ${query}`);
        return [];
      }
      
    } catch (error) {
      console.error('❌ YouTube search failed:', (error as any)?.message);
      return [];
    }
  }

  /**
   * Get trending music from YouTube
   */
  async getTrendingMusic(maxResults = 20, regionCode = 'US'): Promise<Song[]> {
    if (!await this.checkBackendHealth()) {
      console.log('🔄 Backend unavailable, trending not available');
      return [];
    }

    try {
      console.log(`🔥 Getting trending music videos for region: ${regionCode}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(
        `${BACKEND_SERVER_URL}/api/trending?maxResults=${maxResults}&regionCode=${regionCode}`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Trending fetch failed: ${response.status}`);
      }
      
      const data: TrendingResponse = await response.json();
      
      if (data.success && data.videos) {
        console.log(`✅ Found ${data.videos.length} trending videos`);
        return data.videos.map((video: any) => ({
          id: video.id,
          title: video.title,
          artist: video.artist,
          duration: this.formatDuration(video.duration),
          thumbnail: video.thumbnail,
          channelTitle: video.artist,
          viewCount: this.formatViewCount(video.viewCount)
        }));
      } else {
        throw new Error('No trending videos available');
      }
      
    } catch (error) {
      console.error('❌ Failed to get trending music:', (error as any)?.message);
      return [];
    }
  }

  /**
   * Check if backend server is available
   */
  async isBackendAvailable(): Promise<boolean> {
    return await this.checkBackendHealth();
  }

  /**
   * Get audio URL with enhanced fallback handling
   */
  // Return detailed choice for playback: direct audio URL, proxied stream, or fallback
  async getAudioUrlWithFallback(song: Song): Promise<{
    type: 'direct' | 'stream' | 'fallback',
    url: string,
    info?: YouTubeAudioInfo
  }> {
    console.log(`🎯 Getting audio for: ${song.title} (${song.id})`);

    const audioInfo = await this.getAudioUrl(song.id);

    // If we have audioInfo, prefer direct URL when container is widely supported
    if (audioInfo && audioInfo.audioUrl) {
      const supportedContainers = ['mp3', 'm4a', 'mp4', 'aac', 'mpeg'];
      const container = (audioInfo.container || '').toLowerCase();

      if (supportedContainers.includes(container)) {
        console.log('🎵 Direct playable container detected:', container);
        return { type: 'direct', url: audioInfo.audioUrl, info: audioInfo };
      }

      // Container not directly supported by expo-av; use proxied stream
      console.log('🔀 Container not directly supported, using proxied stream:', container);
      return { type: 'stream', url: this.getDirectStreamUrl(song.id), info: audioInfo };
    }

    // If backend alive but no audioInfo, use stream proxy
    if (await this.checkBackendHealth()) {
      console.log('🔄 Backend available — using proxied stream');
      return { type: 'stream', url: this.getDirectStreamUrl(song.id) };
    }

    // Fallback to alternative hosted audio
    console.log('🎵 Using fallback audio for:', song.title);
    return { type: 'fallback', url: this.getFallbackAudio(song) };
  }

  /**
   * Fallback audio selection (same as before)
   */
  private getFallbackAudio(song: Song): string {
    const audioOptions = [
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    ];

    const index = song.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % audioOptions.length;
    return audioOptions[index];
  }

  /**
   * Utility methods
   */
  getBackendStatus(): { healthy: boolean; lastCheck: Date } {
    return {
      healthy: this.backendHealthy,
      lastCheck: new Date(this.lastHealthCheck)
    };
  }

  private formatDuration(duration: string | number): string {
    if (typeof duration === 'number') {
      // Duration in seconds
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    if (!duration || duration === 'Unknown') {
      return 'Unknown';
    }
    
    // Convert ISO 8601 duration (PT4M13S) to readable format (4:13)
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) {
      return duration; // Return as-is if not ISO format
    }
    
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');
    
    if (hours) {
      return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    }
    return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
  }

  private formatViewCount(count: string | number): string {
    if (!count) return '0';
    
    const num = typeof count === 'string' ? parseInt(count) : count;
    if (isNaN(num)) return '0';
    
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
}

export const youtubeAudioService = new YouTubeAudioService();