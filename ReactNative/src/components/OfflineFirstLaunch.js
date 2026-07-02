/**
 * OfflineFirstLaunch - Empty state for first launch without internet (no cached data)
 * Shows a friendly message with a retry button, on the Pyramid theme.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { fonts, radius } from '../theme/tokens';
import { PyramidMark } from './geometry/Geometry';

export default function OfflineFirstLaunch({ onRetry }) {
  const { t } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <PyramidMark size={56} stroke={1.3} color={t.accent} />
      <Text style={[styles.title, { color: t.ink }]}>No Internet Connection</Text>
      <Text style={[styles.message, { color: t.ink2 }]}>
        Connect to the internet to download the festival schedule.
        {'\n\n'}
        Once downloaded, you can view it offline throughout the gathering.
      </Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: t.accent }, t.glow]}
        onPress={onRetry}
        activeOpacity={0.85}
      >
        <Text style={[styles.retryButtonText, { color: t.onAccent }]}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: radius.pill,
  },
  retryButtonText: {
    fontFamily: fonts.bodyExtra,
    fontSize: 15,
  },
});
