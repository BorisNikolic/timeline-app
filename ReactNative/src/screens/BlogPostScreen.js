/**
 * BlogPostScreen - Renders a single blog post body in a styled WebView
 * Fetches content via WP REST API and wraps it in our own minimal HTML shell.
 * The HTML shell is theme-aware: colors derive from the active theme tokens.
 */

import React, { useMemo } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { useBlogPost } from '../hooks/useBlogPosts';
import { useTheme } from '../contexts/ThemeContext';
import { fonts } from '../theme/tokens';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Derive the WebView body palette from the active theme tokens.
function htmlPalette(t) {
  const dark = t.mode === 'dark';
  return {
    bg: t.bg,
    text: dark ? '#E8E4DA' : '#221F3A',
    heading: dark ? '#F7F3EA' : '#1E1E3F',
    meta: t.ink3,
    link: t.accent2,
    quoteBorder: t.hot,
    quoteText: t.ink2,
    code: dark ? 'rgba(247,243,234,0.10)' : '#ECECEC',
    hairline: t.hairline,
  };
}

function buildHtml(post, t) {
  const p = htmlPalette(t);

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
      background: ${p.bg};
      color: ${p.text};
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
      color: ${p.heading};
      margin: 0 0 12px 0;
      font-weight: 700;
    }
    .meta {
      color: ${p.meta};
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
      color: ${p.heading};
      line-height: 1.3;
      margin: 32px 0 12px 0;
    }
    .content h2 { font-size: 22px; }
    .content h3 { font-size: 19px; }
    .content a { color: ${p.link}; text-decoration: underline; }
    .content blockquote {
      border-left: 4px solid ${p.quoteBorder};
      padding: 4px 0 4px 16px;
      margin: 24px 0;
      color: ${p.quoteText};
      font-style: italic;
    }
    .content ul, .content ol { padding-left: 24px; }
    .content li { margin: 6px 0; }
    .content figure { margin: 20px 0; }
    .content figcaption {
      font-size: 13px;
      color: ${p.meta};
      text-align: center;
      margin-top: 6px;
    }
    .content pre, .content code {
      background: ${p.code};
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 14px;
    }
    .content pre { padding: 12px; overflow-x: auto; }
    .content hr { border: none; border-top: 1px solid ${p.hairline}; margin: 28px 0; }
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
      <WebView
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://pyramidfestival.com' }}
        style={[styles.webview, { backgroundColor: t.bg }]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
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
