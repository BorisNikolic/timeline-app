/**
 * SectionTitle — uppercase eyebrow with an optional "action ->" link on the right.
 * Mirrors the design's SectionTitle.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { fonts } from '../../theme/tokens';
import { IconArrow } from './Icons';

export function SectionTitle({ children, action, onAction }) {
  const { t } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.eyebrow, { color: t.ink3 }]} numberOfLines={1}>{children}</Text>
      {action ? (
        <TouchableOpacity onPress={onAction} style={styles.action} activeOpacity={0.7}>
          <Text style={[styles.actionText, { color: t.accent2 }]}>{action}</Text>
          <IconArrow size={14} color={t.accent2} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  actionText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
});

export default SectionTitle;
