/**
 * BlogPostScreen (web) — react-native-webview has no web implementation, so on
 * web we render the same buildHtml document inside an isolated <iframe srcDoc>.
 * The iframe sandboxes the post's CSS from the app shell, mirroring the native
 * WebView. Loading/error states match BlogPostScreen.js.
 */

import React, { useMemo } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { useBlogPost } from '../hooks/useBlogPosts';
import { useTheme } from '../contexts/ThemeContext';
import { fonts } from '../theme/tokens';
import { buildHtml } from './blogPostHtml';

export default function BlogPostScreen({ route }) {
  const { postId } = route.params || {};
  const { t, mode } = useTheme();
  const { data: post, isLoading, isError, refetch } = useBlogPost(postId);

  const html = useMemo(() => (post ? buildHtml(post, t) : null), [post, mode]);

  if (isLoading && !post) {
    return (
      <View style={[styles.centered, { backgroundColor: t.bg }]}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  if (!html || (isError && !post)) {
    return (
      <View style={[styles.centered, { backgroundColor: t.bg }]}>
        <Text style={[styles.errorTitle, { color: t.ink }]}>Couldn't load this post</Text>
        <Text style={[styles.errorMessage, { color: t.ink2 }]}>
          Check your connection and try again.
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: t.accent }, t.glow]}
          activeOpacity={0.85}
          onPress={() => refetch()}
        >
          <Text style={[styles.retryButtonText, { color: t.onAccent }]}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      {React.createElement('iframe', {
        srcDoc: html,
        title: post.title,
        style: { border: 'none', width: '100%', height: '100%', background: t.bg },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorMessage: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  retryButtonText: {
    fontFamily: fonts.displaySemi,
    fontSize: 15,
  },
});
