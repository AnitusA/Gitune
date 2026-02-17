
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const GradientContainer: React.FC<Props> = ({ children, style }) => {
    return (
        <LinearGradient
            colors={[COLORS.BACKGROUND, COLORS.CARD_BG]}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <SafeAreaView style={[styles.safeArea, style]}>
                {children}
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
});
