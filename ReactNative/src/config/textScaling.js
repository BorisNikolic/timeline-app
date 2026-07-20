/**
 * Global Dynamic Type cap.
 *
 * iOS "Larger Text" can scale fonts ~3.5x, which blows out fixed layouts
 * (clipped cards, labels colliding). We still honor Dynamic Type — just cap it
 * at MAX so the app grows text up to a readable-but-safe ceiling instead of
 * breaking. Any <Text>/<TextInput> that passes its own maxFontSizeMultiplier
 * keeps it (explicit props win).
 *
 * Implemented by patching each component's `render` rather than `defaultProps`,
 * because React 19 (Expo SDK 54 / RN 0.81) ignores defaultProps on the
 * forwardRef function components RN's Text/TextInput now are. Imported once
 * from index.js, before <App>.
 */
import React from 'react';
import { Text, TextInput } from 'react-native';

const MAX_FONT_SIZE_MULTIPLIER = 1.4;

function capFontScaling(Component) {
  if (!Component || Component.__fontCapApplied) return;
  const original = Component.render;
  if (typeof original !== 'function') return;
  Component.render = function render(...args) {
    const element = original.apply(this, args);
    if (!element || element.props.maxFontSizeMultiplier != null) return element;
    return React.cloneElement(element, { maxFontSizeMultiplier: MAX_FONT_SIZE_MULTIPLIER });
  };
  Component.__fontCapApplied = true;
}

capFontScaling(Text);
capFontScaling(TextInput);
