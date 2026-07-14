import { Platform, ViewStyle } from 'react-native';

type ShadowSize = 'sm' | 'md' | 'lg' | 'xl';

const SHADOWS: Record<ShadowSize, ViewStyle> = {
  sm: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    android: { elevation: 2 },
    default: {},
  }) as ViewStyle,
  md: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: { elevation: 4 },
    default: {},
  }) as ViewStyle,
  lg: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
    },
    android: { elevation: 6 },
    default: {},
  }) as ViewStyle,
  xl: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 24,
    },
    android: { elevation: 10 },
    default: {},
  }) as ViewStyle,
};

/** Returns a shadow style object for the given size. */
export function shadow(size: ShadowSize = 'md'): ViewStyle {
  return SHADOWS[size];
}

export const shadowSm: ViewStyle = SHADOWS.sm;
export const shadowMd: ViewStyle = SHADOWS.md;
export const shadowLg: ViewStyle = SHADOWS.lg;
export const shadowXl: ViewStyle = SHADOWS.xl;
