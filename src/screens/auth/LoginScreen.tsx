import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const LoginScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const { login, register } = useAuth();

    const handleSubmit = async () => {
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const { error } = isLogin
                ? await login(email, password)
                : await register(email, password);

            if (error) {
                alert(error.message);
            }
        } catch (e: any) {
            alert(e.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[COLORS.BACKGROUND, '#1e293b', '#0f172a']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <LinearGradient
                            colors={[COLORS.PRIMARY, '#60A5FA']}
                            style={styles.logoContainer}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="rocket" size={48} color="white" />
                        </LinearGradient>
                        <Text style={styles.title}>Dream Flow</Text>
                        <Text style={styles.subtitle}>Build habits. Track progress. Level up.</Text>
                    </View>

                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>

                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email address"
                                placeholderTextColor={COLORS.TEXT_SECONDARY}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor={COLORS.TEXT_SECONDARY}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSubmit}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[COLORS.PRIMARY, '#2563EB']}
                                style={styles.buttonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.buttonText}>
                                        {isLogin ? 'Sign In' : 'Get Started'}
                                    </Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setIsLogin(!isLogin)}
                            style={styles.switchContainer}
                        >
                            <Text style={styles.switchText}>
                                {isLogin ? "New here? " : "Already have an account? "}
                            </Text>
                            <Text style={styles.switchLink}>
                                {isLogin ? 'Create Account' : 'Sign In'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },
    content: { flex: 1, justifyContent: 'center', padding: 24 },
    header: { alignItems: 'center', marginBottom: 40 },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 30, // Squircle
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        transform: [{ rotate: '-5deg' }]
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: COLORS.TEXT_PRIMARY,
        letterSpacing: -1
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.TEXT_SECONDARY,
        marginTop: 8,
        fontWeight: '500'
    },
    formCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.TEXT_PRIMARY,
        marginBottom: 24,
        textAlign: 'center'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        height: 56,
        paddingHorizontal: 16,
    },
    icon: { marginRight: 12 },
    input: {
        flex: 1,
        color: COLORS.TEXT_PRIMARY,
        fontSize: 16,
        height: '100%',
    },
    button: {
        marginTop: 8,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    switchText: {
        color: COLORS.TEXT_SECONDARY,
        fontSize: 14,
    },
    switchLink: {
        color: COLORS.PRIMARY,
        fontWeight: '700',
        fontSize: 14,
    },
});
