/**
 * NewsCarousel - Horizontal scrollable cards showing latest blog posts
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';

const CARD_WIDTH = 240;

function formatPostDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function NewsCard({ post, onPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(post)}
      activeOpacity={0.85}
    >
      {post.image ? (
        <Image source={{ uri: post.image }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="newspaper-outline" size={40} color={colors.text.tertiary} />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.date}>{formatPostDate(post.date)}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {post.title}
        </Text>
        <Text style={styles.excerpt} numberOfLines={2}>
          {post.excerpt}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NewsCarousel({ posts, isLoading, isError, onPostPress }) {
  if (isLoading && (!posts || posts.length === 0)) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }

  if (isError && (!posts || posts.length === 0)) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="cloud-offline-outline" size={28} color={colors.text.tertiary} />
        <Text style={styles.errorText}>Couldn't load news</Text>
      </View>
    );
  }

  if (!posts || posts.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      decelerationRate="fast"
      snapToInterval={CARD_WIDTH + spacing.md}
      snapToAlignment="start"
    >
      {posts.map((post) => (
        <NewsCard key={post.id} post={post} onPress={onPostPress} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: colors.neutral.grayLighter,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: spacing.md,
  },
  date: {
    ...typography.textStyles.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.textStyles.h5,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  excerpt: {
    ...typography.textStyles.bodySmall,
    color: colors.text.secondary,
  },
  loaderContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  errorText: {
    ...typography.textStyles.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});
