/**
 * HomeScreen — Pyramid Festival landing (SOVRA Edition redesign)
 * Hero countdown + up-next ribbon + stages grid + 3·6·9 strip + village news.
 */

import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../contexts/ThemeContext';
import { fonts, radius, motif } from '../theme/tokens';
import { PyramidMark, Rings369, SeedOfLife, Rays } from '../components/geometry/Geometry';
import { IconArrow, IconPin } from '../components/ui/Icons';
import { useCountdown } from '../components/ui/useCountdown';
import SectionTitle from '../components/ui/SectionTitle';
import ThemeToggle from '../components/ui/ThemeToggle';

import { useTimelineEvents, useCategories, useHappeningNow } from '../hooks/useEvents';
import { useBlogPosts } from '../hooks/useBlogPosts';
import { useCurrentTime } from '../hooks/useCurrentTime';
import {
  formatTime,
  parseDate,
  isSameDay,
  getUniqueDates,
  formatDateRange,
} from '../utils/dateHelpers';
import { TIMELINE_ID } from '../utils/constants';

const HERO_INK = '#F7F3EA';
const FESTIVAL = {
  edition: 'SOVRA EDITION',
  dateLabel: 'Dates coming soon',
  place: 'Pyramid Village · Rtanj Mountain, Serbia',
  // TODO: paste real destinations. Empty string = friendly "coming soon" note.
  ticketUrl: 'https://pyramidfestival.com/tickets/',
  filmUrl: 'https://www.youtube.com/watch?v=42COXoz1Slk', // last edition's aftermovie
};

// Open an external link. Until the URL is configured, show a friendly
// "coming soon" note instead of a dead tap.
async function openExternal(url, comingSoon) {
  if (!url) {
    if (comingSoon) Alert.alert(comingSoon.title, comingSoon.message);
    return;
  }
  try {
    await Linking.openURL(url);
  } catch (e) {
    console.warn('Could not open link:', e?.message || e);
  }
}

// — Festival timing + date label derived from the live schedule —
function useFestivalTiming(events) {
  const now = useCurrentTime();
  return useMemo(() => {
    const dates = events && events.length ? getUniqueDates(events) : [];
    if (!dates.length) return { hasDates: false, startMs: 0, live: false, past: false, dateLabel: '' };

    const first = dates[0];
    const last = dates[dates.length - 1];

    // Gates = earliest set time on the first festival day (fallback 10:00).
    const firstDayTimes = events
      .filter(e => e.time && isSameDay(parseDate(e.date), first))
      .map(e => e.time)
      .sort();
    const start = new Date(first);
    const [gh, gm] = (firstDayTimes[0] || '10:00').split(':').map(Number);
    start.setHours(gh, gm, 0, 0);

    const end = new Date(last);
    end.setHours(23, 59, 59, 999);

    const isFestivalDay = dates.some(d => isSameDay(d, now));
    const live = isFestivalDay || (now >= start && now <= end);
    const past = now > end;
    return { hasDates: true, startMs: start.getTime(), live, past, dateLabel: formatDateRange(dates) };
  }, [events, now]);
}

function CountdownUnit({ value, label, t }) {
  return (
    <View style={hs.cdUnit}>
      <Text style={[hs.cdValue, { color: HERO_INK }]}>{String(value).padStart(2, '0')}</Text>
      <Text style={[hs.cdLabel, { color: HERO_INK }]}>{label}</Text>
    </View>
  );
}

function Hero({ t, insets, timing }) {
  const cd = useCountdown(timing.hasDates ? timing.startMs : 0);
  const showLive = timing.live;
  const showPast = timing.past && !timing.live;

  return (
    <LinearGradient
      colors={[t.heroFrom, t.heroVia, t.heroTo]}
      // ~165deg diagonal
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={[hs.hero, { paddingTop: insets.top + 8 }]}
    >
      {/* geometry behind */}
      <View style={[hs.geoTopRight, { opacity: motif * 0.5 }]} pointerEvents="none">
        <Rays size={300} count={36} stroke={0.8} color={t.accent} />
      </View>
      <View style={[hs.geoBottomLeft, { opacity: motif * 0.55 }]} pointerEvents="none">
        <Rings369 size={210} stroke={1} color={t.accent2} />
      </View>

      {/* bottom legibility scrim */}
      <LinearGradient
        colors={['rgba(12,10,28,0.06)', 'rgba(12,10,28,0.18)', 'rgba(12,10,28,0.82)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={hs.heroInner}>
        <View style={hs.heroEyebrow}>
          <PyramidMark size={20} stroke={1.6} color={t.accent} />
          <Text style={[hs.eyebrowText, { color: t.accent }]}>{FESTIVAL.edition}</Text>
        </View>

        <Text style={[hs.heroTitle, { color: HERO_INK }]} numberOfLines={1} adjustsFontSizeToFit>PYRAMID</Text>
        <Text style={[hs.heroTitle, hs.heroTitleAccent, { color: t.accent }]} numberOfLines={1} adjustsFontSizeToFit>FESTIVAL</Text>

        <View style={hs.heroMeta}>
          <Text style={[hs.heroDate, { color: HERO_INK }]}>{timing.dateLabel || FESTIVAL.dateLabel}</Text>
          <View style={hs.heroPlace}>
            <IconPin size={13} color={HERO_INK} />
            <Text style={[hs.heroPlaceText, { color: HERO_INK }]}>{FESTIVAL.place}</Text>
          </View>
        </View>

        {/* countdown card */}
        <View style={[hs.countdown, { borderColor: 'rgba(247,243,234,0.16)' }]}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={hs.cdScrim} />
          <View style={hs.cdContent}>
            {showLive ? (
              <View style={hs.liveRow}>
                <View style={[hs.liveDot, { backgroundColor: t.hot }]} />
                <Text style={[hs.liveText, { color: HERO_INK }]}>The gathering is live</Text>
              </View>
            ) : showPast ? (
              <Text style={[hs.liveText, { color: HERO_INK }]}>See you next year</Text>
            ) : (
              <>
                <Text style={[hs.cdGatesLabel, { color: HERO_INK }]}>Gates open in</Text>
                {timing.hasDates ? (
                  <View style={hs.cdRow}>
                    <CountdownUnit value={cd.d} label="days" t={t} />
                    <Text style={[hs.cdSep, { color: HERO_INK }]}>:</Text>
                    <CountdownUnit value={cd.h} label="hrs" t={t} />
                    <Text style={[hs.cdSep, { color: HERO_INK }]}>:</Text>
                    <CountdownUnit value={cd.m} label="min" t={t} />
                    <Text style={[hs.cdSep, { color: HERO_INK }]}>:</Text>
                    <CountdownUnit value={cd.s} label="sec" t={t} />
                  </View>
                ) : null}
              </>
            )}
          </View>
        </View>

        {/* CTAs — Buy ticket is always live (next-year sales open right after the
            festival); the film button becomes the aftermovie once it's over */}
        <View style={hs.heroCtas}>
          <TouchableOpacity
            style={[hs.ctaPrimary, { backgroundColor: t.accent }, t.glow]}
            activeOpacity={0.85}
            onPress={() => openExternal(FESTIVAL.ticketUrl, { title: 'Tickets', message: 'Ticket sales open soon — check back shortly.' })}
          >
            <Text style={[hs.ctaPrimaryText, { color: t.onAccent }]} numberOfLines={1}>Buy ticket</Text>
            <IconArrow size={17} color={t.onAccent} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[hs.ctaGhost, { borderColor: 'rgba(247,243,234,0.28)' }]}
            activeOpacity={0.8}
            onPress={() => openExternal(FESTIVAL.filmUrl, showPast
              ? { title: 'Aftermovie', message: "The aftermovie is being edited — it'll land here soon." }
              : { title: 'Festival film', message: 'The teaser is on its way — check back soon.' })}
          >
            <Text style={[hs.ctaGhostText, { color: HERO_INK }]} numberOfLines={1}>
              {showPast ? 'Watch aftermovie' : 'Watch film'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

function UpNext({ t, label, title, time, endTime, onPress }) {
  return (
    <TouchableOpacity
      style={[hs.upNext, { backgroundColor: t.surface, borderColor: t.hairline, borderLeftColor: t.hot }, t.cardShadow]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[hs.upNextPulse, { backgroundColor: t.hot }]} />
      <View style={hs.upNextBody}>
        <Text style={[hs.upNextKicker, { color: t.hot }]} numberOfLines={1}>{label}</Text>
        <Text style={[hs.upNextTitle, { color: t.ink }]} numberOfLines={1}>{title}</Text>
      </View>
      <View style={hs.upNextTimeWrap}>
        <Text style={[hs.upNextTime, { color: t.ink }]}>{time}</Text>
        {endTime ? <Text style={[hs.upNextTimeEnd, { color: t.ink2 }]}>—{endTime}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

function StageCard({ t, stage, count, onPress }) {
  return (
    <TouchableOpacity
      style={[hs.stageCard, { backgroundColor: t.surface, borderColor: t.hairline }, t.cardShadow]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[hs.stageGeo, { opacity: motif * 0.9 }]} pointerEvents="none">
        <SeedOfLife size={92} stroke={1} color={stage.color} />
      </View>
      <View style={[hs.stageDot, { backgroundColor: stage.color }]} />
      <Text style={[hs.stageName, { color: t.ink }]} numberOfLines={1}>{stage.name}</Text>
      <Text style={[hs.stageKind, { color: t.ink3 }]}>{count} set{count === 1 ? '' : 's'}</Text>
    </TouchableOpacity>
  );
}

function NewsCard({ t, post, onPress }) {
  return (
    <TouchableOpacity
      style={[hs.newsCard, { backgroundColor: t.surface, borderColor: t.hairline }, t.cardShadow]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {post.image ? (
        <Image source={{ uri: post.image }} style={hs.newsImage} resizeMode="cover" />
      ) : (
        <View style={[hs.newsImage, { backgroundColor: t.surface2 }]} />
      )}
      <View style={hs.newsBody}>
        <Text style={[hs.newsKicker, { color: t.accent2 }]}>NEWS</Text>
        <Text style={[hs.newsTitle, { color: t.ink }]} numberOfLines={2}>{post.title}</Text>
        <Text style={[hs.newsDate, { color: t.ink3 }]}>{formatNewsDate(post.date)}</Text>
      </View>
    </TouchableOpacity>
  );
}

function formatNewsDate(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function HomeScreen({ navigation }) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const timelineId = TIMELINE_ID;
  const currentTime = useCurrentTime();

  const { data: events, isLoading, refetch } = useTimelineEvents(timelineId);
  const { data: categories } = useCategories(timelineId);
  const { data: blogPosts } = useBlogPosts(5);

  const timing = useFestivalTiming(events);

  // Currently happening (raw), via the shared hook at the top level.
  const liveEvents = useHappeningNow(events, currentTime);

  // Currently happening (enriched), like the existing screen.
  const happeningNowEvents = useMemo(() => {
    if (!categories) return [];
    return (liveEvents || []).map(event => {
      const category = categories.find(c => c.id === event.categoryId);
      return {
        ...event,
        categoryName: category?.name || 'Event',
        categoryColor: category?.color || t.accent2,
      };
    });
  }, [liveEvents, categories, t.accent2]);

  // Next upcoming event today (not yet started), enriched.
  const upNextEvents = useMemo(() => {
    if (!events || !categories) return [];
    const today = currentTime;
    return events
      .filter(event => {
        const eventDate = parseDate(event.date);
        if (!isSameDay(eventDate, today)) return false;
        if (!event.time) return false;
        const [h, m] = event.time.split(':').map(Number);
        const start = new Date(eventDate);
        start.setHours(h, m, 0, 0);
        return start > today;
      })
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
      .map(event => {
        const category = categories.find(c => c.id === event.categoryId);
        return {
          ...event,
          categoryName: category?.name || 'Event',
          categoryColor: category?.color || t.accent2,
        };
      });
  }, [events, categories, currentTime, t.accent2]);

  // Stage cards = categories with their set counts.
  const stages = useMemo(() => {
    if (!categories) return [];
    return categories.map(c => ({
      ...c,
      count: events ? events.filter(e => e.categoryId === c.id).length : 0,
    }));
  }, [categories, events]);

  const handleEventPress = useCallback((event) => {
    navigation.navigate('EventDetail', { event });
  }, [navigation]);

  const handlePostPress = useCallback((post) => {
    navigation.navigate('BlogPost', { postId: post.id, title: post.title });
  }, [navigation]);

  const navigateToTab = useCallback((tabName) => {
    navigation.getParent()?.navigate(tabName);
  }, [navigation]);

  // Resolve the ribbon: live first, then up-next.
  const nowEvent = happeningNowEvents[0];
  const nextEvent = upNextEvents[0];
  const ribbon = nowEvent
    ? { event: nowEvent, label: `NOW ON ${(nowEvent.categoryName || '').toUpperCase()}` }
    : nextEvent
      ? { event: nextEvent, label: 'UP NEXT' }
      : null;

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <ThemeToggle variant="hero" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={t.accent2} />
        }
      >
        <Hero t={t} insets={insets} timing={timing} />

        {ribbon ? (
          <View style={hs.ribbonWrap}>
            <UpNext
              t={t}
              label={ribbon.label}
              title={ribbon.event.title}
              time={formatTime(ribbon.event.time)}
              endTime={ribbon.event.endTime ? formatTime(ribbon.event.endTime) : null}
              onPress={() => handleEventPress(ribbon.event)}
            />
          </View>
        ) : null}

        {/* Stages & Zones */}
        {stages.length > 0 && (
          <View style={hs.sectionGap}>
            <SectionTitle action="Full lineup" onAction={() => navigateToTab('Schedule')}>
              Stages &amp; Zones
            </SectionTitle>
            <View style={hs.stageGrid}>
              {stages.map(s => (
                <StageCard
                  key={s.id}
                  t={t}
                  stage={s}
                  count={s.count}
                  onPress={() => navigateToTab('Schedule')}
                />
              ))}
            </View>
          </View>
        )}

        {/* 3·6·9 feature strip */}
        <LinearGradient
          colors={[t.aubergine, t.cosmos2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[hs.feature, { borderColor: t.hairlineStrong }]}
        >
          <View style={[hs.featureGeo, { opacity: motif * 0.4 }]} pointerEvents="none">
            <Rings369 size={180} stroke={1} color={t.accent} />
          </View>
          <View style={hs.featureContent}>
            <Text style={[hs.featureNums, { color: t.accent }]}>3 · 6 · 9</Text>
            <Text style={[hs.featureText, { color: HERO_INK }]}>
              Three power days. The hidden geometry of the gathering — opening, solstice, and closing
              aligned to the pyramid of Rtanj.
            </Text>
          </View>
        </LinearGradient>

        {/* From the Village */}
        {blogPosts && blogPosts.length > 0 && (
          <View style={hs.sectionGap}>
            <SectionTitle>From the Village</SectionTitle>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={hs.newsRow}
            >
              {blogPosts.map(post => (
                <NewsCard key={post.id} t={t} post={post} onPress={() => handlePostPress(post)} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Footer */}
        <View style={hs.footer}>
          <PyramidMark size={26} stroke={1.4} color={t.ink2} />
          <Text style={[hs.footerLead, { color: t.ink2 }]}>Experience the energy of the Pyramid</Text>
          <Text style={[hs.footerPlace, { color: t.ink3 }]}>{FESTIVAL.place}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 90 },
});

const hs = StyleSheet.create({
  // Hero
  hero: {
    position: 'relative',
    overflow: 'hidden',
    // Height follows content: tall when the full gates-open countdown shows,
    // compact in the live/"see you next year" states (no dead space below CTAs).
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  geoTopRight: { position: 'absolute', top: -70, right: -70 },
  geoBottomLeft: { position: 'absolute', bottom: -40, left: -50 },
  heroInner: { position: 'relative', paddingHorizontal: 22, paddingTop: 14, paddingBottom: 30, zIndex: 2 },
  heroEyebrow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  eyebrowText: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase' },
  heroTitle: { fontFamily: fonts.display, fontSize: 44, lineHeight: 48, letterSpacing: -1 },
  heroTitleAccent: { marginBottom: 16 },
  heroMeta: { gap: 4, marginBottom: 22 },
  heroDate: { fontFamily: fonts.bodyBold, fontSize: 14 },
  heroPlace: { flexDirection: 'row', alignItems: 'center', gap: 5, opacity: 0.85 },
  heroPlaceText: { fontFamily: fonts.body, fontSize: 12.5 },

  // Countdown
  countdown: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: radius.md,
    marginBottom: 18,
  },
  cdScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(12,10,28,0.34)' },
  cdContent: { paddingVertical: 14, paddingHorizontal: 16 },
  cdGatesLabel: { fontFamily: fonts.bodyBold, fontSize: 10.5, letterSpacing: 2.3, textTransform: 'uppercase', opacity: 0.7 },
  cdRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 8 },
  cdUnit: { alignItems: 'center', minWidth: 44 },
  cdValue: { fontFamily: fonts.display, fontSize: 30, lineHeight: 30, fontVariant: ['tabular-nums'] },
  cdLabel: { fontFamily: fonts.body, fontSize: 9.5, letterSpacing: 1.7, textTransform: 'uppercase', opacity: 0.62, marginTop: 5 },
  cdSep: { fontFamily: fonts.displayBold, fontSize: 26, opacity: 0.4, lineHeight: 30 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  liveDot: { width: 9, height: 9, borderRadius: 999 },
  liveText: { fontFamily: fonts.bodyBold, fontSize: 16 },

  // CTAs
  heroCtas: { flexDirection: 'row', gap: 10 },
  ctaPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: radius.pill,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  ctaPrimaryText: { fontFamily: fonts.bodyExtra, fontSize: 15 },
  ctaGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(247,243,234,0.10)',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  ctaGhostText: { fontFamily: fonts.bodyBold, fontSize: 14 },

  // Up next ribbon
  ribbonWrap: { paddingHorizontal: 20, paddingTop: 18 },
  upNext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  upNextPulse: { width: 8, height: 8, borderRadius: 999 },
  upNextBody: { flex: 1 },
  upNextKicker: { fontFamily: fonts.bodyExtra, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase' },
  upNextTitle: { fontFamily: fonts.bodyBold, fontSize: 15, marginTop: 2 },
  upNextTimeWrap: { alignItems: 'flex-end' },
  upNextTime: { fontFamily: fonts.bodyExtra, fontSize: 14, fontVariant: ['tabular-nums'] },
  upNextTimeEnd: { fontFamily: fonts.bodySemi, fontSize: 12, marginTop: 1 },

  // Sections
  sectionGap: { marginTop: 26 },

  // Stage grid
  stageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20 },
  stageCard: {
    position: 'relative',
    overflow: 'hidden',
    width: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingTop: 16,
    paddingHorizontal: 15,
    paddingBottom: 18,
    minHeight: 104,
  },
  stageGeo: { position: 'absolute', top: -22, right: -22 },
  stageDot: { width: 10, height: 10, borderRadius: 999, marginBottom: 14 },
  stageName: { fontFamily: fonts.display, fontSize: 22, letterSpacing: -0.2 },
  stageKind: { fontFamily: fonts.bodySemi, fontSize: 11.5, marginTop: 4 },

  // 3·6·9 feature
  feature: {
    position: 'relative',
    overflow: 'hidden',
    marginTop: 26,
    marginHorizontal: 20,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: 26,
    paddingHorizontal: 22,
  },
  featureGeo: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  featureContent: { alignItems: 'center' },
  featureNums: { fontFamily: fonts.display, fontSize: 38, letterSpacing: 1.5 },
  featureText: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 21.5, textAlign: 'center', opacity: 0.82, marginTop: 10, maxWidth: 280 },

  // News
  newsRow: { gap: 14, paddingHorizontal: 20, paddingBottom: 4 },
  newsCard: { width: 220, borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  newsImage: { width: '100%', height: 116 },
  newsBody: { paddingTop: 12, paddingHorizontal: 14, paddingBottom: 15 },
  newsKicker: { fontFamily: fonts.bodyExtra, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase' },
  newsTitle: { fontFamily: fonts.bodyBold, fontSize: 14.5, lineHeight: 19, marginTop: 6, marginBottom: 8 },
  newsDate: { fontFamily: fonts.body, fontSize: 11 },

  // Footer
  footer: { alignItems: 'center', paddingTop: 34, paddingHorizontal: 20, paddingBottom: 10 },
  footerLead: { fontFamily: fonts.bodyMed, fontSize: 13, marginTop: 8 },
  footerPlace: { fontFamily: fonts.body, fontSize: 11, marginTop: 4, opacity: 0.85 },
});
