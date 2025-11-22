/**
 * ColorPicker Component (T110)
 * Feature: 001-multi-timeline-system
 *
 * Color selection component for timeline theme colors
 */

import { ThemeColor, THEME_COLOR_OPTIONS } from '../../constants/themeColors';

interface ColorPickerProps {
  value: ThemeColor;
  onChange: (color: ThemeColor) => void;
  disabled?: boolean;
  className?: string;
}

export function ColorPicker({ value, onChange, disabled = false, className = '' }: ColorPickerProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {THEME_COLOR_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          disabled={disabled}
          className={`
            w-8 h-8 rounded-full border-2 transition-all duration-150
            ${value === option.value
              ? 'border-gray-700 ring-2 ring-offset-2 ring-gray-400 scale-110'
              : 'border-transparent hover:border-gray-300 hover:scale-105'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          style={{ backgroundColor: option.color }}
          title={option.label}
          aria-label={`Select ${option.label} color`}
          aria-pressed={value === option.value}
        />
      ))}
    </div>
  );
}

interface ColorPickerWithLabelProps extends ColorPickerProps {
  label: string;
  id?: string;
}

export function ColorPickerWithLabel({
  label,
  id,
  value,
  onChange,
  disabled,
  className,
}: ColorPickerWithLabelProps) {
  const pickerId = id || `color-picker-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={className}>
      <label
        htmlFor={pickerId}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <ColorPicker
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      <p className="mt-1 text-xs text-gray-500">
        Selected: {THEME_COLOR_OPTIONS.find(opt => opt.value === value)?.label || value}
      </p>
    </div>
  );
}

export default ColorPicker;
