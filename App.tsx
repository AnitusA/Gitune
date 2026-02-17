import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootNavigator } from './src/navigation/RootNavigator';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, scheduleDailyReminder } from './src/utils/reminders';
import { COLORS } from './src/constants';
import { Buffer } from 'buffer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Polyfill Buffer globally for GitHub API base64
global.Buffer = Buffer;

const Stack = createNativeStackNavigator();

function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.BACKGROUND, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={RootNavigator} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const notificationListener = useRef<Notifications.Subscription>(undefined);
  const responseListener = useRef<Notifications.Subscription>(undefined);

  useEffect(() => {
    // Register for push notifications with improved error handling
    registerForPushNotificationsAsync()
      .then(token => {
        if (token) {
          console.log("✅ Push notifications setup complete");
        }
      })
      .catch(error => {
        console.log("ℹ️  Push notifications unavailable:", error.message || error);
      });

    scheduleDailyReminder();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification received:", notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current && notificationListener.current.remove();
      responseListener.current && responseListener.current.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}>
          <StatusBar style="light" />
          <NavigationContainer theme={{
            ...DarkTheme,
            colors: {
              ...DarkTheme.colors,
              background: COLORS.BACKGROUND,
              card: COLORS.CARD_BG,
              text: COLORS.TEXT_PRIMARY,
              border: 'rgba(255,255,255,0.05)',
              primary: COLORS.PRIMARY,
              notification: COLORS.ACCENT
            },
          }}>
            <Navigation />
          </NavigationContainer>
        </View>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
