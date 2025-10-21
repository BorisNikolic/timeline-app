import { useEffect } from 'react';

export interface KeyboardShortcutCallbacks {
  onNewEvent?: () => void;
  onFocusSearch?: () => void;
  onExport?: () => void;
  onCloseModal?: () => void;
  onSave?: () => void;
}

/**
 * Global keyboard shortcuts hook
 * Handles keyboard events with context-aware filtering
 *
 * Shortcuts:
 * - N: Open new event modal
 * - /: Focus search input
 * - E: Open export menu
 * - ESC: Close modal
 * - Ctrl+S / Cmd+S: Save form
 */
export function useKeyboardShortcuts(callbacks: KeyboardShortcutCallbacks) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if user is typing in input/textarea or has contenteditable focused
      const activeElement = document.activeElement;
      const isTyping =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.hasAttribute('contenteditable');

      // Always allow ESC key (even when typing)
      if (e.key === 'Escape') {
        callbacks.onCloseModal?.();
        return;
      }

      // Skip other shortcuts when typing
      if (isTyping) {
        // Allow Ctrl+S / Cmd+S even when typing (for form save)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault(); // Prevent browser save dialog
          callbacks.onSave?.();
        }
        return;
      }

      // Global shortcuts (only when not typing)
      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          callbacks.onNewEvent?.();
          break;
        case '/':
          e.preventDefault();
          callbacks.onFocusSearch?.();
          break;
        case 'e':
          e.preventDefault();
          callbacks.onExport?.();
          break;
      }

      // Ctrl+S / Cmd+S (save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        callbacks.onSave?.();
      }
    };

    // Attach global keyboard listener
    window.addEventListener('keydown', handler);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [callbacks]);
}
