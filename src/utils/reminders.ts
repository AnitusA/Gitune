
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    // Skip push notifications in Expo Go as they're not fully supported
    if (__DEV__ && !Device.isDevice) {
        console.log('Push notifications not supported in Expo Go simulator');
        return null;
    }

    let token;

    if (Platform.OS === 'android') {
        try {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'productivity-reminders',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        } catch (error) {
            console.log('Failed to create notification channel:', error);
        }
    }

    if (Device.isDevice) {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Push notification permissions not granted');
                return null;
            }
            
            // Try to get push token, but handle Expo Go limitations gracefully
            try {
                const tokenData = await Notifications.getExpoPushTokenAsync({
                    projectId: '7f8a9b1c-2d3e-4f5g-6h7i-8j9k0l1m2n3o', // fallback projectId
                });
                token = tokenData.data;
                console.log('✅ Push token obtained successfully');
            } catch (tokenError: any) {
                if (tokenError.message?.includes('projectId')) {
                    console.log('ℹ️  Push notifications limited in Expo Go - requires development build for full functionality');
                } else {
                    console.log('ℹ️  Push notification setup incomplete:', tokenError.message);
                }
                return null;
            }
        } catch (e: any) {
            console.log('ℹ️  Push notifications not available:', e.message || e);
            return null;
        }
    } else {
        console.log('ℹ️  Push notifications require physical device');
        return null;
    }

    return token;
}

export async function scheduleDailyReminder() {
    // Schedule for 11:50 PM
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Warning: Streak at Risk! 🔥",
            body: "You haven't committed today. Do it now!",
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour: 23,
            minute: 50,
            repeats: true,
            channelId: 'default',
        },
    });

    // Schedule for Duolingo
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Duolingo Streak Check 🦉",
            body: "Have you practiced today?",
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour: 20, // 8 PM
            minute: 0,
            repeats: true,
            channelId: 'default',
        },
    });
}
