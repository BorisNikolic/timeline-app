/**
 * MapScreen - Festival map with pinch-zoom, pan, and rotation toggle
 */

import React, { useRef, useState } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
  Animated,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {
  PinchGestureHandler,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../contexts/ThemeContext';
import { fonts } from '../theme/tokens';
import { Rings369 } from '../components/geometry/Geometry';
import { ThemeToggle } from '../components/ui/ThemeToggle';

// Map is loaded from GitHub Pages so it can be swapped without an app release —
// just replace frontend/public/festival-map.png (keep 16:9) and push to main.
// Falls back to the bundled copy when offline / the host is unreachable; RN
// caches the remote image to disk, so it stays available after the first load.
const REMOTE_MAP_URL = 'https://borisnikolic.github.io/timeline-app/festival-map.png';
const BUNDLED_MAP = require('../../assets/festival-map.png');
const MAP_ASPECT_RATIO = 1920 / 1080;
const TAB_BAR_HEIGHT = 60;
const MIN_SCALE = 1;
const MAX_SCALE = 5;

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [isRotated, setIsRotated] = useState(true);
  const [mapSource, setMapSource] = useState({ uri: REMOTE_MAP_URL });
  const [loading, setLoading] = useState(true);

  const availableWidth = screenWidth;
  const availableHeight = screenHeight - insets.top - insets.bottom - TAB_BAR_HEIGHT;

  // Content box the map renders into (centered), before pan/zoom.
  // Portrait (rotated): CONTAIN the whole map — fully visible, behaves best.
  // Landscape: fill the viewport HEIGHT and overflow width, so there are no empty
  // bands top/bottom; you pan side-to-side to reach the edges.
  let visualWidth, visualHeight;
  if (isRotated) {
    const rAspect = 1 / MAP_ASPECT_RATIO; // rotated map is portrait-shaped (w/h)
    if (availableWidth / availableHeight < rAspect) {
      visualWidth = availableWidth;
      visualHeight = availableWidth / rAspect;
    } else {
      visualHeight = availableHeight;
      visualWidth = availableHeight * rAspect;
    }
  } else {
    visualHeight = availableHeight;
    visualWidth = availableHeight * MAP_ASPECT_RATIO;
  }

  const imageBoxWidth = isRotated ? visualHeight : visualWidth;
  const imageBoxHeight = isRotated ? visualWidth : visualHeight;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const currentScale = useRef(1);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const currentX = useRef(0);
  const currentY = useRef(0);

  const pinchRef = useRef(null);
  const panRef = useRef(null);

  const clampScale = (s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

  // Max the map may be panned before an edge would pull inside the viewport:
  // half of how much the scaled content exceeds the viewport in each axis. 0 when
  // the content is smaller than the viewport there → panning locked in that axis.
  const clamp = (v, max) => Math.min(max, Math.max(-max, v));
  const panBounds = (s) => ({
    x: Math.max(0, (visualWidth * s - availableWidth) / 2),
    y: Math.max(0, (visualHeight * s - availableHeight) / 2),
  });

  // Let a drag pull slightly past the bounds with resistance, then spring back on
  // release — so the map always settles fitted/centred and can never be stranded.
  const RUBBER = 0.4;
  const rubber = (v, max) => (v > max ? max + (v - max) * RUBBER : v < -max ? -max + (v + max) * RUBBER : v);
  const springBack = (x, y) => Animated.parallel([
    Animated.spring(translateX, { toValue: x, useNativeDriver: true, friction: 8, tension: 65 }),
    Animated.spring(translateY, { toValue: y, useNativeDriver: true, friction: 8, tension: 65 }),
  ]).start();

  const resetTransforms = () => {
    currentScale.current = 1;
    currentX.current = 0;
    currentY.current = 0;
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  };

  const toggleRotation = () => {
    setIsRotated((prev) => !prev);
    resetTransforms();
  };

  const onPinchEvent = (e) => {
    scaleAnim.setValue(clampScale(currentScale.current * e.nativeEvent.scale));
  };

  const onPinchStateChange = (e) => {
    if (e.nativeEvent.oldState === State.ACTIVE) {
      let s = clampScale(currentScale.current * e.nativeEvent.scale);
      // Snap fully back to fit when zoomed out to (near) the minimum, so the map
      // always lands perfectly fitted — never a lingering part-zoom.
      if (s <= MIN_SCALE * 1.04) s = MIN_SCALE;
      currentScale.current = s;
      Animated.spring(scaleAnim, { toValue: s, useNativeDriver: true, friction: 8, tension: 65 }).start();
      // Pull any overshoot back inside the new (smaller) bounds and recentre.
      const b = panBounds(s);
      currentX.current = clamp(currentX.current, b.x);
      currentY.current = clamp(currentY.current, b.y);
      springBack(currentX.current, currentY.current);
    }
  };

  const onPanEvent = (e) => {
    const b = panBounds(currentScale.current);
    translateX.setValue(rubber(currentX.current + e.nativeEvent.translationX, b.x));
    translateY.setValue(rubber(currentY.current + e.nativeEvent.translationY, b.y));
  };

  const onPanStateChange = (e) => {
    if (e.nativeEvent.oldState === State.ACTIVE) {
      const b = panBounds(currentScale.current);
      currentX.current = clamp(currentX.current + e.nativeEvent.translationX, b.x);
      currentY.current = clamp(currentY.current + e.nativeEvent.translationY, b.y);
      springBack(currentX.current, currentY.current);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <PinchGestureHandler
        ref={pinchRef}
        simultaneousHandlers={panRef}
        onGestureEvent={onPinchEvent}
        onHandlerStateChange={onPinchStateChange}
      >
        <Animated.View style={[styles.flexCenter, { paddingTop: insets.top }]}>
          <PanGestureHandler
            ref={panRef}
            simultaneousHandlers={pinchRef}
            onGestureEvent={onPanEvent}
            onHandlerStateChange={onPanStateChange}
            minPointers={1}
            maxPointers={2}
          >
            <Animated.View
              style={{
                width: visualWidth,
                height: visualHeight,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                transform: [
                  { translateX },
                  { translateY },
                  { scale: scaleAnim },
                ],
              }}
            >
              <Image
                source={mapSource}
                // On web, react-native-web re-fires onLoadStart on every
                // re-render (pan/zoom), which made the spinner flicker over an
                // already-visible map. Native keeps the original behavior.
                onLoadStart={Platform.OS === 'web' ? undefined : () => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => setMapSource(BUNDLED_MAP)}
                style={{
                  width: imageBoxWidth,
                  height: imageBoxHeight,
                  transform: [{ rotate: isRotated ? '90deg' : '0deg' }],
                }}
                resizeMode="contain"
              />
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </PinchGestureHandler>

      {loading && (
        <View pointerEvents="none" style={styles.loader}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      )}

      {/* Floating decorative header — out of the way of gestures */}
      <View
        pointerEvents="none"
        style={[styles.header, { top: insets.top + 8 }]}
      >
        <View style={styles.rings}>
          <Rings369 size={92} color={t.accent} />
        </View>
        <Text style={[styles.eyebrow, { color: t.accent }]}>FESTIVAL MAP</Text>
      </View>

      <ThemeToggle variant="auto" />

      <TouchableOpacity
        style={[styles.fab, t.glow, { bottom: insets.bottom + 24, backgroundColor: t.accent }]}
        onPress={toggleRotation}
        activeOpacity={0.85}
        accessibilityLabel="Toggle map rotation"
        accessibilityRole="button"
      >
        <Ionicons
          name={isRotated ? 'phone-portrait-outline' : 'phone-landscape-outline'}
          size={24}
          color={t.onAccent}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flexCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    left: 18,
    zIndex: 20,
  },
  rings: {
    position: 'absolute',
    left: -24,
    top: -26,
    opacity: 0.18,
  },
  eyebrow: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    letterSpacing: 2.4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 9,
  },
});
