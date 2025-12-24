import { datePresets, formatDateForAPI, getPresetValue } from '../../utils/datePresets';

interface QuickDatePresetsProps {
  onDateSelect: (date: string) => void;
  /** Base date for relative calculations (YYYY-MM-DD format). If not provided, uses today. */
  baseDate?: string;
}

/**
 * Quick Date Presets Component (User Story 5 - P2)
 * Provides one-click buttons for common dates: Today, Tomorrow, Next Week, Next Month
 * When baseDate is provided, offsets are calculated relative to that date.
 */
function QuickDatePresets({ onDateSelect, baseDate }: QuickDatePresetsProps) {
  const handlePresetClick = (label: string) => {
    const preset = datePresets.find(p => p.label === label);
    if (preset) {
      // Parse baseDate if provided, otherwise use today
      const base = baseDate ? new Date(baseDate + 'T00:00:00') : new Date();
      const date = getPresetValue(preset, base);
      const formattedDate = formatDateForAPI(date);
      onDateSelect(formattedDate);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {datePresets.map(preset => (
        <button
          key={preset.label}
          type="button"
          onClick={() => handlePresetClick(preset.label)}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

export default QuickDatePresets;
