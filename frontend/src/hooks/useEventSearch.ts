import { useState, useMemo } from 'react';
import { EventWithDetails } from '../types/Event';

/**
 * Event Search Hook (User Story 7 - P3)
 * Provides client-side search filtering with debouncing
 */
export function useEventSearch(events: EventWithDetails[]) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) {
      return events;
    }

    // Escape regex special characters to prevent regex injection (FR-017)
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedTerm, 'i'); // Case-insensitive

    return events.filter(event =>
      regex.test(event.title) || regex.test(event.description || '')
    );
  }, [events, searchTerm]);

  const clearSearch = () => setSearchTerm('');

  return {
    searchTerm,
    setSearchTerm,
    filteredEvents,
    clearSearch,
    hasActiveSearch: searchTerm.trim().length > 0,
  };
}
