/**
 * HomeScreen — Pyramid Festival landing (SOVRA Edition redesign)
 * Hero countdown + up-next ribbon + stages grid + village news.
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
import { fonts, radius, motif, brand } from '../theme/tokens';
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
  getFestivalDays,
  formatDateRange,
  formatEndsIn,
} from '../utils/dateHelpers';
import { TIMELINE_ID, GATES_OPEN } from '../utils/constants';
import { itemNoun } from '../utils/categoryKind';

const HERO_INK = '#F7F3EA';
const FESTIVAL = {
  edition: 'SOVRA EDITION',
  dateLabel: 'Dates coming soon',
  place: 'Pyramid Village · Rtanj Mountain, Serbia',
  // TODO: paste real destinations. Empty string = friendly "coming soon" note.
  ticketUrl: 'https://pyramidfestival.com/tickets/',
  filmUrl: 'https://www.youtube.com/watch?v=42COXoz1Slk', // last edition's aftermovie
  // Gates open the day before the programme starts — authoritative, not derived
  // from the schedule. Single source of truth in constants (GATES_OPEN).
  gatesOpen: GATES_OPEN,
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
    const dates = events && events.length ? getFestivalDays(events) : [];
    if (!dates.length) return { hasDates: false, startMs: 0, live: false, past: false, dateLabel: '' };

    const last = dates[dates.length - 1];

    // Gates open is authoritative from config (day before the programme). Fall
    // back to the earliest set on the first day only if it isn't configured.
    let start;
    if (FESTIVAL.gatesOpen) {
      start = new Date(FESTIVAL.gatesOpen);
    } else {
      const first = dates[0];
      const firstDayTimes = events
        .filter(e => e.time && isSameDay(parseDate(e.date), first))
        .map(e => e.time)
        .sort();
      start = new Date(first);
      const [gh, gm] = (firstDayTimes[0] || '10:00').split(':').map(Number);
      start.setHours(gh, gm, 0, 0);
    }

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

        {/* Countdown card — only before/after the festival. While it's live we
            hide this entirely (the live sets show below); TODO revisit the live
            hero treatment. */}
        {!showLive && (
          <View style={[hs.countdown, { borderColor: 'rgba(247,243,234,0.16)' }]}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={hs.cdScrim} />
            <View style={hs.cdContent}>
              {showPast ? (
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
        )}

        {/* CTAs — only in the run-up to the festival. Next-year ticket sales and
            the aftermovie both land months later, so once the gathering is live
            (or over) this section is hidden; a new app version re-enables it for
            the next edition's countdown. */}
        {!showLive && !showPast && (
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
              onPress={() => openExternal(FESTIVAL.filmUrl, { title: 'Festival film', message: 'The teaser is on its way — check back soon.' })}
            >
              <Text style={[hs.ctaGhostText, { color: HERO_INK }]} numberOfLines={1}>Watch film</Text>
            </TouchableOpacity>
          </View>
        )}
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

// "Happening now" strip — lists ALL sets currently on, across stages.
function LiveStrip({ t, events, now, onPress }) {
  return (
    <View>
      <View style={hs.liveHead}>
        <View style={[hs.liveHeadDot, { backgroundColor: t.hot }]} />
        <Text style={[hs.liveHeadText, { color: t.hot }]}>HAPPENING NOW · {events.length}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={hs.liveRowStrip}>
        {events.map(e => (
          <TouchableOpacity
            key={e.id}
            style={[hs.liveCard, { backgroundColor: t.surface, borderColor: t.hairline, borderLeftColor: e.categoryColor }, t.cardShadow]}
            onPress={() => onPress(e)}
            activeOpacity={0.85}
          >
            <Text style={[hs.liveCat, { color: e.categoryColor }]} numberOfLines={1}>{e.categoryName.toUpperCase()}</Text>
            <Text style={[hs.liveTitle, { color: t.ink }]} numberOfLines={2}>{e.title}</Text>
            <Text style={[hs.liveEnds, { color: t.ink3 }]}>{formatEndsIn(e, now)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
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
      <Text style={[hs.stageName, { color: t.ink }]} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7}>{stage.name}</Text>
      <Text style={[hs.stageKind, { color: t.ink3 }]}>{count} {itemNoun(stage.name, count)}</Text>
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

  // Jump to the Lineup tab with a stage preselected. The `ts` nonce makes the
  // Schedule screen re-apply the filter even when the same stage is tapped twice.
  const navigateToStage = useCallback((categoryId) => {
    navigation.getParent()?.navigate('Schedule', {
      screen: 'ScheduleMain',
      params: { categoryId, ts: Date.now() },
    });
  }, [navigation]);

  const navigateToHealing = useCallback(() => {
    navigation.navigate('HealingTent');
  }, [navigation]);

  // Home ribbon: the LiveStrip (all sets on now) takes over when anything is
  // live; otherwise fall back to the next upcoming set.
  const nextEvent = upNextEvents[0];

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

        {happeningNowEvents.length ? (
          <View style={hs.liveWrap}>
            <LiveStrip t={t} events={happeningNowEvents} now={currentTime} onPress={handleEventPress} />
          </View>
        ) : nextEvent ? (
          <View style={hs.ribbonWrap}>
            <UpNext
              t={t}
              label="UP NEXT"
              title={nextEvent.title}
              time={formatTime(nextEvent.time)}
              endTime={nextEvent.endTime ? formatTime(nextEvent.endTime) : null}
              onPress={() => handleEventPress(nextEvent)}
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
                  onPress={() => navigateToStage(s.id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Healing Zone — drop-in therapies (not a stage; its own screen) */}
        <View style={hs.sectionGap}>
          <SectionTitle>Wellness</SectionTitle>
          <TouchableOpacity
            style={[hs.healing, hs.healingGlow]}
            onPress={navigateToHealing}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[brand.tealBright, brand.teal]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={hs.healingGeo} pointerEvents="none">
              <SeedOfLife size={132} stroke={1.2} color={HERO_INK} />
            </View>
            <View style={hs.healingBody}>
              <Text style={hs.healingKicker}>HEALING ZONE</Text>
              <Text style={hs.healingTitle}>Rest &amp; repair</Text>
              <Text style={hs.healingText} numberOfLines={2}>
                Drop-in bodywork, energy work and therapies — no schedule, just come by.
              </Text>
            </View>
            <IconArrow size={20} color={HERO_INK} />
          </TouchableOpacity>
        </View>

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

        {/* Footer — a designed close for the page, motif filling the base */}
        <View style={hs.footer}>
          <View style={[hs.footerGeo, { opacity: motif * 0.5 }]} pointerEvents="none">
            <SeedOfLife size={280} stroke={1} color={t.accent2} />
          </View>
          <PyramidMark size={30} color={t.accent} />
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
  cdRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 6 },
  cdUnit: { alignItems: 'center', minWidth: 44 },
  // lineHeight > fontSize gives the display glyphs headroom so tall numerals
  // aren't clipped at the top of their line box.
  cdValue: { fontFamily: fonts.display, fontSize: 30, lineHeight: 38, fontVariant: ['tabular-nums'] },
  cdLabel: { fontFamily: fonts.body, fontSize: 9.5, letterSpacing: 1.7, textTransform: 'uppercase', opacity: 0.62, marginTop: 2 },
  cdSep: { fontFamily: fonts.displayBold, fontSize: 26, opacity: 0.4, lineHeight: 38 },
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

  // Live "happening now" strip
  liveWrap: { paddingTop: 18 },
  liveHead: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginBottom: 10 },
  liveHeadDot: { width: 8, height: 8, borderRadius: 999 },
  liveHeadText: { fontFamily: fonts.bodyExtra, fontSize: 10, letterSpacing: 1.6 },
  liveRowStrip: { gap: 12, paddingHorizontal: 20, paddingBottom: 4 },
  liveCard: { width: 220, borderWidth: 1, borderLeftWidth: 3, borderRadius: radius.md, paddingVertical: 13, paddingHorizontal: 15 },
  liveCat: { fontFamily: fonts.bodyExtra, fontSize: 10, letterSpacing: 1.4 },
  liveTitle: { fontFamily: fonts.bodyBold, fontSize: 15, marginTop: 4 },
  liveEnds: { fontFamily: fonts.body, fontSize: 12, marginTop: 6 },

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

  // Healing Zone card — teal gradient fill + glow so it stands apart from the
  // plain stage cards.
  healing: {
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 20,
    borderRadius: radius.lg,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  healingGlow: {
    shadowColor: brand.tealBright,
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 9,
  },
  healingGeo: { position: 'absolute', top: -30, right: -24, opacity: 0.28 },
  healingBody: { flex: 1 },
  healingKicker: { fontFamily: fonts.bodyExtra, fontSize: 10.5, letterSpacing: 1.8, textTransform: 'uppercase', color: HERO_INK, opacity: 0.9 },
  healingTitle: { fontFamily: fonts.display, fontSize: 22, letterSpacing: -0.2, marginTop: 3, color: HERO_INK },
  healingText: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18, marginTop: 5, color: HERO_INK, opacity: 0.88 },

  // News
  newsRow: { gap: 14, paddingHorizontal: 20, paddingBottom: 4 },
  newsCard: { width: 220, borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  newsImage: { width: '100%', height: 116 },
  newsBody: { paddingTop: 12, paddingHorizontal: 14, paddingBottom: 15 },
  newsKicker: { fontFamily: fonts.bodyExtra, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase' },
  newsTitle: { fontFamily: fonts.bodyBold, fontSize: 14.5, lineHeight: 19, marginTop: 6, marginBottom: 8 },
  newsDate: { fontFamily: fonts.body, fontSize: 11 },

  // Footer
  footer: { position: 'relative', overflow: 'hidden', alignItems: 'center', paddingTop: 48, paddingHorizontal: 20, paddingBottom: 40 },
  footerGeo: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  footerLead: { fontFamily: fonts.bodyMed, fontSize: 13, marginTop: 10 },
  footerPlace: { fontFamily: fonts.body, fontSize: 11, marginTop: 4, opacity: 0.85 },
});
