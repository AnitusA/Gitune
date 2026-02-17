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

  async loadAndPlayAudio(youtubeId: string, onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void) {
    try {
      await this.setupAudio();
      
      // Stop and unload previous sound
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // For demo purposes, we'll use free Creative Commons music
      // In production, you would integrate with:
      // - YouTube Music API for official audio streams
      // - Spotify Web API
      // - Apple Music API
      // - Or a custom audio streaming service
      
      const demoAudioUrls = [
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
      ];
      
      // Use a random demo track
      const randomAudioUrl = demoAudioUrls[Math.floor(Math.random() * demoAudioUrls.length)];
      
      // Create new sound object with demo audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: randomAudioUrl },
        { 
          shouldPlay: true, 
          isLooping: false,
          volume: 1.0,
          progressUpdateIntervalMillis: 1000
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
}

export const audioService = new AudioService();