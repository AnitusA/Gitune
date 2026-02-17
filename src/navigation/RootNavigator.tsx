import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/DashboardScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { VideoScreen } from '../screens/VideosScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

const Tab = createBottomTabNavigator();

export const RootNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#0F172A', // Match COLORS.BACKGROUND
                    borderTopColor: 'rgba(255,255,255,0.05)',
                    borderTopWidth: 1,
                    height: Platform.OS === 'ios' ? 90 : 70,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                    paddingTop: 10,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarActiveTintColor: COLORS.PRIMARY,
                tabBarInactiveTintColor: COLORS.TEXT_SECONDARY,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: any;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'Tasks') {
                        iconName = focused ? 'checkbox' : 'checkbox-outline';
                    } else if (route.name === 'Analytics') {
                        iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                    } else if (route.name === 'Learn' || route.name === 'Music') {
                        iconName = focused ? 'musical-notes' : 'musical-notes-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginTop: 4
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Tasks" component={TasksScreen} />
            <Tab.Screen name="Analytics" component={AnalyticsScreen} />
            <Tab.Screen
                name="Learn"
                component={VideoScreen}
                options={{ tabBarLabel: 'Music' }}
            />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};
