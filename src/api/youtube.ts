// YouTube Music API Service
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail: string;
  channelTitle: string;
  viewCount?: string;
}

export interface Playlist {
  id: string;
  title: string;
  thumbnail: string;
  songCount: number;
}

// Search for music videos
export const searchMusic = async (apiKey: string, query: string, maxResults = 20): Promise<Song[]> => {
  try {
    const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&type=video&videoCategoryId=10&q=${encodeURIComponent(query + ' music')}&maxResults=${maxResults}&key=${apiKey}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Search failed');
    }

    // Get video details for duration and view count
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    const detailsUrl = `${YOUTUBE_API_BASE}/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    return data.items.map((item: any, index: number) => {
      const details = detailsData.items[index];
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        duration: formatDuration(details?.contentDetails?.duration || 'PT0S'),
        thumbnail: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle,
        viewCount: formatViewCount(details?.statistics?.viewCount || '0')
      };
    });
  } catch (error) {
    console.error('Music search error:', error);
    throw error;
  }
};

// Get music recommendations based on a song
export const getMusicRecommendations = async (apiKey: string, basedOnSong: string, maxResults = 15): Promise<Song[]> => {
  try {
    // Search for similar music using related keywords
    const genres = ['pop music', 'rock music', 'hip hop music', 'electronic music', 'indie music'];
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    
    const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&type=video&videoCategoryId=10&q=${encodeURIComponent(basedOnSong + ' ' + randomGenre)}&maxResults=${maxResults}&key=${apiKey}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Recommendations failed');
    }

    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    const detailsUrl = `${YOUTUBE_API_BASE}/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    return data.items.map((item: any, index: number) => {
      const details = detailsData.items[index];
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        duration: formatDuration(details?.contentDetails?.duration || 'PT0S'),
        thumbnail: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle,
        viewCount: formatViewCount(details?.statistics?.viewCount || '0')
      };
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    throw error;
  }
};

// Get trending music
export const getTrendingMusic = async (apiKey: string, maxResults = 20): Promise<Song[]> => {
  try {
    const searchUrl = `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&videoCategoryId=10&maxResults=${maxResults}&key=${apiKey}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get trending music');
    }

    return data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      duration: formatDuration(item.contentDetails.duration),
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      viewCount: formatViewCount(item.statistics.viewCount)
    }));
  } catch (error) {
    console.error('Trending music error:', error);
    throw error;
  }
};

// Get music by genre
export const getMusicByGenre = async (apiKey: string, genre: string, maxResults = 15): Promise<Song[]> => {
  const genreQueries: { [key: string]: string } = {
    'pop': 'popular music hits songs',
    'rock': 'rock music songs',
    'hip-hop': 'hip hop rap music',
    'electronic': 'electronic dance music EDM',
    'indie': 'indie alternative music',
    'jazz': 'jazz music songs',
    'classical': 'classical music',
    'country': 'country music songs',
    'reggae': 'reggae music songs',
    'blues': 'blues music songs'
  };

  const query = genreQueries[genre.toLowerCase()] || `${genre} music`;
  
  try {
    const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&type=video&videoCategoryId=10&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${apiKey}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Genre search failed');
    }

    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    const detailsUrl = `${YOUTUBE_API_BASE}/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    return data.items.map((item: any, index: number) => {
      const details = detailsData.items[index];
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        duration: formatDuration(details?.contentDetails?.duration || 'PT0S'),
        thumbnail: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle,
        viewCount: formatViewCount(details?.statistics?.viewCount || '0')
      };
    });
  } catch (error) {
    console.error('Genre music error:', error);
    throw error;
  }
};

// Utility functions
const formatDuration = (duration: string): string => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = (match?.[1] || '').replace('H', '');
  const minutes = (match?.[2] || '').replace('M', '');
  const seconds = (match?.[3] || '').replace('S', '');
  
  if (hours) {
    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }
  return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
};

const formatViewCount = (count: string): string => {
  const num = parseInt(count);
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};