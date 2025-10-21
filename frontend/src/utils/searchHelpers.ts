/**
 * Search and filter helper utilities
 * Used by EventSearchInput and useEventSearch hook (User Story 7)
 */

import { Event } from '../types/Event';

/**
 * Escape regex special characters to prevent regex injection
 * FR-017: Input sanitization for search
 */
export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Create case-insensitive regex from search term
 */
export const createSearchRegex = (searchTerm: string): RegExp => {
  const escapedTerm = escapeRegex(searchTerm);
  return new RegExp(escapedTerm, 'i'); // Case-insensitive
};

/**
 * Filter events by search term (title and description)
 */
export const filterEventsBySearch = (events: Event[], searchTerm: string): Event[] => {
  if (!searchTerm || searchTerm.trim() === '') {
    return events;
  }

  const regex = createSearchRegex(searchTerm.trim());

  return events.filter(event => {
    const titleMatch = regex.test(event.title);
    const descriptionMatch = event.description ? regex.test(event.description) : false;
    return titleMatch || descriptionMatch;
  });
};

/**
 * Highlight matching text in a string (for UI display)
 */
export const highlightMatch = (text: string, searchTerm: string): string => {
  if (!searchTerm || searchTerm.trim() === '') {
    return text;
  }

  const regex = createSearchRegex(searchTerm.trim());
  return text.replace(regex, (match) => `<mark>${match}</mark>`);
};

/**
 * Check if search term is valid (not empty, not too long)
 */
export const isValidSearchTerm = (searchTerm: string): boolean => {
  const trimmed = searchTerm.trim();
  return trimmed.length > 0 && trimmed.length <= 200; // Max 200 characters
};
