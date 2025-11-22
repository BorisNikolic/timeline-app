/**
 * OutcomeTagBadge component
 * Feature: 001-multi-timeline-system (User Story 8)
 *
 * Displays outcome tag with color coding for retrospective features
 */

import { OutcomeTag, OUTCOME_TAG_CONFIG } from '../../types/Event';

interface OutcomeTagBadgeProps {
  tag: OutcomeTag;
  size?: 'sm' | 'md';
  className?: string;
}

export default function OutcomeTagBadge({
  tag,
  size = 'sm',
  className = '',
}: OutcomeTagBadgeProps) {
  const config = OUTCOME_TAG_CONFIG[tag];

  if (!config) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  // Icons for each outcome tag
  const icons: Record<OutcomeTag, React.ReactNode> = {
    [OutcomeTag.WentWell]: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
    [OutcomeTag.NeedsImprovement]: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    [OutcomeTag.Failed]: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${config.bgColor} ${config.color} ${sizeClasses[size]} ${className}`}
      title={`Outcome: ${config.label}`}
    >
      {icons[tag]}
      <span>{config.label}</span>
    </span>
  );
}
