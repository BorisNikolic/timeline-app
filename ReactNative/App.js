/**
 * Pyramid Festival App
 * Main entry point with navigation, theme, fonts and data providers
 */

import React, { useEffect, useState, useMemo } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';

import AppNavigator from './src/navigation/AppNavigator';
import { NetworkProvider } from './src/contexts/NetworkContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { RemindersProvider } from './src/contexts/RemindersContext';
import { fonts } from './src/theme/tokens';
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

function HydrationSplash() {
  const { t } = useTheme();
  return (
    <View style={[splashStyles.container, { backgroundColor: t.bg }]}>
      <Text style={[splashStyles.brand, { color: t.ink }]}>PYRAMID</Text>
      <Text style={[splashStyles.brandAccent, { color: t.accent }]}>FESTIVAL</Text>
      <ActivityIndicator size="small" color={t.accent2} style={splashStyles.spinner} />
    </View>
  );
}

// Theme-aware navigation shell.
function Root({ ready }) {
  const { t, mode } = useTheme();

  const navigationTheme = useMemo(() => ({
    ...DefaultTheme,
    dark: mode === 'dark',
    colors: {
      ...DefaultTheme.colors,
      primary: t.accent,
      background: t.bg,
      card: t.surface,
      text: t.ink,
      border: t.hairline,
      notification: t.hot,
    },
  }), [t, mode]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={t.statusBar} />
      {ready ? <AppNavigator /> : <HydrationSplash />}
    </NavigationContainer>
  );
}

export default function App() {
  const [isHydrated, setIsHydrated] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  // Setup notification listeners
  useEffect(() => {
    const receivedSubscription = addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });
    const responseSubscription = addNotificationResponseListener(response => {
      console.log('Notification tapped:', response);
    });
    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: asyncStoragePersister }}
            onSuccess={() => setIsHydrated(true)}
          >
            <NetworkProvider>
              <RemindersProvider>
                <Root ready={isHydrated && fontsLoaded} />
              </RemindersProvider>
            </NetworkProvider>
          </PersistQueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 44,
    letterSpacing: 6,
  },
  brandAccent: {
    fontFamily: fonts.display,
    fontSize: 28,
    letterSpacing: 8,
    marginTop: -2,
  },
  spinner: {
    marginTop: 40,
  },
});
