/**
 * ScheduleScreen — "Set Times" lineup (timeline layout) on the Pyramid theme.
 *
 * Presentation rebuilt to match the design's schedule.jsx; ALL data wiring,
 * reminder/save mapping, offline + loading states preserved. Saving a set now
 * uses the reminder system (star = hasReminder).
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../contexts/ThemeContext';
import { fonts, radius } from '../theme/tokens';
import { Rings369, PyramidMark } from '../components/geometry/Geometry';
import { IconStar } from '../components/ui/Icons';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import OfflineFirstLaunch from '../components/OfflineFirstLaunch';

import { useTimelineEvents, useCategories, useEventsForDate } from '../hooks/useEvents';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { useReminders } from '../hooks/useReminders';
import { useNetwork } from '../contexts/NetworkContext';
import {
  formatTime,
  getFestivalDays,
  parseDate,
  isSameDay,
  formatDateForApi,
  getPowerDays,
  isEventHappeningNow,
} from '../utils/dateHelpers';
import { TIMELINE_ID, DEFAULT_REMINDER_MINUTES } from '../utils/constants';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ALL = 'all';

// ── Day picker ──────────────────────────────────────────────────────────────
function DayPicker({ t, dates, selected, onSelect, powerDays }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.dayRow}
    >
      {dates.map(date => {
        const on = selected && isSameDay(date, selected);
        const power = !!powerDays[formatDateForApi(date)];
        return (
          <TouchableOpacity
            key={date.toISOString()}
            activeOpacity={0.8}
            onPress={() => onSelect(date)}
            style={[
              styles.dayPill,
              { backgroundColor: on ? t.accent : t.surface, borderColor: on ? t.accent : t.hairlineStrong },
            ]}
          >
            <Text style={[styles.dayDow, { color: on ? t.onAccent : t.ink3 }]}>
              {DOW[date.getDay()]}
            </Text>
            <Text style={[styles.dayNum, { color: on ? t.onAccent : t.ink }]}>
              {date.getDate()}
            </Text>
            {power ? (
              <View style={[styles.powerDot, { backgroundColor: on ? t.onAccent : t.accent }]} />
            ) : null}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ── Stage filter ────────────────────────────────────────────────────────────
function StageFilter({ t, stages, selected, onSelect }) {
  const Chip = ({ id, label, color }) => {
    const on = selected === id;
    // "All stages" inverse fix: bg t.ink / text t.bg in selected state.
    const bg = on ? (color || t.ink) : 'transparent';
    const border = on ? (color || t.ink) : t.hairlineStrong;
    const text = on ? (color ? '#fff' : t.bg) : t.ink2;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSelect(id)}
        style={[styles.chip, { backgroundColor: bg, borderColor: border }]}
      >
        {color ? <View style={[styles.chipDot, { backgroundColor: on ? '#fff' : color }]} /> : null}
        <Text style={[styles.chipText, { color: text }]}>{label}</Text>
      </TouchableOpacity>
    );
  };
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipScroll}
      contentContainerStyle={styles.chipRow}
    >
      <Chip id={ALL} label="All stages" color={null} />
      {stages.map(s => <Chip key={s.id} id={s.id} label={s.name} color={s.color} />)}
    </ScrollView>
  );
}

// ── Timeline event row ──────────────────────────────────────────────────────
function EventRow({ t, ev, now, saved, onPress, onSave }) {
  const color = ev.categoryColor;
  const live = isEventHappeningNow(ev, now);
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.tlRow}>
      <View style={styles.tlTimeCol}>
        <Text style={[styles.tlStart, { color: t.ink }]} numberOfLines={1} adjustsFontSizeToFit>{formatTime(ev.time)}</Text>
        {ev.endTime ? <Text style={[styles.tlEnd, { color: t.ink3 }]} numberOfLines={1} adjustsFontSizeToFit>{formatTime(ev.endTime)}</Text> : null}
      </View>

      <View style={styles.tlRail}>
        <View style={[styles.tlLine, { backgroundColor: t.hairlineStrong }]} />
        <View style={[styles.tlNode, { backgroundColor: live ? t.hot : t.bg, borderColor: live ? t.hot : color }]} />
      </View>

      <View style={[
        styles.tlCard,
        { backgroundColor: t.surface, borderColor: live ? t.hot : t.hairline, borderLeftColor: live ? t.hot : color },
        t.cardShadow,
      ]}>
        <View style={styles.tlCardBody}>
          <View style={styles.cardStageRow}>
            <Text style={[styles.cardStage, { color }]} numberOfLines={1}>
              {ev.categoryName.toUpperCase()}
            </Text>
            {live && (
              <View style={[styles.liveBadge, { backgroundColor: t.hot + '22' }]}>
                <View style={[styles.liveBadgeDot, { backgroundColor: t.hot }]} />
                <Text style={[styles.liveBadgeText, { color: t.hot }]}>LIVE</Text>
              </View>
            )}
          </View>
          <Text style={[styles.cardTitle, { color: t.ink }]} numberOfLines={2}>
            {ev.title}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onSave}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.favBtn}
        >
          <IconStar size={20} stroke={1.8} filled={saved} color={saved ? t.accent : t.ink3} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function ScheduleScreen({ navigation, route }) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const timelineId = TIMELINE_ID;

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // null === "all"

  const listRef = useRef(null);

  const currentTime = useCurrentTime();

  const { isConnected, isInternetReachable } = useNetwork();
  const isOffline = !isConnected || !isInternetReachable;

  const { data: events, isLoading: eventsLoading, isError, refetch: refetchEvents } = useTimelineEvents(timelineId);
  const { data: categories } = useCategories(timelineId);

  const { hasReminder, setReminder, removeReminder } = useReminders();

  // Unique festival dates with events + the 3·6·9 power-day anchors.
  const availableDates = useMemo(() => (events ? getFestivalDays(events) : []), [events]);
  const powerDays = useMemo(() => getPowerDays(availableDates), [availableDates]);

  // Smart initial date selection (preserved logic): today if it has events, else first day.
  useEffect(() => {
    if (availableDates.length > 0 && selectedDate === null) {
      const today = new Date();
      const todayHasEvents = availableDates.some(d => isSameDay(d, today));
      setSelectedDate(todayHasEvents ? today : availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  // Preselect a stage when arriving from a Home "Stages & Zones" card. The `ts`
  // nonce re-applies the filter even when the same stage is tapped again.
  useEffect(() => {
    const cid = route.params?.categoryId;
    if (cid !== undefined) setSelectedCategoryId(cid);
  }, [route.params?.categoryId, route.params?.ts]);

  // Reset the list to the top whenever the day or stage changes, so switching
  // days never leaves you stranded mid-list on unrelated sets.
  useEffect(() => {
    listRef.current?.scrollTo({ y: 0, animated: true });
  }, [selectedDate, selectedCategoryId]);

  // Filter + sort events for the selected day & stage.
  const filteredEvents = useEventsForDate(events, selectedDate, selectedCategoryId);

  // Enrich with category info (preserved pattern).
  const enrichedEvents = useMemo(() => {
    if (!filteredEvents || !categories) return [];
    return filteredEvents.map(event => {
      const category = categories.find(c => c.id === event.categoryId);
      return {
        ...event,
        categoryName: category?.name || 'Event',
        categoryColor: category?.color || t.accent2,
      };
    });
  }, [filteredEvents, categories, t.accent2]);

  // When a stage is selected but has nothing on the chosen day, find its very
  // first programmed set across the festival so the empty state can point to
  // when that stage actually kicks off (e.g. Tok has no sets the first days).
  const stageFirstSet = useMemo(() => {
    if (!selectedCategoryId || !events) return null;
    const catEvents = events
      .filter(e => e.categoryId === selectedCategoryId && e.time)
      .sort((a, b) => {
        const da = e => (e.date || '').split('T')[0];
        return da(a) === da(b) ? a.time.localeCompare(b.time) : da(a).localeCompare(da(b));
      });
    return catEvents[0] || null;
  }, [events, selectedCategoryId]);

  // Count of saved sets among ALL of the selected day's events.
  const savedCount = useMemo(() => {
    if (!events || !selectedDate) return 0;
    return events.filter(e => isSameDay(parseDate(e.date), selectedDate) && hasReminder(e.id)).length;
  }, [events, selectedDate, hasReminder]);

  const handleEventPress = useCallback((event) => {
    navigation.navigate('EventDetail', { event });
  }, [navigation]);

  // Star toggles a saved set (mapped to the reminder system). Saving always
  // succeeds; a reminder is scheduled only when possible (see RemindersContext).
  const handleSave = useCallback((event) => {
    if (hasReminder(event.id)) removeReminder(event.id);
    else setReminder(event, DEFAULT_REMINDER_MINUTES);
  }, [hasReminder, removeReminder, setReminder]);

  // Offline first launch — no cached data and offline.
  if (!events && isError && isOffline) {
    return <OfflineFirstLaunch onRetry={refetchEvents} />;
  }

  // Loading / awaiting date selection.
  if ((eventsLoading && !events) || selectedDate === null) {
    return (
      <View style={[styles.loading, { backgroundColor: t.bg }]}>
        <ActivityIndicator size="large" color={t.accent} />
        <Text style={[styles.loadingText, { color: t.ink2 }]}>Loading schedule...</Text>
      </View>
    );
  }

  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabel = `${DOW[selectedDate.getDay()]} ${selectedDate.getDate()} ${MON[selectedDate.getMonth()]}`;
  const powerLabel = powerDays[formatDateForApi(selectedDate)];

  const selectedStageName = categories?.find(c => c.id === selectedCategoryId)?.name || 'This stage';
  let firstSetDayLabel = null;
  if (stageFirstSet) {
    const d = parseDate(stageFirstSet.date);
    firstSetDayLabel = `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <ThemeToggle variant="auto" />

      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: t.bg2, borderBottomColor: t.hairline, paddingTop: insets.top + 10 },
        ]}
      >
        <View style={styles.rings} pointerEvents="none">
          <Rings369 size={150} stroke={1} color={t.accent} />
        </View>
        <View style={styles.headerInner}>
          <Text style={[styles.eyebrow, { color: t.accent }]}>SOVRA EDITION · LINEUP</Text>
          <Text style={[styles.h1, { color: t.ink }]}>Set Times</Text>
        </View>

        <DayPicker t={t} dates={availableDates} selected={selectedDate} onSelect={setSelectedDate} powerDays={powerDays} />
      </View>

      <StageFilter
        t={t}
        stages={categories || []}
        selected={selectedCategoryId ?? ALL}
        onSelect={(id) => setSelectedCategoryId(id === ALL ? null : id)}
      />

      <ScrollView
        ref={listRef}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={eventsLoading} onRefresh={refetchEvents} tintColor={t.accent} />
        }
      >
        {/* Day head */}
        <View style={styles.dayHead}>
          <Text style={[styles.dayHeadLabel, { color: t.ink }]}>{dayLabel}</Text>
          {powerLabel ? (
            <Text style={[styles.dayHeadTag, { color: t.accent }]}>{powerLabel} · power day</Text>
          ) : null}
          <View style={[styles.savedPill, { backgroundColor: t.surface, borderColor: t.hairlineStrong }]}>
            <IconStar size={14} stroke={1.6} filled color={t.accent} />
            <Text style={[styles.savedPillText, { color: t.accent }]}>{savedCount} saved</Text>
          </View>
        </View>

        {enrichedEvents.length === 0 ? (
          <View style={styles.empty}>
            <PyramidMark size={40} stroke={1.2} color={t.ink3} />
            {firstSetDayLabel ? (
              <>
                <Text style={[styles.emptyText, { color: t.ink3 }]}>
                  No {selectedStageName} sets on {dayLabel}.
                </Text>
                <Text style={[styles.emptyHint, { color: t.ink2 }]}>
                  {selectedStageName} kicks off {firstSetDayLabel} at {formatTime(stageFirstSet.time)}.
                </Text>
              </>
            ) : (
              <Text style={[styles.emptyText, { color: t.ink3 }]}>No sets for this filter yet.</Text>
            )}
          </View>
        ) : (
          <View style={styles.tlCol}>
            {enrichedEvents.map(ev => (
              <EventRow
                key={ev.id}
                t={t}
                ev={ev}
                now={currentTime}
                saved={hasReminder(ev.id)}
                onPress={() => handleEventPress(ev)}
                onSave={() => handleSave(ev)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: fonts.body, fontSize: 14, marginTop: 14 },

  // Header
  header: { position: 'relative', overflow: 'hidden', borderBottomWidth: 1, paddingBottom: 12 },
  rings: { position: 'absolute', top: -50, right: -40, opacity: 0.25 },
  headerInner: { paddingTop: 4, paddingBottom: 14, paddingLeft: 20, paddingRight: 60 },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase' },
  h1: { fontFamily: fonts.display, fontSize: 32, marginTop: 6, letterSpacing: -0.5 },

  // Day picker
  dayRow: { flexDirection: 'row', gap: 9, paddingHorizontal: 20, paddingBottom: 2 },
  dayPill: {
    width: 52, height: 64, borderRadius: radius.md, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', gap: 2, position: 'relative',
  },
  dayDow: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  dayNum: { fontFamily: fonts.display, fontSize: 22, lineHeight: 24 },
  powerDot: { position: 'absolute', bottom: 8, width: 4, height: 4, borderRadius: 2 },

  // Stage filter — fixed-height row so the horizontal ScrollView can't
  // stretch vertically (which was ballooning the chips into tall pills).
  chipScroll: { flexGrow: 0, height: 62 },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 7, height: 38,
    paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1,
  },
  chipDot: { width: 7, height: 7, borderRadius: 4 },
  chipText: { fontFamily: fonts.bodyBold, fontSize: 13 },

  // List
  list: { flex: 1 },
  listContent: { paddingTop: 4, paddingBottom: 90 },
  dayHead: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14,
  },
  dayHeadLabel: { fontFamily: fonts.bodyExtra, fontSize: 13, letterSpacing: 0.2 },
  dayHeadTag: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase' },
  savedPill: {
    marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 11, paddingVertical: 5, borderRadius: radius.pill, borderWidth: 1,
  },
  savedPillText: { fontFamily: fonts.bodyExtra, fontSize: 12 },

  // Timeline rows
  tlCol: { paddingRight: 20 },
  tlRow: { flexDirection: 'row', alignItems: 'stretch', minHeight: 64 },
  tlTimeCol: { width: 68, paddingRight: 10, paddingTop: 2, alignItems: 'flex-end' },
  tlStart: { fontFamily: fonts.bodyExtra, fontSize: 12.5 },
  tlEnd: { fontFamily: fonts.bodyMed, fontSize: 11, marginTop: 2 },
  tlRail: { width: 18, alignItems: 'center', position: 'relative' },
  tlLine: { position: 'absolute', top: 0, bottom: 0, width: 2 },
  tlNode: { width: 11, height: 11, borderRadius: 6, borderWidth: 2.5, marginTop: 4 },
  tlCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12,
    borderWidth: 1, borderLeftWidth: 3, borderRadius: radius.sm, paddingVertical: 11, paddingHorizontal: 13,
  },
  tlCardBody: { flex: 1, minWidth: 0 },
  cardStageRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardStage: { fontFamily: fonts.bodyExtra, fontSize: 11, letterSpacing: 0.5, flexShrink: 1 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  liveBadgeDot: { width: 6, height: 6, borderRadius: 999 },
  liveBadgeText: { fontFamily: fonts.bodyExtra, fontSize: 9, letterSpacing: 1 },
  cardTitle: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 20, marginTop: 3 },
  favBtn: { padding: 4 },

  // Empty
  empty: { alignItems: 'center', gap: 10, paddingVertical: 60, paddingHorizontal: 30 },
  emptyText: { fontFamily: fonts.bodyBold, fontSize: 15, textAlign: 'center' },
  emptyHint: { fontFamily: fonts.bodySemi, fontSize: 13.5, lineHeight: 20, textAlign: 'center' },
});
