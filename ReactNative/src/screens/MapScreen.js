/**
 * MapScreen - Festival map with pinch-zoom, pan, and rotation toggle
 */

import React, { useRef, useState } from 'react';
import {
  Image,
  StyleSheet,
  View,
  Animated,
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

import { colors } from '../theme/colors';
import { spacing, shadows } from '../theme/spacing';

const MAP_SOURCE = require('../../assets/festival-map.png');
const MAP_ASPECT_RATIO = 1920 / 1080;
const TAB_BAR_HEIGHT = 60;
const MIN_SCALE = 1;
const MAX_SCALE = 5;

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [isRotated, setIsRotated] = useState(true);

  const availableWidth = screenWidth;
  const availableHeight = screenHeight - insets.top - insets.bottom - TAB_BAR_HEIGHT;

  const aspect = isRotated ? 1 / MAP_ASPECT_RATIO : MAP_ASPECT_RATIO;
  const widthIfFitToHeight = availableHeight * aspect;
  const heightIfFitToWidth = availableWidth / aspect;
  const fitToWidth = heightIfFitToWidth <= availableHeight;
  const visualWidth = fitToWidth ? availableWidth : widthIfFitToHeight;
  const visualHeight = fitToWidth ? heightIfFitToWidth : availableHeight;

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
      currentScale.current = clampScale(currentScale.current * e.nativeEvent.scale);
      if (currentScale.current === MIN_SCALE) {
        currentX.current = 0;
        currentY.current = 0;
        Animated.parallel([
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
        ]).start();
      }
    }
  };

  const onPanEvent = (e) => {
    translateX.setValue(currentX.current + e.nativeEvent.translationX);
    translateY.setValue(currentY.current + e.nativeEvent.translationY);
  };

  const onPanStateChange = (e) => {
    if (e.nativeEvent.oldState === State.ACTIVE) {
      currentX.current += e.nativeEvent.translationX;
      currentY.current += e.nativeEvent.translationY;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <PinchGestureHandler
        ref={pinchRef}
        simultaneousHandlers={panRef}
        onGestureEvent={onPinchEvent}
        onHandlerStateChange={onPinchStateChange}
      >
        <Animated.View style={styles.flexCenter}>
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
                source={MAP_SOURCE}
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

      <TouchableOpacity
        style={styles.fab}
        onPress={toggleRotation}
        activeOpacity={0.85}
        accessibilityLabel="Toggle map rotation"
        accessibilityRole="button"
      >
        <Ionicons
          name={isRotated ? 'phone-portrait-outline' : 'phone-landscape-outline'}
          size={24}
          color={colors.text.inverse}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navyDark,
  },
  flexCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    elevation: 6,
  },
});
