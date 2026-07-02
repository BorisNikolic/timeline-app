/**
 * Pyramid Festival — minimal stroke icons (ported from the design's ui.jsx / info.jsx).
 * 24-grid, 1.8px line language, tint via `color`.
 */

import React from 'react';
import Svg, { G, Path, Circle, Rect } from 'react-native-svg';

export function PFIcon({ size = 24, stroke = 1.8, color = '#F7F3EA', fill = 'none', children }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" fill={fill}>
        {children}
      </G>
    </Svg>
  );
}

export const IconHome = (p) => (
  <PFIcon {...p}><Path d="M4 11.5 12 4l8 7.5" /><Path d="M6 10v10h12V10" /></PFIcon>
);
export const IconCal = (p) => (
  <PFIcon {...p}><Rect x="3.5" y="5" width="17" height="16" rx="3" /><Path d="M3.5 9.5h17M8 3v4M16 3v4" /></PFIcon>
);
export const IconMap = (p) => (
  <PFIcon {...p}><Path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z" /><Path d="M9 4v14M15 6v14" /></PFIcon>
);
export const IconInfo = (p) => (
  <PFIcon {...p}><Circle cx="12" cy="12" r="8.5" /><Path d="M12 11v5M12 8h.01" /></PFIcon>
);
export const IconUser = (p) => (
  <PFIcon {...p}><Circle cx="12" cy="8.5" r="3.5" /><Path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" /></PFIcon>
);
export const IconBell = (p) => (
  <PFIcon {...p}><Path d="M6 9a6 6 0 0 1 12 0c0 5 1.5 6 1.5 6H4.5S6 14 6 9Z" /><Path d="M10 19a2 2 0 0 0 4 0" /></PFIcon>
);
export const IconStar = ({ filled, color = '#F7F3EA', ...p }) => (
  <PFIcon color={color} fill={filled ? color : 'none'} {...p}>
    <Path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9L12 3.5Z" />
  </PFIcon>
);
export const IconArrow = (p) => (
  <PFIcon {...p}><Path d="M5 12h14M13 6l6 6-6 6" /></PFIcon>
);
export const IconPin = (p) => (
  <PFIcon {...p}><Path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" /><Circle cx="12" cy="10" r="2.5" /></PFIcon>
);
export const IconSun = (p) => (
  <PFIcon {...p}><Circle cx="12" cy="12" r="4" /><Path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" /></PFIcon>
);
export const IconMoon = (p) => (
  <PFIcon {...p}><Path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5Z" /></PFIcon>
);
export const IconChevron = ({ size = 18, stroke = 2.2, color = '#F7F3EA' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <Path d="M6 9l6 6 6-6" />
    </G>
  </Svg>
);
export const IconChevronLeft = (p) => (
  <PFIcon {...p}><Path d="M15 5l-7 7 7 7" /></PFIcon>
);
export const IconClock = (p) => (
  <PFIcon {...p}><Circle cx="12" cy="12" r="8.5" /><Path d="M12 7.5V12l3 2" /></PFIcon>
);

// Info / quick-fact icons keyed by name (ported from info.jsx InfoIcon map).
const INFO_PATHS = {
  star: <Path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9L12 3.5Z" />,
  car: <G><Path d="M3 13l2-5.5A2 2 0 0 1 6.9 6h10.2a2 2 0 0 1 1.9 1.5L21 13v5h-3v-2H6v2H3v-5Z" /><Path d="M3 13h18" /><Circle cx="7.5" cy="15.5" r="1" /><Circle cx="16.5" cy="15.5" r="1" /></G>,
  music: <G><Path d="M9 18V6l10-2v12" /><Circle cx="6.5" cy="18" r="2.5" /><Circle cx="16.5" cy="16" r="2.5" /></G>,
  food: <G><Path d="M5 3v7a2 2 0 0 0 4 0V3M7 10v11" /><Path d="M16 3c-1.5 0-2.5 2-2.5 4.5S14.5 12 16 12v9" /></G>,
  health: <G><Rect x="3.5" y="6" width="17" height="13" rx="2.5" /><Path d="M9 6V4h6v2M12 10v5M9.5 12.5h5" /></G>,
  shield: <G><Path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" /><Path d="M9 12l2 2 4-4" /></G>,
  leaf: <G><Path d="M5 19c0-8 5-13 14-13 0 9-5 14-14 13Z" /><Path d="M9 15c2-3 4-4.5 7-5.5" /></G>,
  help: <G><Circle cx="12" cy="12" r="8.5" /><Path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .8-1 1.7M12 16.5h.01" /></G>,
  gate: <G><Path d="M4 21V6l8-3 8 3v15" /><Path d="M4 21h16M9 21v-6h6v6M9 10h.01M15 10h.01" /></G>,
  card: <G><Rect x="3" y="5.5" width="18" height="13" rx="2.5" /><Path d="M3 9.5h18M7 14.5h4" /></G>,
  cal: <G><Rect x="3.5" y="5" width="17" height="16" rx="3" /><Path d="M3.5 9.5h17M8 3v4M16 3v4" /></G>,
  pin: <G><Path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" /><Circle cx="12" cy="10" r="2.5" /></G>,
};

export const InfoIcon = ({ name, size = 20, stroke = 1.8, color = '#F7F3EA' }) => (
  <PFIcon size={size} stroke={stroke} color={color}>{INFO_PATHS[name] || INFO_PATHS.help}</PFIcon>
);

export default PFIcon;
