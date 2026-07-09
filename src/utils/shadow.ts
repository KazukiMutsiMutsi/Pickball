import { Platform } from 'react-native';

// Pre-built shadow style objects — safe to spread inside StyleSheet.create
// AND to use in JSX style arrays.
// On web returns boxShadow; on native returns shadow* + elevation.

function make(
  webVal: string,
  color: string,
  w: number, h: number,
  opacity: number,
  radius: number,
  elevation: number
) {
  if (Platform.OS === 'web') return { boxShadow: webVal } as any;
  return { shadowColor: color, shadowOffset: { width: w, height: h }, shadowOpacity: opacity, shadowRadius: radius, elevation };
}

export const shadowSm = make('0 1px 3px rgba(0,0,0,0.08)',  '#000', 0, 1, 0.05, 3,  1);
export const shadowMd = make('0 2px 8px rgba(0,0,0,0.10)',  '#000', 0, 2, 0.08, 6,  2);
export const shadowLg = make('0 4px 16px rgba(0,0,0,0.12)', '#000', 0, 4, 0.12, 12, 4);

/** Functional form — still works in JSX style arrays */
export function shadow(level: 'sm' | 'md' | 'lg' = 'md') {
  if (level === 'sm') return shadowSm;
  if (level === 'lg') return shadowLg;
  return shadowMd;
}
