import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions, Image } from 'react-native';
import { checkDuolingoStreak } from '../api/duolingo';
import { getGitHubStreak, commitToRepo } from '../api/github';
import { GradientContainer } from '../components/GradientContainer';
import { COLORS } from '../constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { getUserSettings } from '../api/supabase';

const { width } = Dimensions.get('window');

export const DashboardScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const [duoStreak, setDuoStreak] = useState(0);
    const [ghStreak, setGhStreak] = useState({ committedToday: false });
    const [loading, setLoading] = useState(false);
    const [committing, setCommitting] = useState(false);
    const [settings, setSettings] = useState<any>(null);

    const loadData = async () => {
        if (!user) return;

        setLoading(true);

        // Load user settings
        const { data: userSettings } = await getUserSettings(user.id);
        setSettings(userSettings);

        if (userSettings) {
            // Check Duolingo
            if (userSettings.duolingo_username) {
                const duo = await checkDuolingoStreak(userSettings.duolingo_username);
                if (duo.error) console.log("Duolingo error:", duo.error);
                setDuoStreak(duo.streak || 0);
            }

            // Check GitHub
            if (userSettings.github_username && userSettings.github_token) {
                const gh = await getGitHubStreak(userSettings.github_username, userSettings.github_token);
                if (gh.error) console.log("GitHub error:", gh.error);
                setGhStreak({ committedToday: gh.committedToday || false });
            }
        }

        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const handleCheatCommit = async () => {
        if (!settings?.github_token) {
            alert("Please add your GitHub token in the Profile page");
            return;
        }

        setCommitting(true);
        try {
            await commitToRepo(settings.github_token);
            alert("Commit pushed! Streak saved. 🔥");
            loadData();
        } catch (e: any) {
            const errorMessage = e.message || 'Unknown error occurred';
            alert(`Auto-commit failed:\n\n${errorMessage}`);
        }
        setCommitting(false);
    };

    const needsSetup = !settings?.github_username || !settings?.duolingo_username;

    return (
        <GradientContainer>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={COLORS.PRIMARY} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.name}>{user?.email?.split('@')[0] || 'Creator'}</Text>
                        <Text style={styles.date}>
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileBtn}>
                        <LinearGradient
                            colors={[COLORS.PRIMARY, '#60A5FA']}
                            style={styles.profileGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="person" size={20} color="white" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {needsSetup && (
                    <TouchableOpacity
                        style={styles.setupBanner}
                        onPress={() => navigation.navigate('Profile')}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.05)']}
                            style={styles.setupGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <View style={styles.setupIconContainer}>
                                <Ionicons name="alert" size={24} color={COLORS.ACCENT} />
                            </View>
                            <View style={styles.setupContent}>
                                <Text style={styles.setupTitle}>Setup Required</Text>
                                <Text style={styles.setupSubtitle}>Connect your accounts to start tracking</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.ACCENT} />
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {/* Grid for Streaks */}
                <Text style={styles.sectionTitle}>Daily Progress</Text>
                <View style={styles.grid}>
                    {/* Duolingo Card */}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.cardContainer}
                        onPress={() => { }}
                    >
                        <LinearGradient
                            colors={['#58cc02', '#22c55e']}
                            style={styles.card}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.iconBgWhite}>
                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 20 }}>🦉</Text>
                                    </View>
                                </View>
                                <View style={styles.badgeContainer}>
                                    <Text style={styles.badgeText}>Learning</Text>
                                </View>
                            </View>

                            <View style={styles.cardMain}>
                                <Text style={styles.streakValue}>{settings?.duolingo_username ? duoStreak : '-'}</Text>
                                <Text style={styles.streakLabel}>Day Streak 🔥</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* GitHub Card */}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.cardContainer}
                        onPress={() => { }}
                    >
                        <LinearGradient
                            colors={['#24292e', '#2ea043']}
                            style={styles.card}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.iconBgWhite}>
                                    <Ionicons name="logo-github" size={24} color="#24292e" />
                                </View>
                                <View style={[styles.badgeContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                    <Text style={styles.badgeText}>Coding</Text>
                                </View>
                            </View>

                            <View style={styles.cardMain}>
                                {settings?.github_username ? (
                                    <View style={styles.statusRow}>
                                        <Ionicons
                                            name={ghStreak.committedToday ? "checkmark-circle" : "time"}
                                            size={32}
                                            color="white"
                                        />
                                        <Text style={styles.statusText}>
                                            {ghStreak.committedToday ? "Complete" : "Pending"}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={styles.streakValue}>-</Text>
                                )}
                            </View>

                            {settings?.github_token && !ghStreak.committedToday && (
                                <TouchableOpacity
                                    style={styles.cheatButton}
                                    onPress={handleCheatCommit}
                                    disabled={committing}
                                >
                                    <LinearGradient
                                        colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
                                        style={styles.cheatGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        {committing ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <Text style={styles.cheatText}>Auto Commit 🚀</Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionList}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Tasks')}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={[COLORS.CARD_BG, COLORS.CARD_BG]}
                            style={styles.actionGradient}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                                <Ionicons name="checkbox" size={24} color={COLORS.PRIMARY} />
                            </View>
                            <View style={styles.actionContent}>
                                <Text style={styles.actionTitle}>Tasks</Text>
                                <Text style={styles.actionDesc}>Manage your daily to-dos</Text>
                            </View>
                            <Ionicons name="arrow-forward" size={20} color={COLORS.TEXT_SECONDARY} />
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Analytics')}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={[COLORS.CARD_BG, COLORS.CARD_BG]}
                            style={styles.actionGradient}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                                <Ionicons name="stats-chart" size={24} color={COLORS.ACCENT} />
                            </View>
                            <View style={styles.actionContent}>
                                <Text style={styles.actionTitle}>Analytics</Text>
                                <Text style={styles.actionDesc}>View your progress trends</Text>
                            </View>
                            <Ionicons name="arrow-forward" size={20} color={COLORS.TEXT_SECONDARY} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.footerSpacer} />
            </ScrollView>
        </GradientContainer>
    );
};

const styles = StyleSheet.create({
    scrollContent: { padding: 24, paddingTop: 60 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32
    },
    greeting: {
        fontSize: 16,
        color: COLORS.TEXT_SECONDARY,
        fontWeight: '500',
        marginBottom: 4
    },
    name: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.TEXT_PRIMARY,
        letterSpacing: -0.5
    },
    date: {
        fontSize: 14,
        color: COLORS.TEXT_SECONDARY,
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '600',
        opacity: 0.7
    },
    profileBtn: {
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    profileGradient: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.BACKGROUND,
    },
    setupBanner: {
        marginBottom: 32,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    setupGradient: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    setupIconContainer: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    setupContent: { flex: 1 },
    setupTitle: {
        color: COLORS.ACCENT,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2
    },
    setupSubtitle: {
        color: COLORS.TEXT_SECONDARY,
        fontSize: 13
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.TEXT_PRIMARY,
        marginBottom: 16,
        marginLeft: 4,
        letterSpacing: 0.5
    },
    grid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 36
    },
    cardContainer: {
        flex: 1,
        height: 220,
        borderRadius: 24,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    card: {
        flex: 1,
        borderRadius: 24,
        padding: 18,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconBgWhite: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    badgeContainer: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    cardMain: {
        flex: 1,
        justifyContent: 'center',
    },
    streakValue: {
        fontSize: 42,
        fontWeight: '800',
        color: 'white',
        letterSpacing: -1,
    },
    streakLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
        marginTop: 4,
    },
    statusRow: {
        alignItems: 'flex-start',
    },
    statusText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        marginTop: 6,
    },
    cheatButton: {
        marginTop: 10,
        borderRadius: 14,
        overflow: 'hidden',
    },
    cheatGradient: {
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cheatText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 13,
    },
    actionList: {
        gap: 12,
    },
    actionCard: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        backgroundColor: COLORS.CARD_BG,
    },
    actionGradient: {
        padding: 16,
        paddingVertical: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionIcon: {
        width: 50,
        height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.TEXT_PRIMARY,
        marginBottom: 4,
    },
    actionDesc: {
        fontSize: 13,
        color: COLORS.TEXT_SECONDARY,
        fontWeight: '500',
    },
    footerSpacer: { height: 100 },
});
