/**
 * MapScreen - Placeholder for upcoming festival map feature
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export default function MapScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.headerTitle}>Festival Map</Text>
      </View>
      <View style={styles.content}>
        <Ionicons name="map-outline" size={80} color={colors.neutral.grayLight} />
        <Text style={styles.title}>Coming Soon</Text>
        <Text style={styles.subtitle}>
          The interactive festival map will be{'\n'}available closer to the event
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.screen,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.navyDark,
  },
  headerTitle: {
    ...typography.textStyles.h2,
    color: colors.text.inverse,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...typography.textStyles.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
