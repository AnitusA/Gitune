// Client-Side YouTube Service (No Backend Required)
import { Song, searchMusic, getTrendingMusic, getMusicRecommendations } from './youtube';

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

export interface HealthStatus {
  youtubeApiConfigured: boolean;
  services: string[];
}

export class YouTubeAudioService {
  private apiKey: string = '';
  /**
   * Initialize service with API key
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    console.log('✅ API key configured for YouTube service');
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Health check - just verify API key is set
   */
  async checkBackendHealth(): Promise<boolean> {
    const isReady = this.isConfigured();
    console.log(isReady ? '✅ YouTube API ready' : '⚠️ YouTube API key not configured');
    return isReady;
  }
  /**
   * Search YouTube directly using API
   */
  async searchYouTube(query: string, maxResults = 20): Promise<Song[]> {
    if (!this.isConfigured()) {
      console.log('❌ API key not configured for search');
      return [];
    }

    try {
      console.log(`🔍 Searching YouTube for: ${query}`);
      const results = await searchMusic(this.apiKey, query, maxResults);
      console.log(`✅ Found ${results.length} videos for: ${query}`);
      return results;
    } catch (error) {
      console.error('❌ YouTube search failed:', (error as any)?.message);
      return [];
    }
  }

  /**
   * Get trending music directly from YouTube API
   */
  async getTrendingMusic(maxResults = 20, regionCode = 'US'): Promise<Song[]> {
    if (!this.isConfigured()) {
      console.log('❌ API key not configured for trending');
      return [];
    }

    try {
      console.log(`🔥 Getting trending music videos`);
      const results = await getTrendingMusic(this.apiKey, maxResults);
      console.log(`✅ Found ${results.length} trending videos`);
      return results;
    } catch (error) {
      console.error('❌ Failed to get trending music:', (error as any)?.message);
      return [];
    }
  }

  /**
   * Get recommendations for a song
   */
  async getRecommendations(songTitle: string, maxResults = 10): Promise<Song[]> {
    if (!this.isConfigured()) {
      console.log('❌ API key not configured for recommendations');
      return [];
    }

    try {
      console.log(`📚 Getting recommendations based on: ${songTitle}`);
      const results = await getMusicRecommendations(this.apiKey, songTitle, maxResults);
      console.log(`✅ Found ${results.length} recommendations`);
      return results;
    } catch (error) {
      console.error('❌ Failed to get recommendations:', (error as any)?.message);
      return [];
    }
  }

  /**
   * Get audio URL with fallback
   * Note: Direct YouTube audio extraction is not possible client-side due to CORS restrictions.
   * Using fallback audio URLs for playback.
   */
  async getAudioUrlWithFallback(song: Song): Promise<{
    type: 'fallback' | 'youtube',
    url: string,
    info?: YouTubeAudioInfo
  }> {
    console.log(`🎵 Getting audio for: ${song.title} (${song.id})`);
    
    // Return fallback audio
    // Note: For real YouTube audio extraction, you would need a backend server with yt-dlp
    // Alternatives: YouTube Premium Music API, or embed YouTube player
    return { 
      type: 'fallback', 
      url: this.getFallbackAudio(song),
      info: {
        success: true,
        audioUrl: this.getFallbackAudio(song),
        quality: 'fallback',
        container: 'mp3',
        codecs: 'mp3',
        duration: this.parseDuration(song.duration),
        title: song.title,
        author: song.artist,
        videoId: song.id,
        extractedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Get YouTube video URL for embedded player
   */
  getYouTubeVideoUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  /**
   * Get YouTube embed URL
   */
  getEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  /**
   * Get video details (using search)
   */
  async getVideoDetails(videoId: string): Promise<Song | null> {
    // Video details would come from search results
    // This is a placeholder since we get this from search results
    console.log(`📋 Getting video details for: ${videoId}`);
    return null;
  }

  /**
   * Check if backend is available (always false for client-side)
   */
  async isBackendAvailable(): Promise<boolean> {
    return false; // No backend needed for client-side-only mode
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
   * Get backend status
   */
  getBackendStatus(): { healthy: boolean; lastCheck: Date } {
    return {
      healthy: false,
      lastCheck: new Date()
    };
  }

  /**
   * Parse duration from string format (e.g., "4:13")
   */
  private parseDuration(duration: string): number {
    if (!duration) return 0;
    
    const parts = duration.split(':').map(Number);
    let seconds = 0;
    
    if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    } else {
      seconds = parts[0];
    }
    
    return seconds;
  }

  /**
   * Utility: Format duration for display
   */
  formatDuration(duration: string | number): string {
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

  /**
   * Utility: Format view count
   */
  formatViewCount(count: string | number): string {
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