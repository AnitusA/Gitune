// Audio Service for background music playback
import { Audio, AVPlaybackStatus } from 'expo-av';

export class AudioService {
  private sound: Audio.Sound | null = null;
  private isSetup = false;

  async setupAudio() {
    if (this.isSetup) return;
    
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.isSetup = true;
    } catch (error) {
      console.error('Failed to setup audio:', error);
    }
  }

  async loadAndPlayAudio(youtubeId: string, songInfo?: {title: string, artist: string}, onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void) {
    try {
      await this.setupAudio();
      
      // Stop and unload previous sound
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // Enhanced audio sources with better quality and variety
      // Using creative commons and royalty-free music that loads faster
      const audioSources = [
        {
          title: "Energetic Electronic",
          url: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
          genre: "electronic"
        },
        {
          title: "Chill Vibes", 
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          genre: "ambient"
        },
        {
          title: "Upbeat Pop",
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", 
          genre: "pop"
        },
        {
          title: "Rock Energy",
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
          genre: "rock"
        },
        {
          title: "Smooth Jazz",
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
          genre: "jazz"
        },
        {
          title: "Hip Hop Beat",
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
          genre: "hip-hop"
        },
        {
          title: "Classical Flow",
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
          genre: "classical"
        },
        {
          title: "Indie Alternative",
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
          genre: "indie"
        }
      ];

      // Smart audio selection based on song info
      let selectedAudio;
      if (songInfo) {
        const searchTerms = `${songInfo.title} ${songInfo.artist}`.toLowerCase();
        
        // Try to match genre based on song/artist keywords
        if (searchTerms.includes('electronic') || searchTerms.includes('edm') || searchTerms.includes('techno')) {
          selectedAudio = audioSources.find(a => a.genre === 'electronic');
        } else if (searchTerms.includes('jazz') || searchTerms.includes('smooth')) {
          selectedAudio = audioSources.find(a => a.genre === 'jazz');
        } else if (searchTerms.includes('rock') || searchTerms.includes('metal')) {
          selectedAudio = audioSources.find(a => a.genre === 'rock');
        } else if (searchTerms.includes('hip hop') || searchTerms.includes('rap')) {
          selectedAudio = audioSources.find(a => a.genre === 'hip-hop');
        } else if (searchTerms.includes('classical') || searchTerms.includes('orchestra')) {
          selectedAudio = audioSources.find(a => a.genre === 'classical');
        } else if (searchTerms.includes('indie') || searchTerms.includes('alternative')) {
          selectedAudio = audioSources.find(a => a.genre === 'indie');
        } else if (searchTerms.includes('pop') || searchTerms.includes('hit')) {
          selectedAudio = audioSources.find(a => a.genre === 'pop');
        }
      }
      
      // Fallback to random if no match found
      if (!selectedAudio) {
        selectedAudio = audioSources[Math.floor(Math.random() * audioSources.length)];
      }
      
      console.log(`Playing: ${selectedAudio.title} (${selectedAudio.genre}) for "${songInfo?.title || 'Unknown'}"`);
      
      // Create new sound object with optimized settings for fast loading
      const { sound } = await Audio.Sound.createAsync(
        { uri: selectedAudio.url },
        { 
          shouldPlay: true, 
          isLooping: false,
          volume: 1.0,
          progressUpdateIntervalMillis: 500, // More frequent updates
          positionMillis: 0,
          rate: 1.0,
          shouldCorrectPitch: true,
        },
        onPlaybackStatusUpdate
      );
      
      this.sound = sound;
      return sound;
    } catch (error) {
      console.error('Failed to load audio:', error);
      throw new Error('Unable to load audio. Check your internet connection.');
    }
  }

  async playPause() {
    if (!this.sound) return false;
    
    try {
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await this.sound.pauseAsync();
          return false;
        } else {
          await this.sound.playAsync();
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to play/pause:', error);
    }
    return false;
  }

  async stop() {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
      } catch (error) {
        console.error('Failed to stop sound:', error);
      }
    }
  }

  async unload() {
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
        this.sound = null;
      } catch (error) {
        console.error('Failed to unload sound:', error);
      }
    }
  }

  async setPosition(positionMillis: number) {
    if (this.sound) {
      try {
        await this.sound.setPositionAsync(positionMillis);
      } catch (error) {
        console.error('Failed to set position:', error);
      }
    }
  }

  async getStatus(): Promise<AVPlaybackStatus | null> {
    if (this.sound) {
      try {
        return await this.sound.getStatusAsync();
      } catch (error) {
        console.error('Failed to get status:', error);
      }
    }
    return null;
  }

  /**
   * Play audio directly from URL (for real YouTube audio via backend stream proxy)
   */
  async playFromUrl(audioUrl: string, songInfo?: {title: string, artist: string}, onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void) {
    try {
      await this.setupAudio();
      
      // Stop and unload previous sound
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      console.log('🎵 Loading audio from URL:', audioUrl.substring(0, 80) + '...');

      // Create new sound from URL with streaming-friendly settings
      const { sound } = await Audio.Sound.createAsync(
        { 
          uri: audioUrl,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36',
          },
        },
        { 
          shouldPlay: true, 
          isLooping: false, 
          volume: 1.0,
          progressUpdateIntervalMillis: 500,
          androidImplementation: 'MediaPlayer',
        },
        onPlaybackStatusUpdate
      );

      this.sound = sound;
      console.log('✅ Audio started playing from URL!');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to play from URL:', error);
      
      // Fallback to loadAndPlayAudio if URL fails
      if (songInfo) {
        console.log('🔄 Falling back to sample audio');
        return await this.loadAndPlayAudio('fallback', songInfo, onPlaybackStatusUpdate);
      }
      
      throw error;
    }
  }
}

export const audioService = new AudioService();