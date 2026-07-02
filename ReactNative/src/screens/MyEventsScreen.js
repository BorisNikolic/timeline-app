/**
 * MyEventsScreen — "My Plan" (saved sets)
 *
 * Source of truth = reminders (useReminders.getAllReminders()). Each saved set is a
 * reminder; the star removes it. We also load the full timeline events so we can look
 * up an event's endTime (for the overlap "overlaps" tag) and build a rich event object
 * for navigation. All presentation; data/logic preserved.
 */

import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../contexts/ThemeContext';
import { fonts, radius } from '../theme/tokens';
import { Rings369, PyramidMark } from '../components/geometry/Geometry';
import { IconBell, IconStar, IconArrow } from '../components/ui/Icons';
import ThemeToggle from '../components/ui/ThemeToggle';

import { useReminders } from '../hooks/useReminders';
import { useTimelineEvents } from '../hooks/useEvents';
import { formatTime, parseDate, getUniqueDates, getPowerDays } from '../utils/dateHelpers';
import { TIMELINE_ID } from '../utils/constants';
import { isZone } from '../utils/categoryKind';

const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toMin = (t) => { const [h, m] = (t || '0:0').split(':').map(Number); return h * 60 + m; };
const overlaps = (a, b) => {
  let as = toMin(a.start), ae = toMin(a.end); if (ae <= as) ae += 1440;
  let bs = toMin(b.start), be = toMin(b.end); if (be <= bs) be += 1440;
  return as < be && bs < ae;
};

function PlanCard({ t, set, onPress, onRemove }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, t.cardShadow, { backgroundColor: t.surface, borderColor: t.hairline, borderLeftColor: set.color }]}
    >
      <View style={styles.timeCol}>
        <Text style={[styles.timeStart, { color: t.ink }]}>{formatTime(set.start)}</Text>
        {!!set.endLabel && <Text style={[styles.timeEnd, { color: t.ink3 }]}>{set.endLabel}</Text>}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text numberOfLines={1} style={[styles.stage, { color: set.color }]}>{set.stageName}</Text>
          {set.clash && (
            <View style={[styles.clashTag, { backgroundColor: t.hot + '29' }]}>
              <Text style={[styles.clashText, { color: t.hot }]}>OVERLAPS</Text>
            </View>
          )}
        </View>
        <Text numberOfLines={2} style={[styles.cardTitle, { color: t.ink }]}>{set.title}</Text>
      </View>

      <TouchableOpacity
        onPress={onRemove}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Remove from plan"
        style={styles.removeBtn}
      >
        <IconStar size={20} filled color={t.accent} stroke={1.8} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function MyEventsScreen({ navigation }) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();

  const { getAllReminders, removeReminder, loading, refreshReminders } = useReminders();
  const { data: events } = useTimelineEvents(TIMELINE_ID);

  const saved = useMemo(() => getAllReminders(), [getAllReminders]);

  // eventId -> full event (for endTime + navigation payload)
  const eventsById = useMemo(() => {
    const m = {};
    (events || []).forEach(e => { m[e.id] = e; });
    return m;
  }, [events]);

  // 3·6·9 power-day anchors from the full festival schedule.
  const powerDays = useMemo(() => getPowerDays(events ? getUniqueDates(events) : []), [events]);

  // Group saved sets by day, compute end label + overlap clashes within each day.
  const dayGroups = useMemo(() => {
    const byDate = {};
    saved.forEach(r => {
      (byDate[r.eventDate] || (byDate[r.eventDate] = [])).push(r);
    });

    return Object.keys(byDate).sort().map(dateKey => {
      const full = byDate[dateKey]
        .map(r => {
          const ev = eventsById[r.eventId];
          return {
            id: r.eventId,
            title: r.eventTitle,
            date: r.eventDate,
            start: r.eventTime,
            end: ev?.endTime || null,
            endLabel: ev?.endTime ? formatTime(ev.endTime) : '',
            stageName: r.categoryName,
            color: r.categoryColor || t.accent2,
          };
        })
        .sort((a, b) => toMin(a.start) - toMin(b.start));

      // Overlap = clashes with another saved set on a DIFFERENT stage that day.
      // Requires endTime on both; skip otherwise.
      full.forEach(s => {
        s.clash = !!s.end && full.some(o =>
          o.id !== s.id && o.end && o.stageName !== s.stageName && overlaps(s, o)
        );
      });

      const d = parseDate(dateKey);
      return {
        dateKey,
        dow: DOW[d.getDay()],
        dayNum: String(d.getDate()).padStart(2, '0'),
        month: MONTH[d.getMonth()],
        powerLabel: powerDays[dateKey] || null,
        sets: full,
      };
    });
  }, [saved, eventsById, powerDays, t.accent2]);

  // Stats
  const total = saved.length;
  const dayCount = dayGroups.length;
  const stageCount = useMemo(() => new Set(saved.map(r => r.categoryName)).size, [saved]);

  // Music sets vs zone events: label the plan by its honest contents — "sets"
  // only when everything saved is a music set, otherwise the neutral "events".
  const allSets = total > 0 && saved.every(r => !isZone(r.categoryName));
  const pl = (n, one) => (n === 1 ? one : `${one}s`);
  const itemsLabel = allSets ? pl(total, 'set') : pl(total, 'event');
  const itemsSingular = allSets ? 'set' : 'event';

  const handleRemove = useCallback(async (eventId) => {
    try { await removeReminder(eventId); } catch (e) { console.error('Error removing reminder:', e); }
  }, [removeReminder]);

  const handlePress = useCallback((set) => {
    const full = eventsById[set.id];
    const event = full
      ? { ...full, categoryName: set.stageName, categoryColor: set.color }
      : { id: set.id, title: set.title, date: set.date, time: set.start, categoryName: set.stageName, categoryColor: set.color };
    navigation.navigate('EventDetail', { event });
  }, [eventsById, navigation]);

  const handleBrowse = useCallback(() => {
    navigation.getParent()?.navigate('Schedule');
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <ThemeToggle variant="auto" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.bg2, borderBottomColor: t.hairline, paddingTop: insets.top + 12 }]}>
        <View style={styles.headerMotif} pointerEvents="none">
          <Rings369 size={150} stroke={1} color={t.accent} />
        </View>

        <Text style={[styles.eyebrow, { color: t.accent }]}>SOVRA EDITION · YOURS</Text>
        <Text style={[styles.h1, { color: t.ink }]}>My Plan</Text>

        {total > 0 && (
          <View style={styles.stats}>
            <Stat t={t} num={total} label={itemsLabel} />
            <View style={[styles.statDiv, { backgroundColor: t.hairlineStrong }]} />
            <Stat t={t} num={dayCount} label={pl(dayCount, 'day')} />
            <View style={[styles.statDiv, { backgroundColor: t.hairlineStrong }]} />
            <Stat t={t} num={stageCount} label={pl(stageCount, 'stage')} />
          </View>
        )}
      </View>

      {/* Body */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshReminders} tintColor={t.accent} />}
      >
        {total === 0 ? (
          <View style={styles.empty}>
            <View style={{ opacity: 0.8 }}><PyramidMark size={52} stroke={1.2} color={t.accent} /></View>
            <Text style={[styles.emptyTitle, { color: t.ink }]}>Your plan is empty</Text>
            <Text style={[styles.emptyText, { color: t.ink2 }]}>
              Star the events you can't miss in the Lineup and they'll gather here — with reminders before each one.
            </Text>
            <TouchableOpacity activeOpacity={0.85} onPress={handleBrowse} style={[styles.emptyCta, t.glow, { backgroundColor: t.accent }]}>
              <Text style={[styles.emptyCtaText, { color: t.onAccent }]}>Browse the lineup</Text>
              <IconArrow size={17} color={t.onAccent} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={[styles.note, { backgroundColor: t.surface, borderColor: t.hairline }]}>
              <IconBell size={16} color={t.ink2} />
              <Text style={[styles.noteText, { color: t.ink2 }]}>We'll nudge you 15 minutes before each saved {itemsSingular}.</Text>
            </View>

            {dayGroups.map(g => (
              <View key={g.dateKey} style={styles.daySection}>
                <View style={styles.dayHead}>
                  <Text style={[styles.dayDow, { color: t.ink3 }]}>{g.dow.toUpperCase()}</Text>
                  <Text style={[styles.dayNum, { color: t.ink }]}>{g.dayNum}</Text>
                  <Text style={[styles.dayMonth, { color: t.ink2 }]}>{g.month}</Text>
                  {!!g.powerLabel && <Text style={[styles.dayTag, { color: t.accent }]}>{g.powerLabel.toUpperCase()}</Text>}
                </View>

                <View style={styles.cardsCol}>
                  {g.sets.map(set => (
                    <PlanCard
                      key={set.id}
                      t={t}
                      set={set}
                      onPress={() => handlePress(set)}
                      onRemove={() => handleRemove(set.id)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Stat({ t, num, label }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statNum, { color: t.accent }]}>{num}</Text>
      <Text style={[styles.statLbl, { color: t.ink3 }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingRight: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerMotif: { position: 'absolute', top: -46, right: -40, opacity: 0.22 },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 2.4 },
  h1: { fontFamily: fonts.display, fontSize: 32, marginTop: 6, letterSpacing: -0.6 },

  stats: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 14 },
  stat: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  statNum: { fontFamily: fonts.display, fontSize: 22 },
  statLbl: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.1 },
  statDiv: { width: 1, height: 18 },

  scroll: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 90 },

  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  noteText: { flex: 1, fontFamily: fonts.bodySemi, fontSize: 12.5 },

  daySection: { marginTop: 18 },
  dayHead: { flexDirection: 'row', alignItems: 'baseline', gap: 7, paddingHorizontal: 2, paddingBottom: 11 },
  dayDow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 1.2 },
  dayNum: { fontFamily: fonts.display, fontSize: 24 },
  dayMonth: { fontFamily: fonts.bodyBold, fontSize: 13 },
  dayTag: { marginLeft: 'auto', fontFamily: fonts.bodyBold, fontSize: 10.5, letterSpacing: 0.9 },

  cardsCol: { gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingRight: 12,
    paddingLeft: 14,
  },
  timeCol: { width: 52, flexShrink: 0 },
  timeStart: { fontFamily: fonts.bodyExtra, fontSize: 14, fontVariant: ['tabular-nums'] },
  timeEnd: { fontFamily: fonts.body, fontSize: 11, marginTop: 2, fontVariant: ['tabular-nums'] },

  cardBody: { flex: 1, minWidth: 0 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  stage: { fontFamily: fonts.bodyExtra, fontSize: 11, letterSpacing: 0.5, flexShrink: 1 },
  clashTag: { paddingVertical: 2, paddingHorizontal: 7, borderRadius: radius.pill },
  clashText: { fontFamily: fonts.bodyExtra, fontSize: 10, letterSpacing: 0.4 },
  cardTitle: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 19 },

  removeBtn: { flexShrink: 0, padding: 4 },

  empty: { alignItems: 'center', paddingVertical: 54, paddingHorizontal: 18 },
  emptyTitle: { fontFamily: fonts.display, fontSize: 22, marginTop: 18, marginBottom: 8, textAlign: 'center' },
  emptyText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22, textAlign: 'center', maxWidth: 270, marginBottom: 22 },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.pill,
    paddingVertical: 13,
    paddingHorizontal: 22,
  },
  emptyCtaText: { fontFamily: fonts.bodyExtra, fontSize: 15 },
});
