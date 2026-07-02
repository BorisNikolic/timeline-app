/**
 * PyramidTabBar — custom frosted bottom tab bar matching the design.
 * Dark/light blurred surface, accent active colour + dot indicator, stroke icons.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { fonts } from '../theme/tokens';
import { IconHome, IconCal, IconMap, IconInfo, IconUser } from '../components/ui/Icons';

const TABS = {
  Home: { label: 'Home', Icon: IconHome },
  Schedule: { label: 'Lineup', Icon: IconCal },
  Map: { label: 'Map', Icon: IconMap },
  Info: { label: 'Info', Icon: IconInfo },
  MyEvents: { label: 'My Plan', Icon: IconUser },
};

export default function PyramidTabBar({ state, navigation }) {
  const { t, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const tint = mode === 'dark' ? 'rgba(20,18,46,0.72)' : 'rgba(236,227,210,0.72)';

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom, borderTopColor: t.hairline }]}>
      <BlurView intensity={28} tint={t.blurTint} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: tint }]} />
      <View style={styles.row}>
        {state.routes.map((route, idx) => {
          const meta = TABS[route.name];
          if (!meta) return null;
          const focused = state.index === idx;
          const color = focused ? t.accent : t.ink3;
          const Icon = meta.Icon;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tab}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.label}
            >
              {focused && <View style={[styles.dot, { backgroundColor: t.accent }]} />}
              <Icon size={23} stroke={focused ? 2.1 : 1.8} color={color} />
              <Text style={[styles.label, { color, fontFamily: focused ? fonts.bodyBold : fonts.bodySemi }]}>
                {meta.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderTopWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 2, paddingBottom: 6 },
  dot: { position: 'absolute', top: -2, width: 4, height: 4, borderRadius: 999 },
  label: { fontSize: 10, letterSpacing: 0.2 },
});
