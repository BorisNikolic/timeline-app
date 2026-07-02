/**
 * useReminders — reminders/saved-sets store.
 *
 * The implementation now lives in a shared context (RemindersContext) so all
 * screens read/write one source of truth. This file re-exports the hook to keep
 * existing import paths (`../hooks/useReminders`) working unchanged.
 */

export { useReminders } from '../contexts/RemindersContext';
