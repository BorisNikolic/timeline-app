/**
 * Pyramid Festival — sacred-geometry motif library (ported from the design's geometry.jsx).
 * Stroke-only line art. Tint via the `color` prop; fade via `opacity` on the wrapper.
 */

import React from 'react';
import Svg, { G, Path, Circle, Line } from 'react-native-svg';

// The festival mark: a pyramid of nested triangles + an apex eye.
export function PyramidMark({ size = 40, stroke = 1.6, color = '#F7F3EA' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G stroke={color} strokeWidth={stroke} strokeLinejoin="round" strokeLinecap="round" fill="none">
        <Path d="M50 8 L92 84 H8 Z" />
        <Path d="M50 8 L50 84" opacity={0.55} />
        <Path d="M50 38 L71 84 M50 38 L29 84" opacity={0.55} />
        <Path d="M29 62 H71" opacity={0.4} />
        <Circle cx="50" cy="30" r="5" fill={color} stroke="none" />
      </G>
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
