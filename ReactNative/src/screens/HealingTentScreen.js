/**
 * HealingTentScreen — informational directory for the Healing Tent (drop-in
 * therapies, no schedule). Pushed onto the Home and Info stacks; renders its
 * own back header (headerShown:false). Content is static — see ../data/healers.
 *
 * The photos are the designer's finished promo cards (name + method + branding
 * baked in), shown as a 4:5 gallery; tapping opens a card full-screen. The one
 * practitioner without a card is rendered as a themed text tile.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../contexts/ThemeContext';
import { fonts, radius, motif, brand } from '../theme/tokens';
import { Rings369, SeedOfLife } from '../components/geometry/Geometry';
import { IconChevronLeft } from '../components/ui/Icons';
import SectionTitle from '../components/ui/SectionTitle';
import { HEALING_ZONE, HEALERS } from '../data/healers';

const CARD_INK = '#F7F3EA';

function initials(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '·';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

// Themed 4:5 tile for a practitioner with no promo card yet — echoes the poster
// language (teal, HEALING ZONE eyebrow, centred name + method).
function TextTile({ healer }) {
  return (
    <View style={s.tile}>
      <LinearGradient
        colors={[brand.tealBright, brand.teal]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={s.tileGeo} pointerEvents="none">
        <SeedOfLife size={150} stroke={1.2} color={CARD_INK} />
      </View>
      <Text style={s.tileKicker}>HEALING ZONE</Text>
      <View style={s.tileAvatar}>
        <Text style={s.tileInitials}>{initials(healer.name)}</Text>
      </View>
      <Text style={s.tileName}>{healer.name}</Text>
      <Text style={s.tileMethod}>{healer.method}</Text>
    </View>
  );
}

function HealerCard({ healer, t, onPress }) {
  return (
    <TouchableOpacity
      style={[s.card, { borderColor: t.hairline }, t.cardShadow]}
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityLabel={`${healer.name}, ${healer.method}`}
    >
      {healer.photo
        ? <Image source={healer.photo} style={s.cardImg} resizeMode="cover" />
        : <TextTile healer={healer} />}
    </TouchableOpacity>
  );
}

// Full-screen detail for a tapped card: portrait + name + method + biography.
function Detail({ healer, t, insets, onClose }) {
  return (
    <Modal visible={!!healer} animationType="slide" onRequestClose={onClose}>
      <View style={[s.detail, { backgroundColor: t.bg }]}>
        <View style={[s.detailHeader, { paddingTop: insets.top + 8, backgroundColor: t.bg2, borderBottomColor: t.hairline }]}>
          <View style={s.detailHeaderMotif} pointerEvents="none">
            <Rings369 size={120} stroke={1} color={t.accent} />
          </View>
          <View style={s.detailHeaderRow}>
            <Text style={[s.detailEyebrow, { color: t.accent }]}>HEALING ZONE</Text>
            <TouchableOpacity
              style={[s.detailClose, { backgroundColor: t.surface, borderColor: t.hairlineStrong }]}
              onPress={onClose}
              hitSlop={8}
            >
              <Text style={[s.detailCloseX, { color: t.ink }]}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {healer && (
          <ScrollView
            contentContainerStyle={[s.detailContent, { paddingBottom: insets.bottom + 40 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={[s.portrait, { borderColor: t.hairline }, t.cardShadow]}>
              {healer.photo
                ? <Image source={healer.photo} style={s.portraitImg} resizeMode="cover" />
                : <TextTile healer={healer} />}
            </View>
            <Text style={[s.detailName, { color: t.ink }]}>{healer.name}</Text>
            <Text style={[s.detailMethod, { color: t.accent2 }]}>{healer.method}</Text>
            <View style={[s.detailDivider, { backgroundColor: t.hairline }]} />
            <Text style={[s.detailBio, { color: t.ink2 }]}>{healer.bio}</Text>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

export default function HealingTentScreen({ navigation }) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);

  const open = useCallback((healer) => setSelected(healer), []);
  const close = useCallback(() => setSelected(null), []);

  return (
    <View style={[s.container, { backgroundColor: t.bg }]}>
      {/* Own header (headerShown:false) */}
      <View style={[s.header, { paddingTop: insets.top + 8, backgroundColor: t.bg2, borderBottomColor: t.hairline }]}>
        <View style={s.headerMotif} pointerEvents="none">
          <Rings369 size={140} stroke={1} color={t.accent} />
        </View>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: t.surface, borderColor: t.hairlineStrong }]}
          onPress={() => navigation.goBack()}
          hitSlop={8}
        >
          <IconChevronLeft size={22} color={t.ink} />
        </TouchableOpacity>
        <Text style={[s.eyebrow, { color: t.accent }]}>{HEALING_ZONE.eyebrow}</Text>
        <Text style={[s.h1, { color: t.ink }]}>{HEALING_ZONE.title}</Text>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[s.lead, { color: t.ink2 }]}>{HEALING_ZONE.lead}</Text>

        {/* How-it-works note — sets the no-schedule expectation */}
        <View style={[s.note, { backgroundColor: t.surface, borderColor: t.hairline }, t.cardShadow]}>
          <View style={s.noteGeo} pointerEvents="none">
            <SeedOfLife size={120} stroke={1} color={t.accent2} />
          </View>
          <Text style={[s.noteLabel, { color: t.accent2 }]}>SEPARATE FROM HEALING DAYS · ADDITIONAL FEE</Text>
          <Text style={[s.noteText, { color: t.ink2 }]}>{HEALING_ZONE.note}</Text>
          {HEALING_ZONE.booking ? (
            <View style={[s.pricing, { borderTopColor: t.hairline }]}>
              <Text style={[s.pricingLabel, { color: t.accent }]}>BOOKING</Text>
              <Text style={[s.pricingText, { color: t.ink2 }]}>{HEALING_ZONE.booking}</Text>
            </View>
          ) : null}
        </View>

        {HEALERS.length > 0 && (
          <View style={s.listWrap}>
            <SectionTitle>The Healers</SectionTitle>
            <View style={s.grid}>
              {HEALERS.map(h => (
                <HealerCard key={h.id} healer={h} t={t} onPress={() => open(h)} />
              ))}
            </View>
          </View>
        )}

        {/* Themed close, mirroring the other screens */}
        <View style={s.footer}>
          <View style={[s.footerGeo, { opacity: motif * 0.5 }]} pointerEvents="none">
            <SeedOfLife size={210} stroke={1} color={t.accent2} />
          </View>
          <Text style={[s.footerText, { color: t.ink3 }]}>Rest · Repair · Return</Text>
        </View>
      </ScrollView>

      <Detail healer={selected} t={t} insets={insets} onClose={close} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },

  header: {
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingRight: 60,
    paddingBottom: 18,
    borderBottomWidth: 1,
  },
  headerMotif: { position: 'absolute', top: -54, right: -42, opacity: 0.22 },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: { marginTop: 12, fontFamily: fonts.bodyExtra, fontSize: 11, letterSpacing: 2.4 },
  h1: { fontFamily: fonts.display, fontSize: 30, lineHeight: 38, marginTop: 6 },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 90 },

  lead: { fontFamily: fonts.body, fontSize: 15, lineHeight: 24 },

  note: {
    position: 'relative',
    overflow: 'hidden',
    marginTop: 20,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  noteGeo: { position: 'absolute', top: -30, right: -30, opacity: motif * 0.9 },
  noteLabel: { fontFamily: fonts.bodyExtra, fontSize: 10.5, letterSpacing: 1.8 },
  noteText: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 21.5, marginTop: 8 },
  pricing: { marginTop: 14, paddingTop: 14, borderTopWidth: 1 },
  pricingLabel: { fontFamily: fonts.bodyExtra, fontSize: 10.5, letterSpacing: 1.8 },
  pricingText: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 21.5, marginTop: 8 },

  // Gallery grid
  listWrap: { marginTop: 28 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    aspectRatio: 4 / 5,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
  },
  cardImg: { width: '100%', height: '100%' },

  // Themed text tile (no-photo practitioner)
  tile: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', paddingHorizontal: 14 },
  tileGeo: { position: 'absolute', top: -20, right: -30, opacity: 0.24 },
  tileKicker: { position: 'absolute', top: 16, fontFamily: fonts.bodyExtra, fontSize: 9, letterSpacing: 1.8, color: CARD_INK, opacity: 0.9 },
  tileAvatar: {
    width: 66, height: 66, borderRadius: radius.pill,
    backgroundColor: 'rgba(247,243,234,0.16)',
    borderWidth: 1, borderColor: 'rgba(247,243,234,0.35)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  tileInitials: { fontFamily: fonts.display, fontSize: 24, color: CARD_INK },
  tileName: { fontFamily: fonts.display, fontSize: 17, lineHeight: 21, letterSpacing: -0.2, color: CARD_INK, textAlign: 'center' },
  tileMethod: { fontFamily: fonts.bodySemi, fontSize: 10.5, lineHeight: 15, color: CARD_INK, opacity: 0.85, textAlign: 'center', marginTop: 6 },

  // Full-screen detail
  detail: { flex: 1 },
  detailHeader: {
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  detailHeaderMotif: { position: 'absolute', top: -46, right: -38, opacity: 0.22 },
  detailHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  detailEyebrow: { fontFamily: fonts.bodyExtra, fontSize: 11, letterSpacing: 2.4 },
  detailClose: {
    width: 40, height: 40, borderRadius: radius.pill, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  detailCloseX: { fontFamily: fonts.bodyBold, fontSize: 16, marginTop: -1 },
  detailContent: { paddingHorizontal: 22, paddingTop: 24 },
  portrait: {
    width: '62%',
    alignSelf: 'center',
    aspectRatio: 4 / 5,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  portraitImg: { width: '100%', height: '100%' },
  detailName: { fontFamily: fonts.display, fontSize: 26, letterSpacing: -0.3, textAlign: 'center', marginTop: 22 },
  detailMethod: { fontFamily: fonts.bodyBold, fontSize: 13.5, textAlign: 'center', marginTop: 5 },
  detailDivider: { height: 1, marginVertical: 22 },
  detailBio: { fontFamily: fonts.body, fontSize: 15, lineHeight: 25 },

  footer: { position: 'relative', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', minHeight: 230, marginTop: 24 },
  footerGeo: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  footerText: { fontFamily: fonts.bodyMed, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
});
