import { Platform } from 'react-native';

// Основные цвета бренда SholpyAI (глубокий синий + золотой)
const BRAND_PRIMARY = '#1E3A8A';      // deep blue
const BRAND_SECONDARY = '#B68B40';    // bronze / gold
const BRAND_ACCENT = '#D4AF37';       // warm gold

// Светлая тема
const lightColors = {
  text: '#1A1F36',
  textSecondary: '#4B5563',
  background: '#FDFBF7',               // тёплый светлый фон
  surface: '#FFFFFF',
  border: '#E5E0D5',
  primary: BRAND_PRIMARY,
  secondary: BRAND_SECONDARY,
  accent: BRAND_ACCENT,
  error: '#DC2626',
  success: '#16A34A',
  // совместимость со старыми ключами
  tint: BRAND_PRIMARY,
  icon: '#6B7280',
  tabIconDefault: '#9CA3AF',
  tabIconSelected: BRAND_PRIMARY,
};

// Тёмная тема
const darkColors = {
  text: '#F3F4F6',
  textSecondary: '#D1D5DB',
  background: '#0B1120',
  surface: '#1E293B',
  border: '#334155',
  primary: '#3B82F6',                  // более яркий синий в тёмном режиме
  secondary: '#D4AF37',
  accent: '#EAB308',
  error: '#EF4444',
  success: '#22C55E',
  // совместимость
  tint: '#3B82F6',
  icon: '#9CA3AF',
  tabIconDefault: '#64748B',
  tabIconSelected: '#3B82F6',
};

export const Colors = {
  light: lightColors,
  dark: darkColors,
} as const;

export type ColorScheme = keyof typeof Colors;
export type AppColors = typeof Colors.light;

// Шрифты (оставлены как в оригинале, можно доработать под казахские гарнитуры)
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