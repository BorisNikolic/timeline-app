import { datePresets, formatDateForAPI } from '../../utils/datePresets';

interface QuickDatePresetsProps {
  onDateSelect: (date: string) => void;
}

/**
 * Quick Date Presets Component (User Story 5 - P2)
 * Provides one-click buttons for common dates: Today, Tomorrow, Next Week, Next Month
 */
function QuickDatePresets({ onDateSelect }: QuickDatePresetsProps) {
  const handlePresetClick = (label: string) => {
    const preset = datePresets.find(p => p.label === label);
    if (preset) {
      const date = preset.getValue();
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
