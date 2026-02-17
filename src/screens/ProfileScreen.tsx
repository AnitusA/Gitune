import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { GradientContainer } from '../components/GradientContainer';
import { COLORS } from '../constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { getUserSettings, upsertUserSettings } from '../api/supabase';
import { LinearGradient } from 'expo-linear-gradient';

export const ProfileScreen = () => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [settings, setSettings] = useState({
        github_token: '',
        github_username: '',
        duolingo_username: '',
        youtube_api_key: '',
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await getUserSettings(user.id);
        if (data) {
            setSettings({
                github_token: data.github_token || '',
                github_username: data.github_username || '',
                duolingo_username: data.duolingo_username || '',
                youtube_api_key: data.youtube_api_key || '',
            });
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        
        try {
            const { error } = await upsertUserSettings(user.id, settings);
            
            if (error) {
                Alert.alert('Error', `Failed to save settings: ${error.message || 'Unknown error'}`);
                console.error('Save settings error:', error);
            } else {
                Alert.alert('Success', 'Profile settings updated successfully!');
            }
        } catch (catchError: any) {
            Alert.alert('Error', `Unexpected error: ${catchError.message || catchError}`);
            console.error('Unexpected save error:', catchError);
        }
        
        setSaving(false);
    };

    const handleLogout = async () => {
        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to logout?')) {
                await logout();
            }
        } else {
            Alert.alert('Logout', 'Are you sure you want to logout?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', onPress: () => logout(), style: 'destructive' },
            ]);
        }
    };

    if (loading) {
        return (
            <GradientContainer style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            </GradientContainer>
        );
    }

    return (
        <GradientContainer>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    {/* Header Section */}
                    <View style={styles.header}>
                        <View style={styles.avatarContainer}>
                            <LinearGradient
                                colors={[COLORS.PRIMARY, '#60A5FA']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.avatarGradient}
                            >
                                <Ionicons name="person" size={48} color="white" />
                            </LinearGradient>
                            <View style={styles.onlineBadge} />
                        </View>
                        <Text style={styles.email}>{user?.email}</Text>
                        <View style={styles.roleContainer}>
                            <Text style={styles.roleText}>Pro Member</Text>
                        </View>
                    </View>

                    {/* Social Integrations Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Connections</Text>
                        <Text style={styles.sectionSubtitle}>Link your accounts to track progress</Text>

                        <View style={styles.card}>
                            <View style={styles.inputRow}>
                                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                                    <Ionicons name="logo-github" size={22} color="white" />
                                </View>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.inputLabel}>GitHub Username</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={settings.github_username}
                                        onChangeText={(text) => setSettings({ ...settings, github_username: text })}
                                        placeholder="octocat"
                                        placeholderTextColor={COLORS.TEXT_SECONDARY}
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.inputRow}>
                                <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                                    <Ionicons name="school" size={22} color={COLORS.SECONDARY} />
                                </View>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.inputLabel}>Duolingo Username</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={settings.duolingo_username}
                                        onChangeText={(text) => setSettings({ ...settings, duolingo_username: text })}
                                        placeholder="duo_user"
                                        placeholderTextColor={COLORS.TEXT_SECONDARY}
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* API Configuration Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>API Configuration</Text>
                        <Text style={styles.sectionSubtitle}>Securely stored keys for integrations</Text>

                        <View style={styles.card}>
                            <View style={styles.inputRow}>
                                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                                    <Ionicons name="key-outline" size={20} color={COLORS.TEXT_SECONDARY} />
                                </View>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.inputLabel}>GitHub Token</Text>
                                    <View style={styles.secureInputContainer}>
                                        <TextInput
                                            style={styles.input}
                                            value={settings.github_token}
                                            onChangeText={(text) => setSettings({ ...settings, github_token: text })}
                                            placeholder="ghp_................"
                                            placeholderTextColor={COLORS.TEXT_SECONDARY}
                                            secureTextEntry={!showToken}
                                            autoCapitalize="none"
                                        />
                                        <TouchableOpacity onPress={() => setShowToken(!showToken)} style={styles.eyeBtn}>
                                            <Ionicons name={showToken ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.TEXT_SECONDARY} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.inputRow}>
                                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,0,0,0.1)' }]}>
                                    <Ionicons name="logo-youtube" size={20} color="#FF0000" />
                                </View>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.inputLabel}>YouTube Data API Key</Text>
                                    <View style={styles.secureInputContainer}>
                                        <TextInput
                                            style={styles.input}
                                            value={settings.youtube_api_key}
                                            onChangeText={(text) => setSettings({ ...settings, youtube_api_key: text })}
                                            placeholder="AIza................"
                                            placeholderTextColor={COLORS.TEXT_SECONDARY}
                                            secureTextEntry={!showApiKey}
                                            autoCapitalize="none"
                                        />
                                        <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)} style={styles.eyeBtn}>
                                            <Ionicons name={showApiKey ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.TEXT_SECONDARY} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={saving}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[COLORS.PRIMARY, '#2563EB']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.saveBtn, saving && styles.disabledBtn]}
                            >
                                {saving ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle" size={24} color="white" />
                                        <Text style={styles.saveBtnText}>Save Changes</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={20} color={COLORS.ERROR} />
                            <Text style={styles.logoutText}>Log Out</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footerSpacer} />

                </ScrollView>
            </KeyboardAvoidingView>
        </GradientContainer>
    );
};

const styles = StyleSheet.create({
    centerContainer: { justifyContent: 'center', alignItems: 'center', flex: 1 },
    scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
    header: { alignItems: 'center', marginBottom: 40 },
    avatarContainer: {
        marginBottom: 16,
        position: 'relative',
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    avatarGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: COLORS.BACKGROUND,
    },
    onlineBadge: {
        width: 18,
        height: 18,
        backgroundColor: COLORS.SUCCESS,
        borderRadius: 9,
        position: 'absolute',
        bottom: 5,
        right: 5,
        borderWidth: 3,
        borderColor: COLORS.BACKGROUND,
    },
    email: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.TEXT_PRIMARY,
        marginBottom: 8,
    },
    roleContainer: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    roleText: {
        color: COLORS.PRIMARY,
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    section: { marginBottom: 32 },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.TEXT_PRIMARY,
        marginBottom: 4,
        marginLeft: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: COLORS.TEXT_SECONDARY,
        marginBottom: 16,
        marginLeft: 4,
    },
    card: {
        backgroundColor: COLORS.CARD_BG,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        height: 72,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    inputWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    inputLabel: {
        fontSize: 11,
        color: COLORS.TEXT_SECONDARY,
        marginBottom: 2,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        color: COLORS.TEXT_PRIMARY,
        fontSize: 16,
        padding: 0,
        height: 24,
        fontWeight: '500',
    },
    secureInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    eyeBtn: {
        padding: 4,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginLeft: 72,
    },
    actionsContainer: {
        gap: 16,
        marginTop: 8,
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    disabledBtn: { opacity: 0.7 },
    saveBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    logoutText: {
        color: COLORS.ERROR,
        fontWeight: '600',
        fontSize: 15
    },
    footerSpacer: { height: 100 },
});
