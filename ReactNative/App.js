/**
 * Pyramid Festival App
 * Main entry point with navigation and providers
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme';
import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from './src/services/notifications';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Navigation theme (extend DefaultTheme to include required fonts)
const navigationTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.teal,
    background: colors.background.screen,
    card: colors.background.card,
    text: colors.text.primary,
    border: colors.neutral.grayLight,
    notification: colors.coral,
  },
};

export default function App() {
  // Setup notification listeners
  useEffect(() => {
    // Handle notification received while app is foregrounded
    const receivedSubscription = addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Handle notification tap
    const responseSubscription = addNotificationResponseListener(response => {
      console.log('Notification tapped:', response);
      // Could navigate to event detail here based on response.notification.request.content.data
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer theme={navigationTheme}>
          <StatusBar style="light" />
          <AppNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
