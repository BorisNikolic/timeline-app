/**
 * HomeScreen - Festival landing page with countdown, live events, and quick links
 */

import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';

import HappeningNow from '../components/HappeningNow';
import { useTimelineEvents, useCategories, useHappeningNow } from '../hooks/useEvents';
import { useCurrentTime } from '../hooks/useCurrentTime';
import {
  formatTime,
  formatDateShort,
  parseDate,
  getMinutesUntilEvent,
  formatTimeUntil,
  isSameDay,
  getUniqueDates,
} from '../utils/dateHelpers';
import { TIMELINE_ID } from '../utils/constants';

/**
 * Calculate countdown to festival start
 */
function useFestivalCountdown(events) {
  const currentTime = useCurrentTime();

  return useMemo(() => {
    if (!events || events.length === 0) {
      return { status: 'loading', display: '' };
    }

    const dates = getUniqueDates(events);
    if (dates.length === 0) {
      return { status: 'no-dates', display: 'Dates coming soon' };
    }

    const firstDay = dates[0];
    const lastDay = dates[dates.length - 1];
    // Set lastDay to end of day
    const festivalEnd = new Date(lastDay);
    festivalEnd.setHours(23, 59, 59, 999);

    const now = currentTime;

    if (now > festivalEnd) {
      return { status: 'past', display: 'See you next year!' };
    }

    const todayIsFestivalDay = dates.some(d => isSameDay(d, now));
    if (todayIsFestivalDay) {
      return { status: 'live', display: 'Festival is live!' };
    }

    if (now < firstDay) {
      const diff = firstDay.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (days > 0) {
        return {
          status: 'upcoming',
          display: `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`,
          days,
          hours,
        };
      }
      return {
        status: 'upcoming',
        display: `${hours} hour${hours !== 1 ? 's' : ''} to go`,
        days: 0,
        hours,
      };
    }

    // Between festival days but not a festival day itself
    return { status: 'live', display: 'Festival is live!' };
  }, [events, currentTime]);
}

function CountdownBanner({ countdown }) {
  if (countdown.status === 'loading') return null;

  const isLive = countdown.status === 'live';
  const isPast = countdown.status === 'past';

  return (
    <View style={[styles.countdownBanner, isLive && styles.countdownBannerLive]}>
      {isLive && <View style={styles.liveDot} />}
      <Ionicons
        name={isLive ? 'radio' : isPast ? 'heart' : 'time-outline'}
        size={20}
        color={isLive ? colors.accent.coral : colors.text.inverse}
        style={styles.countdownIcon}
      />
      <View>
        {!isPast && !isLive && (
          <Text style={styles.countdownLabel}>STARTS IN</Text>
        )}
        <Text style={[styles.countdownText, isLive && styles.countdownTextLive]}>
          {countdown.display}
        </Text>
      </View>
    </View>
  );
}

function UpNextCard({ event, onPress }) {
  const currentTime = useCurrentTime();
  const minutesUntil = getMinutesUntilEvent(event, currentTime);
  const timeUntil = formatTimeUntil(minutesUntil);

  return (
    <TouchableOpacity
      style={styles.upNextCard}
      onPress={() => onPress(event)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.upNextColorBar,
          { backgroundColor: event.categoryColor || colors.teal },
        ]}
      />
      <View style={styles.upNextContent}>
        <Text style={styles.upNextCategory} numberOfLines={1}>
          {event.categoryName}
        </Text>
        <Text style={styles.upNextTitle} numberOfLines={1}>
          {event.title}
        </Text>
        <View style={styles.upNextFooter}>
          <Text style={styles.upNextTime}>{formatTime(event.time)}</Text>
          {timeUntil ? (
            <Text style={styles.upNextCountdown}>{timeUntil}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function QuickLinkCard({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity
      style={styles.quickLinkCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickLinkIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.quickLinkLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const timelineId = TIMELINE_ID;
  const currentTime = useCurrentTime();

  const { data: events, isLoading, refetch } = useTimelineEvents(timelineId);
  const { data: categories } = useCategories(timelineId);

  const countdown = useFestivalCountdown(events);

  // Get happening now events enriched with category info
  const happeningNowEvents = useMemo(() => {
    if (!events || !categories) return [];
    const live = useHappeningNow(events, currentTime);
    return live.map(event => {
      const category = categories.find(c => c.id === event.categoryId);
      return {
        ...event,
        categoryName: category?.name || 'Event',
        categoryColor: category?.color || colors.teal,
      };
    });
  }, [events, categories, currentTime]);

  // Get upcoming events today (not currently happening, sorted by start time)
  const upNextEvents = useMemo(() => {
    if (!events || !categories) return [];
    const today = currentTime;

    return events
      .filter(event => {
        const eventDate = parseDate(event.date);
        if (!isSameDay(eventDate, today)) return false;
        if (!event.time) return false;
        const minutesUntil = getMinutesUntilEvent(event, today);
        // Show events starting in the next 4 hours that haven't started yet
        return minutesUntil !== null && minutesUntil > 0 && minutesUntil <= 240;
      })
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
      .slice(0, 5)
      .map(event => {
        const category = categories.find(c => c.id === event.categoryId);
        return {
          ...event,
          categoryName: category?.name || 'Event',
          categoryColor: category?.color || colors.teal,
        };
      });
  }, [events, categories, currentTime]);

  const handleEventPress = useCallback((event) => {
    navigation.navigate('EventDetail', { event });
  }, [navigation]);

  const navigateToTab = useCallback((tabName) => {
    navigation.getParent()?.navigate(tabName);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.festivalName}>PYRAMID</Text>
        <Text style={styles.festivalNameAccent}>FESTIVAL</Text>
        <Text style={styles.festivalYear}>2026</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.teal}
          />
        }
      >
        {/* Countdown Banner */}
        <CountdownBanner countdown={countdown} />

        {/* Happening Now */}
        {happeningNowEvents.length > 0 && (
          <HappeningNow
            events={happeningNowEvents}
            onEventPress={handleEventPress}
            currentTime={currentTime}
          />
        )}

        {/* Up Next */}
        {upNextEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="arrow-forward-circle" size={18} color={colors.teal} />
              <Text style={styles.sectionTitle}>UP NEXT</Text>
            </View>
            {upNextEvents.map(event => (
              <UpNextCard
                key={event.id}
                event={event}
                onPress={handleEventPress}
              />
            ))}
          </View>
        )}

        {/* Quick Links */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="grid" size={18} color={colors.teal} />
            <Text style={styles.sectionTitle}>QUICK LINKS</Text>
          </View>
          <View style={styles.quickLinksGrid}>
            <QuickLinkCard
              icon="calendar"
              label="Schedule"
              color={colors.primary.teal}
              onPress={() => navigateToTab('Schedule')}
            />
            <QuickLinkCard
              icon="heart"
              label="My Events"
              color={colors.accent.coral}
              onPress={() => navigateToTab('MyEvents')}
            />
            <QuickLinkCard
              icon="information-circle"
              label="Info"
              color={colors.accent.golden}
              onPress={() => navigateToTab('Info')}
            />
            <QuickLinkCard
              icon="map"
              label="Map"
              color={colors.primary.tealLight}
              onPress={() => navigateToTab('Map')}
            />
          </View>
        </View>

        {/* Festival stats */}
        {events && categories && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{events.length}</Text>
              <Text style={styles.statLabel}>Events</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{categories.length}</Text>
              <Text style={styles.statLabel}>Stages</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {getUniqueDates(events).length}
              </Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.screen,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.navyDark,
    alignItems: 'center',
  },
  festivalName: {
    ...typography.textStyles.hero,
    color: colors.text.inverse,
    letterSpacing: 6,
  },
  festivalNameAccent: {
    ...typography.textStyles.h2,
    color: colors.accent.golden,
    letterSpacing: 8,
    marginTop: -4,
  },
  festivalYear: {
    ...typography.textStyles.h4,
    color: colors.tealLight,
    letterSpacing: 4,
    marginTop: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  // Countdown
  countdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.navy,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  countdownBannerLive: {
    backgroundColor: colors.navyDark,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent.coral,
    marginRight: spacing.sm,
  },
  countdownIcon: {
    marginRight: spacing.sm,
  },
  countdownLabel: {
    ...typography.textStyles.caption,
    color: colors.tealLight,
    letterSpacing: 1,
  },
  countdownText: {
    ...typography.textStyles.h4,
    color: colors.text.inverse,
  },
  countdownTextLive: {
    color: colors.accent.coral,
  },
  // Sections
  section: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.textStyles.label,
    color: colors.text.tertiary,
    marginLeft: spacing.sm,
  },
  // Up Next
  upNextCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.sm,
  },
  upNextColorBar: {
    width: 4,
  },
  upNextContent: {
    flex: 1,
    padding: spacing.md,
  },
  upNextCategory: {
    ...typography.textStyles.caption,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  upNextTitle: {
    ...typography.textStyles.h5,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  upNextFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upNextTime: {
    ...typography.textStyles.bodySmall,
    color: colors.text.secondary,
  },
  upNextCountdown: {
    ...typography.textStyles.caption,
    color: colors.teal,
    fontWeight: '600',
  },
  // Quick Links
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickLinkCard: {
    width: '47%',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  quickLinkIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickLinkLabel: {
    ...typography.textStyles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    ...shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.textStyles.h2,
    color: colors.teal,
  },
  statLabel: {
    ...typography.textStyles.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral.grayLight,
  },
});
