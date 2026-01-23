/**
 * StageFilter - Horizontal scrollable filter chips for categories/stages
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

export default function StageFilter({
  categories = [],
  selectedCategoryId,
  onCategorySelect,
}) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* All stages chip */}
        <TouchableOpacity
          style={[
            styles.chip,
            !selectedCategoryId && styles.chipSelected,
          ]}
          onPress={() => onCategorySelect(null)}
        >
          <Text
            style={[
              styles.chipText,
              !selectedCategoryId && styles.chipTextSelected,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {/* Category chips */}
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.chip,
              selectedCategoryId === category.id && styles.chipSelected,
              selectedCategoryId === category.id && { backgroundColor: category.color },
            ]}
            onPress={() => onCategorySelect(category.id)}
          >
            <View
              style={[
                styles.colorDot,
                { backgroundColor: category.color },
                selectedCategoryId === category.id && styles.colorDotSelected,
              ]}
            />
            <Text
              style={[
                styles.chipText,
                selectedCategoryId === category.id && styles.chipTextSelected,
              ]}
              numberOfLines={1}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.screen,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.grayLight,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.neutral.grayLighter,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.teal,
  },
  chipText: {
    ...typography.textStyles.buttonSmall,
    color: colors.text.secondary,
    textTransform: 'none',
  },
  chipTextSelected: {
    color: colors.text.inverse,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  colorDotSelected: {
    backgroundColor: colors.white,
  },
});
