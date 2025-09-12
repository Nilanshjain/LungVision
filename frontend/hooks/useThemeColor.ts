/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';

// Simplified theme color hook to match our flat Colors shape
// Supports optional light/dark overrides via props but defaults to our palette
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: 'background' | 'text'
) {
  const override = props.light ?? props.dark;
  if (override) return override;

  if (colorName === 'background') return Colors.background;
  if (colorName === 'text') return Colors.text.primary;
  return Colors.background;
}
