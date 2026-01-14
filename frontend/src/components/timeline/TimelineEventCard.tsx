// TimelineEventCard Component
// Zoom-responsive event card with 3 variants: full, mini, dot

import React from 'react';
import { createPortal } from 'react-dom';
import type { TimelineEventCardProps, ClusteredEventInfo } from '../../types/timeline';
import { getCardVariant, getCardConfigForZoom } from '../../utils/timelineCalculations';
import '../../styles/timeline-animations.css';

// Priority color mapping for dot variant
const PRIORITY_COLORS: Record<string, { bg: string; border: string; fill: string }> = {
  High: { bg: '#FEE2E2', border: '#EF4444', fill: '#DC2626' },
  Medium: { bg: '#FEF3C7', border: '#F59E0B', fill: '#D97706' },
  Low: { bg: '#DCFCE7', border: '#22C55E', fill: '#16A34A' }
};

// Status icons for mini variant
const STATUS_ICONS: Record<string, string> = {
  'Not Started': '○',
  'In Progress': '◐',
  'Completed': '●'
};

// Format time string to HH:MM (remove seconds if present)
const formatTime = (time: string): string => {
  // Handle "HH:MM:SS" or "HH:MM" format
  const parts = time.split(':');
  return `${parts[0]}:${parts[1]}`;
};

// Duration badge component - shows formatted duration (e.g., "30m", "2h", "2h 30m")
const DurationBadge: React.FC<{
  durationMinutes: number;
  variant: 'full' | 'mini';
}> = ({ durationMinutes, variant }) => {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  let text: string;
  if (durationMinutes < 60) {
    text = `${durationMinutes}m`;
  } else if (minutes === 0) {
    text = `${hours}h`;
  } else {
    text = `${hours}h ${minutes}m`;
  }

  const sizeClasses = variant === 'full'
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-[9px] px-1 py-0.5';

  return (
    <span
      className={`
        ${sizeClasses}
        bg-indigo-100 text-indigo-700
        rounded font-medium
        whitespace-nowrap
        flex-shrink-0
      `}
      title={`Duration: ${text}`}
    >
      {text}
    </span>
  );
};

// Duration bar underlay - visual extent indicator (Day view only)
// Shows the full duration of an event as a semi-transparent bar behind the card
const DurationBarUnderlay: React.FC<{
  cardWidth: number;
  durationBarWidth: number;
  categoryColor: string;
}> = ({ cardWidth, durationBarWidth, categoryColor }) => {
  // Only show if duration bar extends beyond the card
  if (durationBarWidth <= cardWidth) return null;

  return (
    <div
      className="duration-bar-underlay absolute top-0 left-0 h-full rounded-lg pointer-events-none"
      style={{
        width: `${durationBarWidth}px`,
        backgroundColor: categoryColor,
        opacity: 0.15,
        zIndex: -1
      }}
      aria-hidden="true"
    />
  );
};

// Cluster popover component for showing all events in a cluster
// Uses portal to render at body level, avoiding z-index stacking context issues
const ClusterPopover: React.FC<{
  events: ClusteredEventInfo[];
  onEventClick: (eventId: string) => void;
  onClose: () => void;
  categoryColor: string;
  anchorRect: DOMRect | null;
}> = ({ events, onEventClick, onClose, categoryColor, anchorRect }) => {
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Don't render if no anchor position
  if (!anchorRect) return null;

  // Calculate position - center above the anchor element
  const popoverStyle: React.CSSProperties = {
    position: 'fixed',
    left: anchorRect.left + anchorRect.width / 2,
    top: anchorRect.top - 8, // 8px gap above anchor
    transform: 'translate(-50%, -100%)',
    zIndex: 10000
  };

  const popoverContent = (
    <div
      ref={popoverRef}
      className="bg-white rounded-lg shadow-xl border border-gray-200 min-w-[200px] max-w-[280px]"
      style={popoverStyle}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Arrow pointing down */}
      <div
        className="absolute w-3 h-3 bg-white border-r border-b border-gray-200"
        style={{
          bottom: '-6px',
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
          zIndex: -1
        }}
      />

      {/* Header */}
      <div
        className="px-3 py-2 border-b border-gray-100 rounded-t-lg"
        style={{ backgroundColor: `${categoryColor}15` }}
      >
        <span className="text-sm font-semibold text-gray-700">
          {events.length} Events on this date
        </span>
      </div>

      {/* Event list */}
      <div className="max-h-[200px] overflow-y-auto">
        {events.map((evt, index) => (
          <button
            key={evt.eventId}
            onClick={() => onEventClick(evt.eventId)}
            className={`
              w-full text-left px-3 py-2 hover:bg-gray-50
              transition-colors duration-150
              flex items-center gap-2
              ${index !== events.length - 1 ? 'border-b border-gray-100' : ''}
            `}
          >
            {/* Priority dot */}
            <span
              className="flex-shrink-0 w-2 h-2 rounded-full"
              style={{ backgroundColor: PRIORITY_COLORS[evt.priority]?.fill || '#9CA3AF' }}
            />

            {/* Event info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-800 truncate">
                {evt.title}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <span>{evt.priority}</span>
                <span>•</span>
                <span>{STATUS_ICONS[evt.status]} {evt.status}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Render via portal to body to escape stacking context
  return createPortal(popoverContent, document.body);
};

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({
  event,
  position: _position,
  xPosition,
  yPosition,
  categoryColor,
  stackIndex: _stackIndex,
  zIndex,
  width,
  durationMinutes,
  durationBarWidth,
  zoomLevel,
  onClick,
  onClusterEventClick
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [showClusterPopover, setShowClusterPopover] = React.useState(false);
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null);
  const dotRef = React.useRef<HTMLDivElement>(null);

  const variant = getCardVariant(zoomLevel);
  const cardConfig = getCardConfigForZoom(zoomLevel);

  // Render full card variant (Day zoom level)
  const renderFullCard = () => {
    const hasDuration = durationMinutes && durationMinutes > 0;

    return (
      <div className="relative">
        {/* Duration bar underlay (only for Day view with duration) */}
        {durationBarWidth && durationBarWidth > width && (
          <DurationBarUnderlay
            cardWidth={width}
            durationBarWidth={durationBarWidth}
            categoryColor={categoryColor}
          />
        )}

        <div
          onClick={onClick}
          className={`
            cursor-pointer bg-white border-2 rounded-lg
            transition-all duration-200
            p-2 md:p-3
            min-h-[44px]
            ${isHovered ? 'shadow-2xl scale-105' : 'shadow-md hover:shadow-lg'}
          `}
          style={{
            borderLeftColor: categoryColor,
            borderLeftWidth: '4px',
            width: '100%'
          }}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onClick();
            }
          }}
        >
          {/* Title - full width for maximum space */}
          <div className="font-semibold text-sm text-gray-900 truncate mb-1">
            {event.title}
          </div>

          {/* Time range with duration badge - compact single line */}
          {event.time && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
              <span>
                {formatTime(event.time)}
                {event.endTime && ` - ${formatTime(event.endTime)}`}
              </span>
              {hasDuration && (
                <DurationBadge durationMinutes={durationMinutes!} variant="full" />
              )}
            </div>
          )}

          {/* Priority & Status badges */}
          <div className="flex gap-2 items-center">
            {/* Priority badge */}
            <span
              className={`
                text-xs px-2 py-0.5 rounded-full font-medium
                ${event.priority === 'High' ? 'bg-red-100 text-red-700' : ''}
                ${event.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : ''}
                ${event.priority === 'Low' ? 'bg-green-100 text-green-700' : ''}
              `}
            >
              {event.priority}
            </span>

            {/* Status icon */}
            <span
              className={`
                text-xs px-2 py-0.5 rounded-full font-medium
                ${event.status === 'Not Started' ? 'bg-gray-100 text-gray-700' : ''}
                ${event.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : ''}
                ${event.status === 'Completed' ? 'bg-green-100 text-green-700' : ''}
              `}
            >
              {STATUS_ICONS[event.status]}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render mini card variant (Week zoom level)
  const renderMiniCard = () => {
    const priorityColors = PRIORITY_COLORS[event.priority] || PRIORITY_COLORS.Low;
    const hasDuration = durationMinutes && durationMinutes > 0;
    // Truncate title more aggressively if we have a duration badge
    const truncateLength = hasDuration ? 12 : 18;

    return (
      <div
        onClick={onClick}
        className={`
          cursor-pointer bg-white border rounded-md
          transition-all duration-200
          px-2 py-1
          flex items-center gap-1.5
          ${isHovered ? 'shadow-lg scale-105' : 'shadow-sm hover:shadow-md'}
        `}
        style={{
          borderLeftColor: categoryColor,
          borderLeftWidth: '3px',
          width: '100%',
          height: `${cardConfig.height}px`
        }}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick();
          }
        }}
      >
        {/* Priority dot */}
        <span
          className="flex-shrink-0 rounded-full"
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: priorityColors.fill
          }}
        />

        {/* Title (truncated) */}
        <span className="text-xs font-medium text-gray-800 truncate flex-1">
          {event.title.length > truncateLength ? `${event.title.substring(0, truncateLength)}...` : event.title}
        </span>

        {/* Duration badge (if has duration) */}
        {hasDuration && (
          <DurationBadge durationMinutes={durationMinutes!} variant="mini" />
        )}

        {/* Status indicator */}
        <span className="text-xs text-gray-500 flex-shrink-0">
          {STATUS_ICONS[event.status]}
        </span>
      </div>
    );
  };

  // Render dot variant (Month/Quarter/Year zoom level)
  const renderDotCard = () => {
    const priorityColors = PRIORITY_COLORS[event.priority] || PRIORITY_COLORS.Low;

    // Check if this is a clustered dot (multiple events on same date)
    const isCluster = event.isCluster && event.clusterCount && event.clusterCount > 1;
    const clusterCount = event.clusterCount || 1;
    const clusteredEvents = event.clusteredEvents || [];

    // Format tooltip content - show all events if clustered
    let tooltipContent: string;
    if (isCluster && clusteredEvents.length > 0) {
      tooltipContent = `${clusterCount} events - Click to view`;
    } else {
      tooltipContent = `${event.title} • ${event.priority} • ${event.status}`;
    }

    // Calculate dot size - slightly larger for clusters
    const dotSize = isCluster ? cardConfig.width + 4 : cardConfig.width;

    // Handle click - show popover for clusters, regular onClick for single events
    const handleDotClick = () => {
      if (isCluster) {
        // Capture anchor position when opening popover
        if (!showClusterPopover && dotRef.current) {
          setAnchorRect(dotRef.current.getBoundingClientRect());
        }
        setShowClusterPopover(!showClusterPopover);
      } else {
        onClick();
      }
    };

    // Handle clicking an event in the cluster popover
    const handleClusterEventClick = (eventId: string) => {
      setShowClusterPopover(false);
      if (onClusterEventClick) {
        onClusterEventClick(eventId);
      }
    };

    return (
      <div className="relative">
        <div
          ref={dotRef}
          onClick={handleDotClick}
          className={`
            timeline-dot-card
            cursor-pointer
            transition-all duration-200
            relative
            ${isHovered && !showClusterPopover ? 'scale-150' : ''}
          `}
          style={{
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            borderRadius: '50%',
            backgroundColor: priorityColors.bg,
            border: `2px solid ${categoryColor}`,
            boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.2)'
          }}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleDotClick();
            }
          }}
          title={tooltipContent}
          aria-label={tooltipContent}
          data-tooltip={tooltipContent}
        >
          {/* Inner priority indicator */}
          <div
            className="w-full h-full rounded-full flex items-center justify-center"
            style={{
              backgroundColor: isHovered && !isCluster ? priorityColors.fill : 'transparent'
            }}
          >
            {/* Show status icon on hover for single event */}
            {isHovered && !isCluster && !showClusterPopover && (
              <span className="text-white text-[8px] font-bold">
                {STATUS_ICONS[event.status]}
              </span>
            )}
          </div>

          {/* Count badge for clusters - hide when popover is open to prevent overlap */}
          {isCluster && !showClusterPopover && (
            <div
              className="absolute flex items-center justify-center font-bold text-white"
              style={{
                top: '-6px',
                right: '-6px',
                width: '16px',
                height: '16px',
                fontSize: '9px',
                borderRadius: '50%',
                backgroundColor: '#6366f1', // Indigo color for count badge
                border: '1.5px solid white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
              }}
            >
              {clusterCount}
            </div>
          )}
        </div>

        {/* Cluster popover - rendered via portal to escape stacking context */}
        {isCluster && showClusterPopover && (
          <ClusterPopover
            events={clusteredEvents}
            onEventClick={handleClusterEventClick}
            onClose={() => setShowClusterPopover(false)}
            categoryColor={categoryColor}
            anchorRect={anchorRect}
          />
        )}
      </div>
    );
  };

  // Select render function based on variant
  const renderCard = () => {
    switch (variant) {
      case 'full':
        return renderFullCard();
      case 'mini':
        return renderMiniCard();
      case 'dot':
        return renderDotCard();
      default:
        return renderFullCard();
    }
  };

  // Calculate position offset for dot variant (center the dot)
  const adjustedXPosition = variant === 'dot'
    ? xPosition - (cardConfig.width / 2)
    : xPosition;

  // Stack offset from calculateEventPositions (stackIndex * stackOffsetY)
  const stackOffset = yPosition;

  // Position cards from top of lane, stacking downward
  // This ensures cards stay within the lane bounds regardless of stack size
  // Top padding of 20px for visual breathing room
  const topPadding = 20;
  const topPosition = topPadding + stackOffset;

  return (
    <div
      className={`timeline-event-card absolute ${isHovered ? 'transition-all duration-200' : ''}`}
      style={{
        left: `${adjustedXPosition}px`,
        top: `${topPosition}px`,
        zIndex: isHovered ? 9999 : zIndex,
        width: variant === 'dot' ? `${cardConfig.width}px` : `${width}px`
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderCard()}
    </div>
  );
};
