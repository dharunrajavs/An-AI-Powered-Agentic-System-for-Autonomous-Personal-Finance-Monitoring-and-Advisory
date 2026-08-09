import {
  Car,
  CircleDollarSign,
  Coffee,
  Dumbbell,
  Film,
  HeartPulse,
  Home,
  LucideIcon,
  Plane,
  Repeat,
  ShoppingCart,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react-native';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Food & Drink': Coffee,
  Groceries: ShoppingCart,
  Transport: Car,
  Subscriptions: Repeat,
  Rent: Home,
  Shopping: ShoppingCart,
  Entertainment: Film,
  Utilities: Zap,
  Health: HeartPulse,
  Travel: Plane,
  Fitness: Dumbbell,
  'Personal Care': Sparkles,
  Income: Wallet,
};

export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? CircleDollarSign;
}
