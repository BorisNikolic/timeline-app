/**
 * Pyramid Festival — design tokens (ported from the Claude Design handoff `pyramid.css`)
 *
 * Brand anchors grounded in colors.js (navy / teal / coral / golden / cream),
 * deepened into a cosmic dark theme + a warm light theme. The "Solar" palette
 * is the fixed default, so its accents apply in BOTH themes (as the prototype did).
 *
 * Usage: const { t } = useTheme();  ->  t.bg, t.ink, t.accent, ...
 */

// Brand anchors (mode-independent)
export const brand = {
  navy: '#323550',
  navyDark: '#1E1E3F',
  teal: '#4592AA',
  tealLight: '#4CADC9',
  tealBright: '#5BBAD5',
  coral: '#E85A4F',
  coralDark: '#D64A3F',
  golden: '#E9A035',
  goldenLight: '#F5B94E',
  cream: '#F5F0E6',
  burgundy: '#8B3A3A',
  // Cosmic extensions for after-dark depth
  cosmos: '#0C0A1C',
  cosmos2: '#14122E',
  aubergine: '#241B3A',
};

// Fixed "Solar" palette — accents applied across both themes.
const palette = { accent: brand.goldenLight, accent2: brand.tealBright };

// Shape language — pyramid = geometry.
export const radius = { sm: 12, md: 18, lg: 26, xl: 36, pill: 999 };

// Sacred-geometry intensity (fixed "balanced").
export const motif = 0.65;

// Font families — Poppins (the app's brand font), loaded via @expo-google-fonts
// in App.js. Weight is baked into the family name, so pair these with the RN
// default fontWeight.
export const fonts = {
  display: 'Poppins_800ExtraBold',
  displayBold: 'Poppins_700Bold',
  displaySemi: 'Poppins_600SemiBold',
  body: 'Poppins_400Regular',
  bodyMed: 'Poppins_500Medium',
  bodySemi: 'Poppins_600SemiBold',
  bodyBold: 'Poppins_700Bold',
  bodyExtra: 'Poppins_800ExtraBold',
};

const dark = {
  mode: 'dark',
  bg: brand.cosmos,
  bg2: brand.cosmos2,
  surface: '#1A1736',
  surface2: '#221E40',
  hairline: 'rgba(245,240,230,0.10)',
  hairlineStrong: 'rgba(245,240,230,0.18)',
  ink: '#F7F3EA',
  ink2: 'rgba(247,243,234,0.66)',
  ink3: 'rgba(247,243,234,0.42)',
  accent: palette.accent,
  accent2: palette.accent2,
  hot: brand.coral,
  onAccent: brand.navyDark, // text/icons on accent fills
  heroFrom: '#1E1E3F',
  heroVia: '#3A2A55',
  heroTo: '#8B3A3A',
  aubergine: brand.aubergine,
  cosmos2: brand.cosmos2,
  statusBar: 'light',
  // overlay tints for blur surfaces / scrims
  blurTint: 'dark',
  scrim: 'rgba(10,8,22,0.34)',
  cardShadow: { shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 22, shadowOffset: { width: 0, height: 14 }, elevation: 10 },
  glow: { shadowColor: palette.accent, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 9 },
};

const light = {
  mode: 'light',
  bg: '#F4EEE2',
  bg2: '#ECE3D2',
  surface: '#FFFDF8',
  surface2: '#FBF5E9',
  hairline: 'rgba(30,30,63,0.10)',
  hairlineStrong: 'rgba(30,30,63,0.16)',
  ink: '#221F3A',
  ink2: 'rgba(34,31,58,0.66)',
  ink3: 'rgba(34,31,58,0.45)',
  accent: palette.accent,
  accent2: palette.accent2,
  hot: brand.coral,
  onAccent: brand.navyDark,
  heroFrom: '#2A2A55',
  heroVia: '#4592AA',
  heroTo: '#E85A4F',
  aubergine: brand.aubergine,
  cosmos2: brand.cosmos2,
  statusBar: 'dark',
  blurTint: 'light',
  scrim: 'rgba(30,30,63,0.10)',
  cardShadow: { shadowColor: '#1E1E3F', shadowOpacity: 0.16, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 6 },
  glow: { shadowColor: palette.accent, shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 7 },
};

export const themes = { dark, light };

export default themes;
