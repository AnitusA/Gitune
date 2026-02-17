import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart, ContributionGraph, BarChart } from 'react-native-chart-kit';
import { GradientContainer } from '../components/GradientContainer';
import { COLORS } from '../constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
    backgroundGradientFrom: '#1E293B',
    backgroundGradientTo: '#1E293B',
    bgOpacity: 0.5,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    style: {
        borderRadius: 16,
    },
    propsForDots: {
        r: "4",
        strokeWidth: "2",
        stroke: "#3B82F6",
    },
    propsForBackgroundLines: {
        strokeDasharray: '', // Solid background lines
        stroke: "rgba(255,255,255,0.05)",
    },
};

const contributionData = [
    { date: "2023-01-02", count: 1 },
    { date: "2023-01-03", count: 2 },
    { date: "2023-01-04", count: 3 },
    { date: "2023-01-05", count: 4 },
    { date: "2023-01-06", count: 5 },
    { date: "2023-01-30", count: 2 },
    { date: "2023-01-31", count: 3 },
    { date: "2023-03-01", count: 2 },
    { date: "2023-04-02", count: 4 },
    { date: "2023-03-05", count: 2 },
    { date: "2023-02-30", count: 4 }
];

export const AnalyticsScreen = () => {
    return (
        <GradientContainer>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Analytics</Text>
                    <Text style={styles.subtitle}>Track your comprehensive progress</Text>
                </View>

                {/* Productivity Chart */}
                <View style={styles.cardContainer}>
                    <LinearGradient
                        colors={[COLORS.CARD_BG, 'rgba(30, 41, 59, 0.8)']}
                        style={styles.card}
                    >
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                                <Ionicons name="flash" size={20} color={COLORS.PRIMARY} />
                            </View>
                            <Text style={styles.cardTitle}>Productivity</Text>
                        </View>

                        <LineChart
                            data={{
                                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                                datasets: [{ data: [2, 4, 3, 7, 5, 8, 6] }]
                            }}
                            width={screenWidth - 48}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                            withInnerLines={false}
                            withOuterLines={false}
                        />
                    </LinearGradient>
                </View>

                {/* Contribution Graph */}
                <View style={styles.cardContainer}>
                    <LinearGradient
                        colors={[COLORS.CARD_BG, 'rgba(30, 41, 59, 0.8)']}
                        style={styles.card}
                    >
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                                <Ionicons name="git-commit" size={20} color={COLORS.SUCCESS} />
                            </View>
                            <Text style={styles.cardTitle}>Contributions</Text>
                        </View>

                        <ContributionGraph
                            values={contributionData}
                            endDate={new Date("2023-04-01")}
                            numDays={105}
                            width={screenWidth - 48}
                            height={220}
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                            }}
                            style={styles.chart}
                            tooltipDataAttrs={() => ({})}
                        />
                    </LinearGradient>
                </View>

                {/* Focus Heatmap / Bar Chart */}
                <View style={styles.cardContainer}>
                    <LinearGradient
                        colors={[COLORS.CARD_BG, 'rgba(30, 41, 59, 0.8)']}
                        style={styles.card}
                    >
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                                <Ionicons name="time" size={20} color={COLORS.ACCENT} />
                            </View>
                            <Text style={styles.cardTitle}>Focus Hours</Text>
                        </View>

                        <BarChart
                            data={{
                                labels: ["Wk 1", "Wk 2", "Wk 3", "Wk 4"],
                                datasets: [{ data: [20, 45, 28, 80] }]
                            }}
                            width={screenWidth - 48}
                            height={220}
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
                            }}
                            style={styles.chart}
                            yAxisLabel=""
                            yAxisSuffix="h"
                            fromZero
                        />
                    </LinearGradient>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </GradientContainer>
    );
};

const styles = StyleSheet.create({
    scroll: { padding: 24, paddingTop: 60 },
    header: { marginBottom: 32 },
    title: {
        fontSize: 34,
        fontWeight: '800',
        color: COLORS.TEXT_PRIMARY,
        marginBottom: 8,
        letterSpacing: -1
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.TEXT_SECONDARY
    },
    cardContainer: {
        marginBottom: 24,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
    },
    card: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.TEXT_PRIMARY
    },
    chart: {
        borderRadius: 16,
        paddingRight: 0,
        paddingLeft: 0,
    }
});
