/**
 * useBlogPosts - Fetch blog posts from the Pyramid Festival WordPress site
 * Offline-first via React Query + AsyncStorage persistence.
 */

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const BLOG_API_URL = 'https://pyramidfestival.com/wp-json/wp/v2/posts';

function decodeEntities(html) {
  if (!html) return '';
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function stripHtml(html) {
  if (!html) return '';
  return decodeEntities(html.replace(/<[^>]*>/g, '')).trim();
}

function normalizePost(post) {
  const featured = post?._embedded?.['wp:featuredmedia']?.[0];
  return {
    id: post.id,
    title: decodeEntities(post.title?.rendered ?? ''),
    excerpt: stripHtml(post.excerpt?.rendered ?? ''),
    content: post.content?.rendered ?? '',
    link: post.link,
    date: post.date,
    image:
      featured?.media_details?.sizes?.medium_large?.source_url ||
      featured?.media_details?.sizes?.medium?.source_url ||
      featured?.source_url ||
      null,
  };
}

async function fetchBlogPosts(limit = 5) {
  const response = await axios.get(BLOG_API_URL, {
    params: { per_page: limit, _embed: 'wp:featuredmedia' },
    timeout: 15000,
  });
  return response.data.map(normalizePost);
}

async function fetchBlogPost(id) {
  const response = await axios.get(`${BLOG_API_URL}/${id}`, {
    params: { _embed: 'wp:featuredmedia' },
    timeout: 15000,
  });
  return normalizePost(response.data);
}

export function useBlogPosts(limit = 5) {
  return useQuery({
    queryKey: ['blogPosts', limit],
    queryFn: () => fetchBlogPosts(limit),
    staleTime: 10 * 60 * 1000,
  });
}

export function useBlogPost(id) {
  return useQuery({
    queryKey: ['blogPost', id],
    queryFn: () => fetchBlogPost(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}
