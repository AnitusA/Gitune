import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, ScrollView, Dimensions, Modal } from 'react-native';
import { GradientContainer } from '../components/GradientContainer';
import { COLORS } from '../constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { getSavedVideos, saveYouTubeVideo, getUserSettings } from '../api/supabase';
import { searchMusic, getMusicByGenre, getTrendingMusic, getMusicRecommendations, Song } from '../api/youtube';
import { LinearGradient } from 'expo-linear-gradient';
import { audioService } from '../api/audioService';
import { youtubeAudioService } from '../api/youtubeAudioService';
import { AVPlaybackStatus } from 'expo-av';
import { HiddenYouTubePlayer, YouTubePlayerRef } from '../components/HiddenYouTubePlayer';

const { width, height } = Dimensions.get('window');

export const VideoScreen = () => {
    const { user } = useAuth();
    const youtubePlayerRef = useRef<YouTubePlayerRef>(null);
    const [savedSongs, setSavedSongs] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Song[]>([]);
    const [trendingMusic, setTrendingMusic] = useState<Song[]>([]);
    const [recommendedMusic, setRecommendedMusic] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [playing, setPlaying] = useState(false);
    const [playerLoading, setPlayerLoading] = useState(false);
    const [apiKey, setApiKey] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'search' | 'trending' | 'recommended' | 'saved'>('trending');
    const [playerVisible, setPlayerVisible] = useState(false);
    const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
    const [youtubePlayerReady, setYoutubePlayerReady] = useState(false);

    const loadUserSettings = async () => {
        // Initialize YouTube service with API key (client-side only)
        if (user) {
            console.log('🔑 Loading user YouTube API key...');
            const { data } = await getUserSettings(user.id);
            if (data?.youtube_api_key) {
                youtubeAudioService.setApiKey(data.youtube_api_key);
                setApiKey(data.youtube_api_key);
                setBackendAvailable(true);
                loadTrendingMusic(data.youtube_api_key);
            } else {
                Alert.alert(
                    "YouTube API Key Required",
                    "Please add your YouTube API key in the Profile section to access music features.",
                    [{ text: "OK" }]
                );
                setBackendAvailable(false);
            }
        } else {
            // No user, cannot load music
            console.log('⚠️ No user logged in');
            setBackendAvailable(false);
        }
    };

    const loadSavedSongs = async () => {
        if (!user) return;
        const { data } = await getSavedVideos(user.id);
        if (data) setSavedSongs(data);
    };

    const loadTrendingMusic = async (key?: string) => {
        try {
            setLoading(true);
            
            // Use provided key or the one from state
            const apiKeyToUse = key || apiKey;
            if (!apiKeyToUse) {
                console.log('⚠️ No API key available for trending music');
                return;
            }

            console.log('🔥 Loading trending music...');
            // Initialize service with key if not already set
            if (!youtubeAudioService.isConfigured()) {
                youtubeAudioService.setApiKey(apiKeyToUse);
            }

            const trending = await youtubeAudioService.getTrendingMusic(20);
            
            if (trending.length > 0) {
                console.log('✅ Trending music loaded');
                setTrendingMusic(trending);
                // Get recommendations based on first trending song
                const recommended = await youtubeAudioService.getRecommendations(trending[0].title, 10);
                setRecommendedMusic(recommended);
                setBackendAvailable(true);
            } else {
                console.log('⚠️ No trending music found');
                setBackendAvailable(false);
            }
        } catch (error) {
            console.log("Error loading trending:", error);
            setBackendAvailable(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        if (!youtubeAudioService.isConfigured()) {
            Alert.alert("Not Configured", "YouTube API key not configured. Please add it in your Profile.");
            return;
        }

        try {
            setLoading(true);
            console.log(`🔍 Searching for: ${searchQuery}`);
            
            const results = await youtubeAudioService.searchYouTube(searchQuery, 20);
            
            if (results.length > 0) {
                console.log('✅ Search results found');
                setSearchResults(results);
                setActiveTab('search');
            } else {
                Alert.alert("No Results", "No music found for your search.");
            }
        } catch (error) {
            console.error("Search error:", error);
            Alert.alert("Search Error", "Failed to search for music. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const loadGenreMusic = async (genre: string) => {
        if (!apiKey) return;

        try {
            setLoading(true);
            const results = await getMusicByGenre(apiKey, genre);
            setSearchResults(results);
            setActiveTab('search');
        } catch (error) {
            Alert.alert("Error", `Failed to load ${genre} music.`);
        } finally {
            setLoading(false);
        }
    };

    const playSong = async (song: Song) => {
        try {
            setCurrentSong(song);
            setPlayerLoading(true);
            setPlayerVisible(true);

            console.log('🎵 Playing song:', song.title, 'ID:', song.id);

            // Wait a brief moment if player just became ready
            if (!youtubePlayerReady) {
                console.log('⏳ Waiting for YouTube player...');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            if (youtubePlayerRef.current) {
                // Use real YouTube player
                console.log('✅ Using YouTube player for:', song.id);
                youtubePlayerRef.current.loadVideo(song.id);
                youtubePlayerRef.current.play();
                setPlaying(true);
            } else {
                console.log('⚠️ YouTube player ref not available');
            }

            setPlayerLoading(false);

            // Load recommendations using YouTube API
            if (youtubeAudioService.isConfigured()) {
                const recommendations = await youtubeAudioService.getRecommendations(song.title, 10);
                setRecommendedMusic(recommendations);
            }
        } catch (error) {
            console.error('❌ Error playing song:', error);
            setPlayerLoading(false);
            setPlaying(false);
            Alert.alert('Playback Error', 'Unable to play this song. Please try another.');
        }
    };

    const togglePlayPause = async () => {
        try {
            if (playerLoading || !youtubePlayerRef.current) return;

            if (playing) {
                youtubePlayerRef.current.pause();
                setPlaying(false);
            } else {
                youtubePlayerRef.current.play();
                setPlaying(true);
            }
        } catch (error) {
            console.error('Error toggling playback:', error);
        }
    };

    const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setPlaying(status.isPlaying);
            setPlayerLoading(false);

            // Handle song end
            if (status.didJustFinish) {
                handleSongEnd();
            }
        }
    };

    const handleYouTubeReady = () => {
        console.log('✅ YouTube player ready');
        setYoutubePlayerReady(true);
        setPlayerLoading(false);
    };

    // Auto-set player as ready after 3 seconds if callback doesn't fire
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!youtubePlayerReady) {
                console.log('⏰ Auto-enabling YouTube player after timeout');
                setYoutubePlayerReady(true);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [youtubePlayerReady]);

    const handleYouTubeStateChange = (state: string) => {
        console.log('🎵 YouTube state:', state);

        if (state === 'playing') {
            setPlaying(true);
            setPlayerLoading(false);
        } else if (state === 'paused') {
            setPlaying(false);
        } else if (state === 'ended') {
            handleSongEnd();
        } else if (state === 'buffering') {
            setPlayerLoading(true);
        }
    };

    const handleYouTubeError = (error: string) => {
        console.error('❌ YouTube player error:', error);
        Alert.alert('Playback Error', 'Unable to play this video. It may be restricted or unavailable.');
        setPlayerLoading(false);
        setPlaying(false);
    };



    const handleSongEnd = () => {
        console.log('🎵 Song ended, playing next...');
        setPlaying(false);
        if (recommendedMusic.length > 0) {
            const nextSong = recommendedMusic[Math.floor(Math.random() * recommendedMusic.length)];
            console.log('▶️ Auto-playing:', nextSong.title);
            playSong(nextSong);
        } else {
            console.log('ℹ️ No recommendations available for auto-play');
        }
    };

    const closeMusicPlayer = async () => {
        setPlayerVisible(false);
        // Keep playing in background - user can pause if they want to stop
    };

    const skipToNext = () => {
        if (recommendedMusic.length > 0) {
            const currentIndex = recommendedMusic.findIndex(song => song.id === currentSong?.id);
            const nextIndex = (currentIndex + 1) % recommendedMusic.length;
            const nextSong = recommendedMusic[nextIndex];
            console.log('⏭️ Skipping to next:', nextSong.title);
            playSong(nextSong);
        }
    };

    const skipToPrevious = () => {
        if (recommendedMusic.length > 0) {
            const currentIndex = recommendedMusic.findIndex(song => song.id === currentSong?.id);
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : recommendedMusic.length - 1;
            const prevSong = recommendedMusic[prevIndex];
            console.log('⏮️ Skipping to previous:', prevSong.title);
            playSong(prevSong);
        }
    };

    const saveSong = async (song: Song) => {
        if (!user) return;
        const { error } = await saveYouTubeVideo(user.id, {
            video_id: song.id,
            title: `${song.title} - ${song.artist}`
        });
        if (error) {
            Alert.alert("Error", error.message);
        } else {
            Alert.alert("Success", "Song saved to your library!");
            loadSavedSongs();
        }
    };

    useEffect(() => {
        loadUserSettings();
        loadSavedSongs();
        checkBackendStatus();
    }, [user]);

    // Check YouTube service configuration
    const checkBackendStatus = async () => {
        const configured = youtubeAudioService.isConfigured();
        setBackendAvailable(configured);
    };

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (youtubePlayerRef.current) {
                youtubePlayerRef.current.stop();
            }
            audioService.unload();
        };
    }, []);



    const renderSongItem = ({ item }: { item: Song }) => (
        <TouchableOpacity
            style={styles.songItem}
            onPress={() => playSong(item)}
            activeOpacity={0.7}
        >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={styles.songInfo}>
                <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.artistName} numberOfLines={1}>{item.artist}</Text>
            </View>
            <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => saveSong(item)}
            >
                <Ionicons name="heart-outline" size={20} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderSavedItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.songItem}
            onPress={() => playSong({
                id: item.video_id,
                title: item.title,
                artist: 'Unknown Artist',
                duration: '0:00',
                thumbnail: `https://img.youtube.com/vi/${item.video_id}/mqdefault.jpg`,
                channelTitle: 'Unknown'
            })}
        >
            <Image
                source={{ uri: `https://img.youtube.com/vi/${item.video_id}/mqdefault.jpg` }}
                style={styles.thumbnail}
            />
            <View style={styles.songInfo}>
                <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.artistName}>Saved Song</Text>
            </View>
            <Ionicons name="play-circle" size={28} color={COLORS.PRIMARY} />
        </TouchableOpacity>
    );

    const genres = [
        { name: 'Pop', icon: '🎵', color: '#ec4899' },
        { name: 'Rock', icon: '🎸', color: '#ef4444' },
        { name: 'Hip-Hop', icon: '🎤', color: '#f59e0b' },
        { name: 'Electronic', icon: '🔊', color: '#3b82f6' },
        { name: 'Jazz', icon: '🎷', color: '#8b5cf6' },
        { name: 'Classical', icon: '🎼', color: '#10b981' }
    ];

    return (
        <GradientContainer>
            <View style={styles.container}>
                {/* Header with Status */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Music</Text>
                    <View style={styles.statusContainer}>
                        {backendAvailable === null ? (
                            <View style={styles.statusItem}>
                                <ActivityIndicator size={12} color="orange" />
                                <Text style={styles.statusText}>Loading...</Text>
                            </View>
                        ) : backendAvailable ? (
                            <TouchableOpacity style={styles.statusItem} onPress={checkBackendStatus}>
                                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                <Text style={[styles.statusText, { color: '#10B981' }]}>Client-Side Ready</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.statusItem} onPress={checkBackendStatus}>
                                <Ionicons name="alert-circle" size={16} color="orange" />
                                <Text style={[styles.statusText, { color: 'orange' }]}>Configure API Key</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={COLORS.TEXT_SECONDARY} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search songs, artists..."
                        placeholderTextColor={COLORS.TEXT_SECONDARY}
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                    />
                </View>

                {/* Genres */}
                <View style={{ marginBottom: 24 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreList}>
                        {genres.map((genre) => (
                            <TouchableOpacity
                                key={genre.name}
                                style={[styles.genrePill, { borderColor: genre.color + '40', backgroundColor: genre.color + '10' }]}
                                onPress={() => loadGenreMusic(genre.name)}
                            >
                                <Text style={styles.genreIcon}>{genre.icon}</Text>
                                <Text style={[styles.genreText, { color: genre.color }]}>{genre.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    {['search', 'trending', 'recommended', 'saved'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab as any)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Content */}
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                    </View>
                ) : (
                    <FlatList
                        data={
                            activeTab === 'trending' ? trendingMusic :
                                activeTab === 'search' ? searchResults :
                                    activeTab === 'recommended' ? recommendedMusic :
                                        activeTab === 'saved' ? savedSongs : []
                        }
                        keyExtractor={(item: any) => item.id || item.video_id}
                        renderItem={activeTab === 'saved' ? renderSavedItem : renderSongItem}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={<Text style={styles.emptyText}>No music found</Text>}
                    />
                )}

                {/* Mini Player / Full Player Modal */}
                {currentSong && (
                    <Modal visible={playerVisible} animationType="slide" presentationStyle="pageSheet">
                        <LinearGradient
                            colors={[COLORS.BACKGROUND, '#1e293b']}
                            style={styles.playerModal}
                        >
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setPlayerVisible(false)}>
                                    <Ionicons name="chevron-down" size={32} color="white" />
                                </TouchableOpacity>
                                <Text style={styles.nowPlayingText}>Now Playing</Text>
                                <TouchableOpacity onPress={() => saveSong(currentSong)}>
                                    <Ionicons name="heart-outline" size={28} color="white" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.playerContent}>
                                <Image source={{ uri: currentSong.thumbnail }} style={styles.albumArt} />

                                <View style={styles.trackInfo}>
                                    <Text style={styles.modalTitle} numberOfLines={2}>{currentSong.title}</Text>
                                    <Text style={styles.modalArtist}>{currentSong.artist}</Text>
                                </View>

                                {/* Real Background Audio Player */}
                                <View style={styles.playerFeatures}>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="phone-portrait" size={16} color="rgba(255,255,255,0.6)" />
                                        <Text style={styles.featureText}>Background Play</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.6)" />
                                        <Text style={styles.featureText}>Lock Screen Controls</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="notifications" size={16} color="rgba(255,255,255,0.6)" />
                                        <Text style={styles.featureText}>Media Controls</Text>
                                    </View>
                                </View>

                                {/* Audio Progress Bar */}
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressBar}>
                                        <View style={[styles.progressFill, { width: '30%' }]} />
                                    </View>
                                    <View style={styles.timeContainer}>
                                        <Text style={styles.timeText}>1:23</Text>
                                        <Text style={styles.timeText}>3:45</Text>
                                    </View>
                                </View>

                                <View style={styles.controls}>
                                    <TouchableOpacity onPress={skipToPrevious}>
                                        <Ionicons name="play-skip-back" size={32} color="white" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={togglePlayPause}
                                        style={styles.playPauseBtn}
                                    >
                                        {playerLoading ? (
                                            <ActivityIndicator size={40} color="black" />
                                        ) : (
                                            <Ionicons
                                                name={playing ? "pause" : "play"}
                                                size={40}
                                                color="black"
                                                style={{ marginLeft: playing ? 0 : 4 }}
                                            />
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={skipToNext}>
                                        <Ionicons name="play-skip-forward" size={32} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </LinearGradient>
                    </Modal>
                )}

                {/* Mini Player Bar (if modal closed but song active) */}
                {currentSong && !playerVisible && (
                    <TouchableOpacity style={styles.miniPlayer} onPress={() => setPlayerVisible(true)}>
                        <Image source={{ uri: currentSong.thumbnail }} style={styles.miniThumb} />
                        <View style={styles.miniInfo}>
                            <Text style={styles.miniTitle} numberOfLines={1}>{currentSong.title}</Text>
                            <Text style={styles.miniArtist} numberOfLines={1}>{currentSong.artist}</Text>
                        </View>
                        <TouchableOpacity onPress={togglePlayPause} style={styles.miniPlayBtn}>
                            <Ionicons name={playing ? "pause" : "play"} size={24} color="white" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}

                {/* Hidden YouTube Player */}
                <HiddenYouTubePlayer
                    ref={youtubePlayerRef}
                    onReady={handleYouTubeReady}
                    onStateChange={handleYouTubeStateChange}
                    onError={handleYouTubeError}
                />
            </View>
        </GradientContainer>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, paddingTop: 60 },
    headerTitle: { fontSize: 32, fontWeight: '800', color: COLORS.TEXT_PRIMARY, marginBottom: 24 },
    
    // Header with Backend Status
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
        color: 'rgba(255,255,255,0.8)',
    },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.CARD_BG,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    searchIcon: { marginRight: 12 },
    searchInput: { flex: 1, color: COLORS.TEXT_PRIMARY, fontSize: 16 },

    genreList: { paddingRight: 24 },
    genrePill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
    },
    genreIcon: { marginRight: 8, fontSize: 16 },
    genreText: { fontWeight: '600', fontSize: 14 },

    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)'
    },
    tab: { marginRight: 24, paddingBottom: 12 },
    activeTab: { borderBottomWidth: 2, borderBottomColor: COLORS.PRIMARY },
    tabText: { color: COLORS.TEXT_SECONDARY, fontSize: 16, fontWeight: '600' },
    activeTabText: { color: COLORS.TEXT_PRIMARY },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { paddingBottom: 100 },
    emptyText: { color: COLORS.TEXT_SECONDARY, textAlign: 'center', marginTop: 40 },

    songItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    thumbnail: { width: 56, height: 56, borderRadius: 12 },
    songInfo: { flex: 1, marginHorizontal: 16 },
    songTitle: { color: COLORS.TEXT_PRIMARY, fontSize: 16, fontWeight: '600', marginBottom: 4 },
    artistName: { color: COLORS.TEXT_SECONDARY, fontSize: 14 },
    actionBtn: { padding: 8 },

    // Player Modal
    playerModal: { flex: 1, paddingTop: 60, paddingHorizontal: 24 },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
    },
    nowPlayingText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    playerContent: { alignItems: 'center', flex: 1 },
    albumArt: {
        width: width - 48,
        height: width - 48,
        borderRadius: 24,
        marginBottom: 40,
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 30,
    },
    trackInfo: { alignItems: 'center', marginBottom: 40, paddingHorizontal: 20 },
    modalTitle: { color: 'white', fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
    modalArtist: { color: 'rgba(255,255,255,0.6)', fontSize: 18, fontWeight: '500' },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        width: '100%',
    },
    playPauseBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'white',
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    
    // Player Features
    playerFeatures: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    featureText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        fontWeight: '500',
    },
    
    // Progress Bar
    progressContainer: {
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 2,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timeText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: '500',
    },

    // Mini Player
    miniPlayer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        borderRadius: 16,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    miniThumb: { width: 40, height: 40, borderRadius: 8 },
    miniInfo: { flex: 1, marginHorizontal: 12 },
    miniTitle: { color: 'white', fontSize: 14, fontWeight: '600' },
    miniArtist: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
    miniPlayBtn: { padding: 8 },
});
