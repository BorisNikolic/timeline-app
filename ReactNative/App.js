/**
 * Pyramid Festival App
 * Main entry point with navigation and providers
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { NetworkProvider } from './src/contexts/NetworkContext';
import { colors } from './src/theme';
import { typography } from './src/theme/typography';
import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from './src/services/notifications';

// Create AsyncStorage persister for offline cache
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'PYRAMID_FESTIVAL_CACHE',
  throttleTime: 1000,
});

// Create React Query client with offline-first config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity, // Never garbage collect - keep cached data forever
      staleTime: 5 * 60 * 1000, // 5 minutes - refetch in background when online
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      refetchOnWindowFocus: false,
      networkMode: 'offlineFirst', // Return cached data immediately
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

function HydrationSplash() {
  return (
    <View style={splashStyles.container}>
      <Text style={splashStyles.brand}>PYRAMID</Text>
      <Text style={splashStyles.brandAccent}>FESTIVAL</Text>
      <ActivityIndicator
        size="small"
        color={colors.tealLight}
        style={splashStyles.spinner}
      />
    </View>
  );
}

export default function App() {
  const [isHydrated, setIsHydrated] = useState(false);

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: asyncStoragePersister }}
          onSuccess={() => setIsHydrated(true)}
        >
          <NetworkProvider>
            <NavigationContainer theme={navigationTheme}>
              <StatusBar style="light" />
              {isHydrated ? <AppNavigator /> : <HydrationSplash />}
            </NavigationContainer>
          </NetworkProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navyDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brand: {
    ...typography.textStyles.hero,
    color: colors.text.inverse,
    letterSpacing: 6,
  },
  brandAccent: {
    ...typography.textStyles.h2,
    color: colors.accent.golden,
    letterSpacing: 8,
    marginTop: -4,
  },
  spinner: {
    marginTop: 40,
  },
});
