/**
 * TypeScript types for search and filtering
 * Used by EventSearchInput and useEventSearch (User Story 7)
 */

import { EventStatus, EventPriority } from './Event';

/**
 * Combined search and filter state
 * Combines text search with existing filters (status, priority, category, person)
 */
export interface SearchFilterState {
  searchTerm: string;
  status?: EventStatus;
  priority?: EventPriority;
  categoryId?: string;
  assignedPerson?: string;
}

/**
 * Search configuration options
 */
export interface SearchOptions {
  debounceMs?: number; // Debounce delay for search input (default: 300ms)
  caseSensitive?: boolean; // Case-sensitive matching (default: false)
  searchFields?: ('title' | 'description')[]; // Fields to search (default: both)
}

/**
 * Search result metadata
 */
export interface SearchResultMetadata {
  totalResults: number;
  filteredResults: number;
  searchTerm: string;
  appliedFilters: {
    status?: EventStatus;
    priority?: EventPriority;
    categoryId?: string;
    assignedPerson?: string;
  };
}

/**
 * Initial/default search filter state
 */
export const initialSearchFilterState: SearchFilterState = {
  searchTerm: ''
};

/**
 * Default search options
 */
export const defaultSearchOptions: Required<SearchOptions> = {
  debounceMs: 300,
  caseSensitive: false,
  searchFields: ['title', 'description']
};
