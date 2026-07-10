import { Platform } from 'react-native';

// Brand palette
export const Palette = {
  primary: '#1A8FE3',
  primaryDark: '#1270B5',
  primaryLight: '#E8F4FD',
  accent: '#FF6B35',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  white: '#FFFFFF',
  black: '#000000',
  grey50: '#FAFAFA',
  grey100: '#F5F5F5',
  grey200: '#EEEEEE',
  grey300: '#E0E0E0',
  grey400: '#BDBDBD',
  grey500: '#9E9E9E',
  grey600: '#757575',
  grey700: '#616161',
  grey800: '#424242',
  grey900: '#212121',
};

export const Colors = {
  light: {
    text: Palette.grey900,
    background: Palette.white,
    tint: Palette.primary,
    icon: Palette.grey600,
    tabIconDefault: Palette.grey500,
    tabIconSelected: Palette.primary,
    card: Palette.white,
    border: Palette.grey300,
    subtext: Palette.grey600,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#FFFFFF',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#FFFFFF',
    card: '#1E2122',
    border: '#2C2F30',
    subtext: '#9BA1A6',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Typography scale
export const Typography = {
  xs:   { fontSize: 11, lineHeight: 16 },
  sm:   { fontSize: 13, lineHeight: 18 },
  base: { fontSize: 15, lineHeight: 22 },
  md:   { fontSize: 17, lineHeight: 24 },
  lg:   { fontSize: 20, lineHeight: 28 },
  xl:   { fontSize: 24, lineHeight: 32 },
  xxl:  { fontSize: 28, lineHeight: 36 },
  h1:   { fontSize: 34, lineHeight: 42 },
};

// Web layout — centered max-width container
export const Layout = {
  maxWidth: 480,
  contentPadding: 16,
};

// Currency formatter — Philippine Peso
export const formatPHP = (amount: number): string =>
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
