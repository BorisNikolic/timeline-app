/**
 * InfoScreen — "Know Before You Go" essentials, redesigned on the Pyramid theme.
 * Static festival facts + accordion sections sourced from ../data/festivalInfo.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { fonts, radius } from '../theme/tokens';
import { InfoIcon, IconChevron } from '../components/ui/Icons';
import { PyramidMark, Rings369 } from '../components/geometry/Geometry';
import ThemeToggle from '../components/ui/ThemeToggle';
import { festivalSections } from '../data/festivalInfo';
import { useTimelineEvents } from '../hooks/useEvents';
import { getUniqueDates, formatTime } from '../utils/dateHelpers';
import { TIMELINE_ID, GATES_OPEN } from '../utils/constants';

// Enable LayoutAnimation on Android.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PLACE = 'Pyramid Village · Rtanj Mountain, Serbia';
const CONTACT_EMAIL = 'info@pyramidfestival.com';
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Compact festival range for the quick-fact card, e.g. "23–26 Jan 2026".
function compactRange(dates) {
  const a = dates[0];
  const b = dates[dates.length - 1];
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()}–${b.getDate()} ${MON[a.getMonth()]} ${a.getFullYear()}`;
  }
  return `${a.getDate()} ${MON[a.getMonth()]} – ${b.getDate()} ${MON[b.getMonth()]}`;
}

// Map the data's Ionicons names to our stroke InfoIcon names.
const ICON_MAP = {
  star: 'star',
  car: 'car',
  'musical-notes': 'music',
  restaurant: 'food',
  medkit: 'health',
  'shield-checkmark': 'shield',
  leaf: 'leaf',
  'help-circle': 'help',
};

function QuickFact({ fact, t }) {
  return (
    <View style={[styles.fact, { backgroundColor: t.surface, borderColor: t.hairline }, t.cardShadow]}>
      <View style={[styles.factIcon, { backgroundColor: t.accent + '24' }]}>
        <InfoIcon name={fact.icon} size={18} color={t.accent} />
      </View>
      <View style={styles.factText}>
        <Text style={[styles.factLabel, { color: t.ink3 }]}>{fact.label.toUpperCase()}</Text>
        <Text style={[styles.factValue, { color: t.ink }]} numberOfLines={1} adjustsFontSizeToFit>{fact.value}</Text>
      </View>
    </View>
  );
}

function Accordion({ section, open, onToggle, t }) {
  return (
    <View
      style={[
        styles.acc,
        { backgroundColor: t.surface, borderColor: open ? t.hairlineStrong : t.hairline },
        t.cardShadow,
      ]}
    >
      <TouchableOpacity style={styles.accHead} onPress={onToggle} activeOpacity={0.75}>
        <InfoIcon name={ICON_MAP[section.icon] || 'help'} size={20} color={t.accent2} />
        <Text style={[styles.accTitle, { color: t.ink }]}>{section.title}</Text>
        <View style={open ? styles.chevOpen : styles.chevClosed}>
          <IconChevron size={18} color={t.ink3} />
        </View>
      </TouchableOpacity>

      {open && (
        <View style={styles.accBody}>
          {(section.content || []).map((p, i) => (
            <Text key={i} style={[styles.para, { color: t.ink2 }]}>{p}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

export default function InfoScreen() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const [openId, setOpenId] = useState(festivalSections[0]?.id ?? null);
  const { data: events } = useTimelineEvents(TIMELINE_ID);

  // Quick facts — programme dates from the live schedule; gates from the
  // authoritative GATES_OPEN (the day before, not the first set).
  const quickFacts = useMemo(() => {
    const dates = events && events.length ? getUniqueDates(events) : [];
    const datesVal = dates.length ? compactRange(dates) : 'Coming soon';
    const g = new Date(GATES_OPEN);
    const gTime = `${String(g.getHours()).padStart(2, '0')}:${String(g.getMinutes()).padStart(2, '0')}`;
    const gatesVal = `${MON[g.getMonth()]} ${g.getDate()} · ${formatTime(gTime)}`;
    return [
      { icon: 'cal', label: 'Dates', value: datesVal },
      { icon: 'pin', label: 'Where', value: 'Rtanj, Serbia' },
      { icon: 'gate', label: 'Gates', value: gatesVal },
      { icon: 'card', label: 'Payments', value: 'Cashless' },
    ];
  }, [events]);

  const toggle = useCallback((id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId(prev => (prev === id ? null : id));
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <ThemeToggle variant="auto" />

      <View
        style={[
          styles.header,
          { backgroundColor: t.bg2, borderBottomColor: t.hairline, paddingTop: insets.top + 12 },
        ]}
      >
        <View style={styles.headerRings}>
          <Rings369 size={150} stroke={1} color={t.accent} />
        </View>
        <Text style={[styles.eyebrow, { color: t.accent }]}>SOVRA EDITION · ESSENTIALS</Text>
        <Text style={[styles.h1, { color: t.ink }]}>Know Before{'\n'}You Go</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.facts}>
          {quickFacts.map(f => (
            <QuickFact key={f.label} fact={f} t={t} />
          ))}
        </View>

        <View style={styles.accList}>
          {festivalSections.map(section => (
            <Accordion
              key={section.id}
              section={section}
              open={openId === section.id}
              onToggle={() => toggle(section.id)}
              t={t}
            />
          ))}
        </View>

        <View style={styles.contact}>
          <PyramidMark size={28} stroke={1.4} color={t.ink} />
          <Text style={[styles.contactTitle, { color: t.ink }]}>Still need a hand?</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)} activeOpacity={0.7}>
            <Text style={[styles.contactMail, { color: t.accent2 }]}>{CONTACT_EMAIL}</Text>
          </TouchableOpacity>
          <Text style={[styles.contactPlace, { color: t.ink3 }]}>{PLACE}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingRight: 60,
    paddingBottom: 18,
  },
  headerRings: { position: 'absolute', top: -50, right: -44, opacity: 0.22 },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 2.4 },
  h1: { fontFamily: fonts.display, fontSize: 30, lineHeight: 31, marginTop: 6 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 90 },

  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 22 },
  fact: {
    width: '47.5%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 13,
  },
  factIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factText: { flex: 1 },
  factLabel: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 0.8 },
  factValue: { fontFamily: fonts.bodyBold, fontSize: 14, marginTop: 2 },

  accList: { gap: 10 },
  acc: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  accHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15 },
  accTitle: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 15.5 },
  chevClosed: { transform: [{ rotate: '0deg' }] },
  chevOpen: { transform: [{ rotate: '180deg' }] },
  accBody: { paddingLeft: 51, paddingRight: 16, paddingBottom: 16 },
  para: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 22, marginBottom: 10 },

  contact: { alignItems: 'center', paddingTop: 30, paddingBottom: 12 },
  contactTitle: { fontFamily: fonts.displayBold, fontSize: 17, marginTop: 12 },
  contactMail: { fontFamily: fonts.bodyBold, fontSize: 14, marginTop: 8 },
  contactPlace: { fontFamily: fonts.body, fontSize: 11.5, marginTop: 8, textAlign: 'center' },
});
