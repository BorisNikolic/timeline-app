/**
 * DownloadAppBanner (web only) — a slim, always-visible bar at the top of the
 * mobile web build inviting visitors to install the native app. Detects the
 * visitor's OS from the user agent and points the button at the right store:
 *   - iOS      → App Store
 *   - Android  → Google Play (placeholder until the listing is public)
 *   - desktop  → both buttons, so the visitor can pick
 *
 * Web-only by construction: the native counterpart (DownloadAppBanner.js)
 * renders null, so iOS / Android are untouched.
 */

import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../contexts/ThemeContext';
import { fonts, radius } from '../theme/tokens';

const IOS_URL = 'https://apps.apple.com/au/app/pyramid-festival/id6788460623';
// TODO(android): Play Store listing not public yet — placeholder pointing at the
// final package id, so this becomes the real link once the app is published.
const ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.pyramidfestival.app';
const APP_ICON = require('../../assets/icon.png');

function detectOS() {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  // iPadOS 13+ reports as "Macintosh" but exposes touch points.
  if (/Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1) return 'ios';
  return 'other';
}

// A real <a> anchor (web-only file) — no popup-blocker risk, proper
// open-in-new-tab / long-press semantics, unlike a scripted window.open.
function StoreButton({ t, label, url, outline }) {
  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    padding: '0 18px',
    borderRadius: 999,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    color: outline ? t.accent : t.onAccent,
    background: outline ? 'transparent' : t.accent,
    border: `1.5px solid ${outline ? t.accent : 'transparent'}`,
    boxShadow: outline ? 'none' : '0 6px 18px rgba(233,160,53,0.35)',
  };
  return React.createElement(
    'a',
    {
      href: url,
      target: '_blank',
      rel: 'noopener noreferrer',
      style,
      'aria-label': `Download the app${label ? ' for ' + label : ''}`,
    },
    label
  );
}

export default function DownloadAppBanner() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const os = useMemo(detectOS, []);

  return (
    <View
      style={[
        s.bar,
        { backgroundColor: t.surface, borderBottomColor: t.hairline, paddingTop: insets.top },
      ]}
    >
      <View style={s.inner}>
        <Image source={APP_ICON} style={[s.icon, { borderColor: t.hairline }]} />
        <View style={s.copy}>
          <Text style={[s.title, { color: t.ink }]} numberOfLines={1}>
            Get the Pyramid Festival app
          </Text>
          <Text style={[s.sub, { color: t.ink3 }]} numberOfLines={1}>
            Offline schedule, reminders & map
          </Text>
        </View>
        <View style={s.actions}>
          {os === 'ios' && <StoreButton t={t} label="Download" url={IOS_URL} />}
          {os === 'android' && <StoreButton t={t} label="Download" url={ANDROID_URL} />}
          {os === 'other' && (
            <>
              <StoreButton t={t} label="iOS" url={IOS_URL} />
              <StoreButton t={t} label="Android" url={ANDROID_URL} outline />
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    width: '100%',
    borderBottomWidth: 1,
    zIndex: 100,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  copy: { flex: 1, minWidth: 0 },
  title: { fontFamily: fonts.bodyBold, fontSize: 14 },
  sub: { fontFamily: fonts.body, fontSize: 12, marginTop: 1 },
  actions: { flexDirection: 'row', gap: 8 },
});
