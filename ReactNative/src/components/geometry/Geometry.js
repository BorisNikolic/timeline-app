/**
 * Pyramid Festival — sacred-geometry motif library (ported from the design's geometry.jsx).
 * Stroke-only line art. Tint via the `color` prop; fade via `opacity` on the wrapper.
 */

import React from 'react';
import Svg, { G, Path, Circle, Line } from 'react-native-svg';

// The festival mark: the real Pyramid logo (same artwork as the app icon).
// Solid two-faced pyramid; `color` tints the fill. `stroke` is accepted but
// unused so existing call sites need no changes.
export function PyramidMark({ size = 40, color = '#F7F3EA' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 150 150">
      <Path
        fill={color}
        d="m82.22,8.08c-3.21-5.57-11.24-5.57-14.45,0L12.59,103.96c-2.34,4.07-.86,9.28,3.28,11.5l55.18,29.65c2.46,1.32,5.43,1.32,7.89,0l55.18-29.65c4.14-2.22,5.62-7.43,3.28-11.5L82.22,8.08Zm-46.21,89.2l30.5-52.99v79.12l-27.22-14.62c-4.14-2.22-5.62-7.43-3.28-11.5Zm74.69,11.5l-27.22,14.62V44.29l30.5,52.99c2.34,4.07.86,9.28-3.28,11.5Z"
      />
    </Svg>
  );
}

// Concentric 3-6-9 rings — the festival's recurring numerology.
export function Rings369({ size = 120, stroke = 1.2, color = '#F7F3EA' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <G stroke={color} strokeWidth={stroke} fill="none">
        {[28, 52, 76].map((r, i) => (
          <Circle key={i} cx="100" cy="100" r={r} opacity={0.85 - i * 0.22} />
        ))}
        <Path d="M100 24 L166 138 H34 Z" opacity={0.35} />
      </G>
    </Svg>
  );
}

// Seed / flower of life mandala — six petals around a centre.
export function SeedOfLife({ size = 140, stroke = 1, color = '#F7F3EA' }) {
  const r = 26;
  const cx = 100;
  const cy = 100;
  const pts = [];
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 3) * k;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <G stroke={color} strokeWidth={stroke} fill="none">
        <Circle cx={cx} cy={cy} r={r} opacity={0.9} />
        {pts.map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={r} opacity={0.7} />)}
        <Circle cx={cx} cy={cy} r={r * 2} opacity={0.3} />
      </G>
    </Svg>
  );
}

// Radiating sun / ray burst.
export function Rays({ size = 200, count = 24, stroke = 1, color = '#F7F3EA' }) {
  const lines = [];
  for (let i = 0; i < count; i++) {
    const a = (2 * Math.PI / count) * i;
    lines.push(
      <Line
        key={i}
        x1={100 + 32 * Math.cos(a)}
        y1={100 + 32 * Math.sin(a)}
        x2={100 + 96 * Math.cos(a)}
        y2={100 + 96 * Math.sin(a)}
        opacity={i % 2 ? 0.3 : 0.7}
      />
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <G stroke={color} strokeWidth={stroke} strokeLinecap="round" fill="none">
        {lines}
      </G>
    </Svg>
  );
}

// A faint isometric lattice band — texture for section dividers.
export function Lattice({ width = 360, height = 60, stroke = 1, color = '#F7F3EA' }) {
  const cols = [];
  for (let x = 0; x <= width; x += 20) {
    cols.push(<Line key={'a' + x} x1={x} y1={0} x2={x + height} y2={height} opacity={0.5} />);
    cols.push(<Line key={'b' + x} x1={x} y1={0} x2={x - height} y2={height} opacity={0.5} />);
  }
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <G stroke={color} strokeWidth={stroke} fill="none">{cols}</G>
    </Svg>
  );
}

export default { PyramidMark, Rings369, SeedOfLife, Rays, Lattice };
