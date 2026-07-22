/**
 * EventDetailScreen — full event details with reminder picker (Pyramid theme redesign).
 * headerShown:false — renders its own back header. All reminder logic preserved.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Web has no local notifications, so there the reminder button is a pure
// save-to-plan toggle (like the Lineup star) — no time picker, no notification
// promise. Native (iOS/Android) keeps the full reminder + notification flow.
const IS_WEB = Platform.OS === 'web';
const WEB_SAVE_MINUTES = 60; // cosmetic on web (no notification is scheduled)

import { useTheme } from '../contexts/ThemeContext';
import { fonts, radius } from '../theme/tokens';
import { Rings369, SeedOfLife } from '../components/geometry/Geometry';
import { IconChevronLeft, IconCal, IconClock, IconBell, IconStar } from '../components/ui/Icons';

import ReminderPicker from '../components/ReminderPicker';
import { useReminders } from '../hooks/useReminders';
import { formatTime, formatDateLong, parseDate, getMinutesUntilEvent } from '../utils/dateHelpers';
import { isZone } from '../utils/categoryKind';

export default function EventDetailScreen({ route, navigation }) {
  const { event } = route.params;
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const { hasReminder, getReminder, setReminder, removeReminder } = useReminders();

  // Deferred-alert timer — cleared on unmount so it can't fire on another screen.
  const alertTimer = useRef(null);
  useEffect(() => () => clearTimeout(alertTimer.current), []);

  const eventHasReminder = hasReminder(event.id);
  const existingReminder = getReminder(event.id);
  const minutesUntil = getMinutesUntilEvent(event);
  const isPast = minutesUntil !== null && minutesUntil < 0;

  const handleSetReminder = useCallback(async (minutes) => {
    const res = await setReminder(event, minutes);
    if (!res || res.scheduled) return;
    // Defer past the reminder-picker modal's slide-out (~300ms) — presenting an
    // alert on a view controller that's still dismissing makes iOS drop it.
    alertTimer.current = setTimeout(() => {
      if (res.reason === 'permission') {
        Alert.alert(
          'Added to your plan',
          'Turn on notifications for Pyramid Festival to get a reminder before this set.',
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings().catch(() => {}) },
          ],
        );
      } else if (res.reason === 'past') {
        Alert.alert('Added to your plan', "This set has already started, so we can't send a reminder.");
      } else if (res.reason === 'notime') {
        Alert.alert('Added to your plan', "This set has no start time yet, so we can't send a reminder.");
      }
    }, 400);
  }, [event, setReminder]);

  const handleRemoveReminder = useCallback(async () => {
    try {
      await removeReminder(event.id);
    } catch (error) {
      console.error('Error removing reminder:', error);
    }
  }, [event.id, removeReminder]);

  // Web: toggle save-to-plan directly (no picker, no alert). Native uses the picker.
  const handleWebToggleSave = useCallback(() => {
    if (eventHasReminder) removeReminder(event.id);
    else setReminder(event, WEB_SAVE_MINUTES);
  }, [eventHasReminder, event, setReminder, removeReminder]);

  const stageColor = event.categoryColor || t.accent2;

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      {/* Own header (headerShown:false) */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: t.bg2, borderBottomColor: t.hairline }]}>
        <View style={styles.headerMotif} pointerEvents="none">
          <Rings369 size={130} stroke={1} color={t.accent} />
        </View>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: t.surface, borderColor: t.hairlineStrong }]}
          onPress={() => navigation.goBack()}
          hitSlop={8}
        >
          <IconChevronLeft size={22} color={t.ink} />
        </TouchableOpacity>
        <Text style={[styles.headerEyebrow, { color: t.accent }]}>SOVRA EDITION · {isZone(event.categoryName) ? 'EVENT' : 'SET'}</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Stage banner */}
        <View style={[styles.stageBanner, { backgroundColor: stageColor }]}>
          <Text style={styles.stageName}>{(event.categoryName || 'Event').toUpperCase()}</Text>
        </View>

        <View style={styles.body}>
          {/* Title */}
          <Text style={[styles.title, { color: t.ink }]}>{event.title}</Text>

          {/* Info rows */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <IconCal size={20} color={t.accent2} />
              <Text style={[styles.infoText, { color: t.ink }]}>
                {formatDateLong(parseDate(event.date))}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <IconClock size={20} color={t.accent2} />
              <Text style={[styles.infoText, { color: t.ink }]}>
                {formatTime(event.time)}
                {event.endTime ? ` – ${formatTime(event.endTime)}` : ''}
              </Text>
            </View>
          </View>

          {/* About */}
          {event.description && (
            <View style={[styles.descriptionSection, { borderTopColor: t.hairline }]}>
              <Text style={[styles.descriptionTitle, { color: t.ink3 }]}>ABOUT</Text>
              <Text style={[styles.description, { color: t.ink2 }]}>{event.description}</Text>
            </View>
          )}

          {/* Reminder status card */}
          {eventHasReminder && !isPast && (
            <View style={[styles.reminderStatus, { backgroundColor: t.surface, borderColor: t.hairline }, t.cardShadow]}>
              <View style={[styles.reminderStatusIcon, { backgroundColor: t.accent2 + '22' }]}>
                <IconBell size={22} color={t.accent2} />
              </View>
              <View style={styles.reminderStatusContent}>
                <Text style={[styles.reminderStatusTitle, { color: t.ink }]}>
                  {IS_WEB ? 'Saved to My Plan' : 'Reminder set'}
                </Text>
                <Text style={[styles.reminderStatusText, { color: t.ink2 }]}>
                  {IS_WEB
                    ? 'Get the app for a reminder before it starts'
                    : `${existingReminder.minutesBefore} minutes before`}
                </Text>
              </View>
              {!IS_WEB && (
                <TouchableOpacity
                  style={[styles.reminderEditButton, { borderColor: t.hairlineStrong }]}
                  onPress={() => setReminderModalVisible(true)}
                >
                  <Text style={[styles.reminderEditButtonText, { color: t.accent }]}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Themed motif fills the space below the details instead of dead area */}
        <View style={styles.bodyGeo} pointerEvents="none">
          <SeedOfLife size={280} stroke={1} color={stageColor} />
        </View>
      </ScrollView>

      {/* Bottom action bar — hidden for past events */}
      {!isPast && (
        <View style={[styles.actionBar, { backgroundColor: t.bg2, borderTopColor: t.hairline, paddingBottom: insets.bottom + 14 }]}>
          <TouchableOpacity
            style={[
              styles.reminderButton,
              { backgroundColor: t.surface, borderColor: t.hairlineStrong },
              eventHasReminder && { backgroundColor: t.accent, borderColor: t.accent },
              eventHasReminder && t.glow,
            ]}
            activeOpacity={0.85}
            onPress={IS_WEB ? handleWebToggleSave : () => setReminderModalVisible(true)}
          >
            {eventHasReminder
              ? (IS_WEB ? <IconStar size={20} filled color={t.onAccent} /> : <IconBell size={20} color={t.onAccent} />)
              : <IconStar size={20} filled={false} color={t.ink} />}
            <Text style={[styles.reminderButtonText, { color: eventHasReminder ? t.onAccent : t.ink }]}>
              {IS_WEB
                ? (eventHasReminder ? 'Saved to My Plan' : 'Save to My Plan')
                : (eventHasReminder ? 'Reminder Set' : 'Set Reminder')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reminder picker modal */}
      <ReminderPicker
        visible={reminderModalVisible}
        onClose={() => setReminderModalVisible(false)}
        onSetReminder={handleSetReminder}
        onRemoveReminder={handleRemoveReminder}
        event={event}
        existingReminder={existingReminder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerMotif: { position: 'absolute', top: -56, right: -42, opacity: 0.22 },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEyebrow: {
    marginTop: 12,
    fontFamily: fonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 2.4,
  },

  scrollView: { flex: 1 },
  content: { paddingBottom: 110 },

  stageBanner: {
    paddingVertical: 11,
    paddingHorizontal: 20,
  },
  stageName: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 1.6,
    color: '#FFFFFF',
  },

  body: { paddingHorizontal: 20, paddingTop: 18 },

  bodyGeo: { alignItems: 'center', justifyContent: 'center', marginTop: 28, opacity: 0.12 },

  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.5,
  },

  infoSection: { marginTop: 18, gap: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoText: { fontFamily: fonts.bodySemi, fontSize: 15.5 },

  descriptionSection: {
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
  },
  descriptionTitle: {
    fontFamily: fonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 1.6,
    marginBottom: 8,
  },
  description: { fontFamily: fonts.body, fontSize: 15, lineHeight: 24 },

  reminderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  reminderStatusIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderStatusContent: { flex: 1 },
  reminderStatusTitle: { fontFamily: fonts.displaySemi, fontSize: 16 },
  reminderStatusText: { fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
  reminderEditButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  reminderEditButtonText: { fontFamily: fonts.bodyBold, fontSize: 13 },

  actionBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingVertical: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  reminderButtonText: { fontFamily: fonts.displaySemi, fontSize: 16 },
});
