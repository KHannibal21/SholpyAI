// components/ui/icon-symbol.tsx
// Fallback for using MaterialIcons on Android and web.
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Mapping SF Symbols names to Material Icons names.
 * SF Symbols are used on iOS, Material Icons on Android/Web.
 */
const MAPPING = {
  // --- Навигация и общие ---
  'house.fill': 'home',
  'person.fill': 'person',
  'heart.fill': 'favorite',
  'sparkles': 'auto-awesome',
  'message.fill': 'chat',
  'questionmark.circle.fill': 'quiz',
  'paperplane.fill': 'send',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.up': 'keyboard-arrow-up',
  'chevron.down': 'keyboard-arrow-down',
  'chevron.left.forwardslash.chevron.right': 'code',
  'arrow.counterclockwise': 'refresh',
  'trash': 'delete',
  'checkmark': 'check',
  'checkmark.circle.fill': 'check-circle',
  'xmark.circle.fill': 'cancel',
  'exclamationmark.triangle.fill': 'warning',

  // --- Поэт (биография, произведения) ---
  'book.fill': 'menu-book',
  'flag.fill': 'flag',
  'pencil.fill': 'edit',
  'shield.fill': 'security',
  'water.fill': 'water-drop',
  'person.3.fill': 'people',

  // --- Шолпы, плеер ---
  'music.note': 'music-note',
  'play.fill': 'play-arrow',
  'pause.fill': 'pause',
  'gobackward': 'replay-10',
  'goforward': 'forward-10',
  'lightbulb.fill': 'lightbulb',

  // --- Рекомендации, чек-лист ---
  'calendar': 'calendar-today',
  'apps': 'apps',
  'network': 'wifi',
  'checklist': 'checklist',
  'star.fill': 'star',

  // Запасной вариант для неизвестных
  'questionmark': 'help',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name] || 'help';
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}