/**
 * HappeningNow - Banner showing currently live events
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { formatEndsIn } from '../utils/dateHelpers';

export default function HappeningNow({
  events = [],
  onEventPress,
  currentTime,
}) {
  if (events.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.liveDot} />
        <Text style={styles.headerText}>HAPPENING NOW</Text>
      </View>

      {/* Events */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {events.map(event => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => onEventPress(event)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.categoryBar,
                { backgroundColor: event.categoryColor || colors.teal },
              ]}
            />
            <View style={styles.eventContent}>
              <Text style={styles.categoryName} numberOfLines={1}>
                {event.categoryName}
              </Text>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {event.title}
              </Text>
              <Text style={styles.endsIn}>
                {formatEndsIn(event, currentTime)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.navyDark,
    paddingVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.coral,
    marginRight: spacing.sm,
  },
  headerText: {
    ...typography.textStyles.label,
    color: colors.coral,
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.cardDark,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
    width: 280,
    overflow: 'hidden',
    ...shadows.md,
  },
  categoryBar: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: spacing.md,
  },
  categoryName: {
    ...typography.textStyles.caption,
    color: colors.tealLight,
    marginBottom: spacing.xs,
  },
  eventTitle: {
    ...typography.textStyles.h5,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  endsIn: {
    ...typography.textStyles.caption,
    color: colors.neutral.gray,
  },
});
