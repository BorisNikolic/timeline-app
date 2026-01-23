/**
 * NetworkContext - Network state provider with React Query integration
 * Subscribes to NetInfo for connectivity changes and syncs with React Query's onlineManager
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

const NetworkContext = createContext({
  isConnected: true,
  isInternetReachable: true,
});

export function NetworkProvider({ children }) {
  const [networkState, setNetworkState] = useState({
    isConnected: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected && state.isInternetReachable !== false;

      // Update React Query's online manager
      onlineManager.setOnline(isOnline);

      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
      });
    });

    // Get initial state
    NetInfo.fetch().then((state) => {
      const isOnline = state.isConnected && state.isInternetReachable !== false;
      onlineManager.setOnline(isOnline);

      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <NetworkContext.Provider value={networkState}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
