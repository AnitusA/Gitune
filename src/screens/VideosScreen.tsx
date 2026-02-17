import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, ScrollView, Dimensions, Modal } from 'react-native';
import { GradientContainer } from '../components/GradientContainer';
import { COLORS } from '../constants';
import YoutubePlayer from "react-native-youtube-iframe";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { getSavedVideos, saveYouTubeVideo, getUserSettings } from '../api/supabase';
import { searchMusic, getMusicByGenre, getTrendingMusic, getMusicRecommendations, Song } from '../api/youtube';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export const VideoScreen = () => {
    const { user } = useAuth();
    const [savedSongs, setSavedSongs] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Song[]>([]);
    const [trendingMusic, setTrendingMusic] = useState<Song[]>([]);
    const [recommendedMusic, setRecommendedMusic] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [playing, setPlaying] = useState(false);
    const [apiKey, setApiKey] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'search' | 'trending' | 'recommended' | 'saved'>('trending');
    const [playerVisible, setPlayerVisible] = useState(false);

    const loadUserSettings = async () => {
        if (!user) return;
        const { data } = await getUserSettings(user.id);
        if (data?.youtube_api_key) {
            setApiKey(data.youtube_api_key);
            loadTrendingMusic(data.youtube_api_key);
        } else {
            Alert.alert(
                "YouTube API Required",
                "Please add your YouTube API key in the Profile section to use music features.",
                [{ text: "OK" }]
            );
        }
    };

    const loadSavedSongs = async () => {
        if (!user) return;
        const { data } = await getSavedVideos(user.id);
        if (data) setSavedSongs(data);
    };

    const loadTrendingMusic = async (key: string) => {
        try {
            setLoading(true);
            const trending = await getTrendingMusic(key, 20);
            setTrendingMusic(trending);
            if (trending.length > 0) {
                const recommended = await getMusicRecommendations(key, trending[0].title);
                setRecommendedMusic(recommended);
            }
        } catch (error) {
            console.log("Error loading trending:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!apiKey || !searchQuery.trim()) return;

        try {
            setLoading(true);
            const results = await searchMusic(apiKey, searchQuery);
            setSearchResults(results);
            setActiveTab('search');
        } catch (error) {
            Alert.alert("Search Error", "Failed to search for music.");
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

    const playSong = (song: Song) => {
        setCurrentSong(song);
        setPlaying(true);
        setPlayerVisible(true);

        if (apiKey) {
            getMusicRecommendations(apiKey, song.title).then(setRecommendedMusic).catch(console.error);
        }
    };

    const togglePlayPause = () => {
        setPlaying(!playing);
    };

    const handleSongEnd = () => {
        setPlaying(false);
        if (recommendedMusic.length > 0) {
            const nextSong = recommendedMusic[Math.floor(Math.random() * recommendedMusic.length)];
            playSong(nextSong);
        }
    };

    const closeMusicPlayer = () => {
        setPlayerVisible(false);
        // We keep playing in background if valid, or stop? 
        // For now let's just minimize. If user wants to stop they pause first.
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
    }, [user]);

    const onStateChange = useCallback((state: string) => {
        if (state === "ended") handleSongEnd();
        if (state === "paused") setPlaying(false);
        if (state === "playing") setPlaying(true);
    }, [recommendedMusic]);

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
                <Text style={styles.headerTitle}>Music</Text>

                {/* Search Bar */}
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
                    {['trending', 'recommended', 'saved'].map((tab) => (
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

                                {/* YouTube Player hidden but active */}
                                <View style={{ height: 0, overflow: 'hidden' }}>
                                    <YoutubePlayer
                                        height={1}
                                        play={playing}
                                        videoId={currentSong.id}
                                        onChangeState={onStateChange}
                                    />
                                </View>

                                <View style={styles.controls}>
                                    <TouchableOpacity onPress={() => { }}>
                                        <Ionicons name="play-skip-back" size={32} color="white" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={togglePlayPause}
                                        style={styles.playPauseBtn}
                                    >
                                        <Ionicons
                                            name={playing ? "pause" : "play"}
                                            size={40}
                                            color="black"
                                            style={{ marginLeft: playing ? 0 : 4 }}
                                        />
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => { }}>
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
            </View>
        </GradientContainer>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, paddingTop: 60 },
    headerTitle: { fontSize: 32, fontWeight: '800', color: COLORS.TEXT_PRIMARY, marginBottom: 24 },

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
