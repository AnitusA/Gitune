import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

// YouTube API type declarations
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export interface YouTubePlayerRef {
  loadVideo: (videoId: string) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seekTo: (seconds: number) => void;
}

interface Props {
  onReady?: () => void;
  onStateChange?: (state: string) => void;
  onError?: (error: string) => void;
}

export const HiddenYouTubePlayer = forwardRef<YouTubePlayerRef, Props>(
  ({ onReady, onStateChange, onError }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const playerRef = useRef<any>(null);
    const iframeRef = useRef<HTMLDivElement>(null);
    const playerReadyRef = useRef(false);

    // Web-specific YouTube API setup
    useEffect(() => {
      if (Platform.OS === 'web') {
        console.log('🌐 Setting up YouTube player for web...');

        const initializePlayer = () => {
          console.log('🎬 Initializing YouTube player...');

          // Wait for element to be in DOM
          setTimeout(() => {
            const element = document.getElementById('youtube-player');
            if (!element) {
              console.error('❌ YouTube player element not found');
              return;
            }

            try {
              console.log('📺 Creating YouTube Player instance...');
              // @ts-ignore - YouTube Player constructor
              const player = new window.YT.Player('youtube-player', {
                height: '100%',
                width: '100%',
                playerVars: {
                  autoplay: 0,
                  controls: 0,
                  modestbranding: 1,
                  playsinline: 1,
                  rel: 0,
                  fs: 0,
                  iv_load_policy: 3,
                },
                events: {
                  onReady: (event: any) => {
                    console.log('✅ YouTube player ready (web)');
                    console.log('🔍 Event.target type:', typeof event.target);
                    console.log('🔍 Event.target keys:', event.target ? Object.keys(event.target).slice(0, 10) : 'none');
                    console.log('🔍 Has playVideo?', typeof event.target?.playVideo);

                    playerReadyRef.current = true;

                    // The event.target IS the player with all methods
                    if (event.target) {
                      playerRef.current = event.target;
                      console.log('✅ Player ref set from event.target');

                      // Test if methods work
                      setTimeout(() => {
                        const testPlayer = playerRef.current;
                        console.log('🧪 Testing player methods...');
                        console.log('  - playVideo:', typeof testPlayer?.playVideo);
                        console.log('  - pauseVideo:', typeof testPlayer?.pauseVideo);
                        console.log('  - loadVideoById:', typeof testPlayer?.loadVideoById);
                        console.log('  - getPlayerState:', typeof testPlayer?.getPlayerState);

                        if (typeof testPlayer?.playVideo === 'function') {
                          console.log('✅ All player methods available!');
                        } else {
                          console.error('❌ Methods not accessible, player object:', testPlayer);
                        }
                      }, 100);

                      onReady?.();
                    } else {
                      console.error('❌ event.target is null/undefined');
                    }
                  },
                  onStateChange: (event: any) => {
                    const states: any = {
                      '-1': 'unstarted',
                      '0': 'ended',
                      '1': 'playing',
                      '2': 'paused',
                      '3': 'buffering',
                      '5': 'cued',
                    };
                    const state = states[event.data] || 'unknown';
                    console.log('🎵 YouTube state (web):', state);

                    // Ensure playerRef is set
                    if (!playerRef.current && event.target) {
                      playerRef.current = event.target;
                    }

                    onStateChange?.(state);
                  },
                  onError: (event: any) => {
                    console.error('❌ YouTube error (web):', event.data);
                    onError?.(`Error code: ${event.data}`);
                  },
                },
              });

              // Don't immediately assign - wait for onReady to provide the correct reference
              console.log('📺 YouTube Player constructor called, waiting for onReady...');
            } catch (e) {
              console.error('❌ Error creating YouTube player:', e);
            }
          }, 100);
        };

        // Check if API is already loaded
        // @ts-ignore
        if (window.YT && window.YT.Player) {
          console.log('✅ YouTube API already loaded');
          initializePlayer();
          return;
        }

        // Load YouTube iframe API
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.onerror = () => {
          console.error('❌ Failed to load YouTube API');
        };
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

        // @ts-ignore - YouTube API global callback
        window.onYouTubeIframeAPIReady = initializePlayer;
      }

      return () => {
        if (Platform.OS === 'web' && playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch (e) {
            console.log('Error destroying player:', e);
          }
        }
      };
    }, [onReady, onStateChange, onError]);

    useImperativeHandle(ref, () => ({
      loadVideo: (videoId: string) => {
        console.log('📼 Loading video:', videoId);

        if (Platform.OS === 'web') {
          if (!playerRef.current || !playerReadyRef.current) {
            console.warn('⚠️ YouTube player not ready yet (web)');
            return;
          }
          try {
            playerRef.current.loadVideoById(videoId);
          } catch (e) {
            console.error('Error loading video (web):', e);
          }
        } else {
          webViewRef.current?.injectJavaScript(`
            if (player) {
              player.loadVideoById('${videoId}');
            }
            true;
          `);
        }
      },
      play: () => {
        console.log('▶️ Play');

        if (Platform.OS === 'web') {
          if (!playerRef.current) {
            console.warn('⚠️ YouTube player not initialized (web)');
            return;
          }
          if (!playerReadyRef.current) {
            console.warn('⚠️ YouTube player not ready yet (web)');
            return;
          }

          const player = playerRef.current;

          try {
            // Try direct method first
            if (typeof player.playVideo === 'function') {
              player.playVideo();
            }
            // Try iframe method
            else if (player.getIframe && typeof player.getIframe === 'function') {
              const iframe = player.getIframe();
              if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
              }
            }
            // Last resort: trigger via player internal API
            else {
              console.error('❌ No playVideo method found. Player:', player);
              console.log('Trying alternative: dispatching play command...');
              // Force play via internal player if methods aren't exposed
              const videoElement = document.querySelector('iframe#youtube-player');
              if (videoElement) {
                console.log('Found iframe, attempting postMessage play');
                // @ts-ignore
                videoElement.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
              }
            }
          } catch (e) {
            console.error('Error playing (web):', e);
          }
        } else {
          webViewRef.current?.injectJavaScript(`
            if (player) {
              player.playVideo();
            }
            true;
          `);
        }
      },
      pause: () => {
        console.log('⏸️ Pause');

        if (Platform.OS === 'web') {
          if (!playerRef.current || !playerReadyRef.current) {
            console.warn('⚠️ YouTube player not ready yet (web)');
            return;
          }
          try {
            playerRef.current.pauseVideo();
          } catch (e) {
            console.error('Error pausing (web):', e);
          }
        } else {
          webViewRef.current?.injectJavaScript(`
            if (player) {
              player.pauseVideo();
            }
            true;
          `);
        }
      },
      stop: () => {
        console.log('⏹️ Stop');

        if (Platform.OS === 'web') {
          if (!playerRef.current || !playerReadyRef.current) {
            console.warn('⚠️ YouTube player not ready yet (web)');
            return;
          }
          try {
            playerRef.current.stopVideo();
          } catch (e) {
            console.error('Error stopping (web):', e);
          }
        } else {
          webViewRef.current?.injectJavaScript(`
            if (player) {
              player.stopVideo();
            }
            true;
          `);
        }
      },
      seekTo: (seconds: number) => {
        if (Platform.OS === 'web') {
          if (!playerRef.current || !playerReadyRef.current) {
            console.warn('⚠️ YouTube player not ready yet (web)');
            return;
          }
          try {
            playerRef.current.seekTo(seconds, true);
          } catch (e) {
            console.error('Error seeking (web):', e);
          }
        } else {
          webViewRef.current?.injectJavaScript(`
            if (player) {
              player.seekTo(${seconds}, true);
            }
            true;
          `);
        }
      },
    }));

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { margin: 0; padding: 0; background: black; }
            #player { width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <div id="player"></div>

          <script>
            console.log('🎬 YouTube Player HTML loaded');

            // Send immediate load confirmation
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'log',
                message: 'HTML loaded, loading YouTube API...'
              }));
            }

            var player;
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            tag.onerror = function() {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'log',
                  message: 'Failed to load YouTube iframe API'
                }));
              }
            };
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            function onYouTubeIframeAPIReady() {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'log',
                  message: 'YouTube API ready, creating player...'
                }));
              }

              player = new YT.Player('player', {
                height: '100%',
                width: '100%',
                playerVars: {
                  'autoplay': 0,
                  'controls': 0,
                  'modestbranding': 1,
                  'playsinline': 1,
                  'rel': 0,
                  'fs': 0,
                  'iv_load_policy': 3
                },
                events: {
                  'onReady': onPlayerReady,
                  'onStateChange': onPlayerStateChange,
                  'onError': onPlayerError
                }
              });
            }

            function onPlayerReady(event) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'ready'
                }));
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'log',
                  message: 'Player ready!'
                }));
              }
            }

            function onPlayerStateChange(event) {
              var states = {
                '-1': 'unstarted',
                '0': 'ended',
                '1': 'playing',
                '2': 'paused',
                '3': 'buffering',
                '5': 'cued'
              };

              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'stateChange',
                  state: states[event.data] || 'unknown'
                }));
              }
            }

            function onPlayerError(event) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'error',
                  error: 'Error code: ' + event.data
                }));
              }
            }
          </script>
        </body>
      </html>
    `;

    const handleMessage = (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        console.log('📨 WebView message:', data);

        if (data.type === 'log') {
          console.log('🎬 YouTube Player:', data.message);
        } else if (data.type === 'ready' && onReady) {
          console.log('✅ YouTube player ready callback');
          onReady();
        } else if (data.type === 'stateChange' && onStateChange) {
          console.log('🎵 State change:', data.state);
          onStateChange(data.state);
        } else if (data.type === 'error' && onError) {
          console.log('❌ YouTube error:', data.error);
          onError(data.error);
        }
      } catch (error) {
        console.error('Error parsing WebView message:', error);
      }
    };

    return (
      <View style={styles.container}>
        {Platform.OS === 'web' ? (
          // @ts-ignore - Using dangerouslySetInnerHTML for web
          <div
            id="youtube-player"
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        ) : (
          <WebView
            ref={webViewRef}
            source={{ html: htmlContent }}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            mixedContentMode="always"
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('❌ WebView error:', nativeEvent);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('❌ WebView HTTP error:', nativeEvent.statusCode);
            }}
            onLoad={() => {
              console.log('🎬 WebView loaded');
            }}
            style={styles.webview}
          />
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 50,  // Bigger for YouTube player to work
    height: 50,
    opacity: 0.01, // Nearly invisible but still functional
    overflow: 'hidden',
    bottom: 0,
    left: 0,
    zIndex: -1, // Behind everything
  },
  webview: {
    backgroundColor: 'transparent',
  },
});
