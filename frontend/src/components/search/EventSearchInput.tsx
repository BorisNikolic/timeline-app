import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface EventSearchInputProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClear: () => void;
  placeholder?: string;
}

/**
 * Event Search Input Component (User Story 7 - P3)
 * Provides text search with ESC key to clear
 */
const EventSearchInput = forwardRef<HTMLInputElement, EventSearchInputProps>(({
  searchTerm,
  onSearchChange,
  onClear,
  placeholder = 'Search events by title or description...',
}, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Expose focus method via ref
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  // Handle ESC key to clear search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        onClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClear]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700 text-gray-400"
          aria-label="Clear search"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
});

EventSearchInput.displayName = 'EventSearchInput';

export default EventSearchInput;
