/**
 * BlogPostScreen - Renders a single blog post body in a styled WebView
 * Fetches content via WP REST API and wraps it in our own minimal HTML shell.
 */

import React, { useMemo } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { useBlogPost } from '../hooks/useBlogPosts';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function buildHtml(post) {
  const image = post.image
    ? `<img class="hero" src="${post.image}" alt="" />`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes" />
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #F9F9F9;
      color: #343434;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.65;
      font-size: 17px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .wrap { padding: 0 20px 48px 20px; }
    .hero {
      display: block;
      width: 100%;
      height: auto;
      margin-bottom: 24px;
    }
    h1.title {
      font-size: 28px;
      line-height: 1.25;
      color: #1E1E3F;
      margin: 0 0 12px 0;
      font-weight: 700;
    }
    .meta {
      color: #999;
      font-size: 13px;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 28px;
    }
    .content p { margin: 16px 0; }
    .content img,
    .content iframe,
    .content video {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      display: block;
      margin: 20px auto;
    }
    .content h2, .content h3, .content h4 {
      color: #1E1E3F;
      line-height: 1.3;
      margin: 32px 0 12px 0;
    }
    .content h2 { font-size: 22px; }
    .content h3 { font-size: 19px; }
    .content a { color: #4592AA; text-decoration: underline; }
    .content blockquote {
      border-left: 4px solid #E85A4F;
      padding: 4px 0 4px 16px;
      margin: 24px 0;
      color: #555;
      font-style: italic;
    }
    .content ul, .content ol { padding-left: 24px; }
    .content li { margin: 6px 0; }
    .content figure { margin: 20px 0; }
    .content figcaption {
      font-size: 13px;
      color: #999;
      text-align: center;
      margin-top: 6px;
    }
    .content pre, .content code {
      background: #ECECEC;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 14px;
    }
    .content pre { padding: 12px; overflow-x: auto; }
  </style>
</head>
<body>
  ${image}
  <div class="wrap">
    <h1 class="title">${post.title}</h1>
    <div class="meta">${formatDate(post.date)}</div>
    <div class="content">${post.content}</div>
  </div>
</body>
</html>`;
}

export default function BlogPostScreen({ route }) {
  const { postId } = route.params;
  const { data: post, isLoading, isError, refetch } = useBlogPost(postId);

  const html = useMemo(() => (post ? buildHtml(post) : null), [post]);

  if (isLoading && !post) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  if (isError && !post) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Couldn't load this post</Text>
        <Text style={styles.errorMessage}>
          Check your connection and try again.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://pyramidfestival.com' }}
        style={styles.webview}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.screen,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.background.screen,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.screen,
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    ...typography.textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
