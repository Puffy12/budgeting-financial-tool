import {
  ShoppingCart,
  Home,
  Lightbulb,
  Car,
  Film,
  UtensilsCrossed,
  Stethoscope,
  ShoppingBag,
  Smartphone,
  Shield,
  BookOpen,
  Sparkles,
  Folder,
  Wallet,
  Laptop,
  TrendingUp,
  Gift,
  Banknote,
  Star,
  Gamepad2,
  Dumbbell,
  Plane,
  Music,
  Camera,
  PawPrint,
  Leaf,
  Coffee,
  Pizza,
  Cake,
  Pill,
  Wrench,
  Shirt,
  Gem,
  Palette,
  FileText,
  Building,
  CreditCard,
  Target,
  Briefcase,
  GraduationCap,
  Heart,
  Zap,
  Wifi,
  Baby,
  Bus,
  Fuel,
  Scissors,
  Wine,
  type LucideIcon,
} from 'lucide-react'

export interface CategoryIconOption {
  id: string
  name: string
  icon: LucideIcon
}

// Icon options for category picker
export const CATEGORY_ICONS: CategoryIconOption[] = [
  { id: 'shopping-cart', name: 'Shopping', icon: ShoppingCart },
  { id: 'home', name: 'Home', icon: Home },
  { id: 'lightbulb', name: 'Utilities', icon: Lightbulb },
  { id: 'car', name: 'Car', icon: Car },
  { id: 'film', name: 'Entertainment', icon: Film },
  { id: 'utensils', name: 'Dining', icon: UtensilsCrossed },
  { id: 'stethoscope', name: 'Healthcare', icon: Stethoscope },
  { id: 'shopping-bag', name: 'Shopping Bag', icon: ShoppingBag },
  { id: 'smartphone', name: 'Phone', icon: Smartphone },
  { id: 'shield', name: 'Insurance', icon: Shield },
  { id: 'book', name: 'Education', icon: BookOpen },
  { id: 'sparkles', name: 'Personal Care', icon: Sparkles },
  { id: 'folder', name: 'Other', icon: Folder },
  { id: 'wallet', name: 'Salary', icon: Wallet },
  { id: 'laptop', name: 'Tech', icon: Laptop },
  { id: 'trending-up', name: 'Investments', icon: TrendingUp },
  { id: 'gift', name: 'Gifts', icon: Gift },
  { id: 'banknote', name: 'Cash', icon: Banknote },
  { id: 'star', name: 'Rewards', icon: Star },
  { id: 'gamepad', name: 'Gaming', icon: Gamepad2 },
  { id: 'dumbbell', name: 'Fitness', icon: Dumbbell },
  { id: 'plane', name: 'Travel', icon: Plane },
  { id: 'music', name: 'Music', icon: Music },
  { id: 'camera', name: 'Photography', icon: Camera },
  { id: 'paw-print', name: 'Pets', icon: PawPrint },
  { id: 'leaf', name: 'Nature', icon: Leaf },
  { id: 'coffee', name: 'Coffee', icon: Coffee },
  { id: 'pizza', name: 'Food', icon: Pizza },
  { id: 'cake', name: 'Events', icon: Cake },
  { id: 'pill', name: 'Medicine', icon: Pill },
  { id: 'wrench', name: 'Repairs', icon: Wrench },
  { id: 'shirt', name: 'Clothing', icon: Shirt },
  { id: 'gem', name: 'Luxury', icon: Gem },
  { id: 'palette', name: 'Art', icon: Palette },
  { id: 'file-text', name: 'Documents', icon: FileText },
  { id: 'building', name: 'Business', icon: Building },
  { id: 'credit-card', name: 'Payments', icon: CreditCard },
  { id: 'target', name: 'Goals', icon: Target },
  { id: 'briefcase', name: 'Work', icon: Briefcase },
  { id: 'graduation-cap', name: 'Education', icon: GraduationCap },
  { id: 'heart', name: 'Health', icon: Heart },
  { id: 'zap', name: 'Energy', icon: Zap },
  { id: 'wifi', name: 'Internet', icon: Wifi },
  { id: 'baby', name: 'Kids', icon: Baby },
  { id: 'bus', name: 'Transport', icon: Bus },
  { id: 'fuel', name: 'Gas', icon: Fuel },
  { id: 'scissors', name: 'Grooming', icon: Scissors },
  { id: 'wine', name: 'Drinks', icon: Wine },
]

// Emoji to icon ID mapping for backward compatibility with existing categories
const EMOJI_TO_ICON_MAP: Record<string, string> = {
  '🛒': 'shopping-cart',
  '🏠': 'home',
  '💡': 'lightbulb',
  '🚗': 'car',
  '🎬': 'film',
  '🍽️': 'utensils',
  '🏥': 'stethoscope',
  '🛍️': 'shopping-bag',
  '📱': 'smartphone',
  '🛡️': 'shield',
  '📚': 'book',
  '💅': 'sparkles',
  '📋': 'folder',
  '💰': 'wallet',
  '💻': 'laptop',
  '📈': 'trending-up',
  '🎁': 'gift',
  '💵': 'banknote',
  '✨': 'star',
  '🎮': 'gamepad',
  '🏋️': 'dumbbell',
  '✈️': 'plane',
  '🎵': 'music',
  '📸': 'camera',
  '🐶': 'paw-print',
  '🌿': 'leaf',
  '☕': 'coffee',
  '🍕': 'pizza',
  '🎂': 'cake',
  '💊': 'pill',
  '🔧': 'wrench',
  '👕': 'shirt',
  '💎': 'gem',
  '🎨': 'palette',
  '📝': 'file-text',
  '🏦': 'building',
  '💳': 'credit-card',
  '🎯': 'target',
  '💼': 'briefcase',
  '🎓': 'graduation-cap',
  '❤️': 'heart',
  '⚡': 'zap',
  '📶': 'wifi',
  '👶': 'baby',
  '🚌': 'bus',
  '⛽': 'fuel',
  '✂️': 'scissors',
  '🍷': 'wine',
  '💸': 'wallet',
  '🔄': 'trending-up',
  '🏷️': 'folder',
  '⚙️': 'folder',
}

// Map icon ID to Lucide icon component
// Also handles emoji strings for backward compatibility
export const getIconById = (iconId: string): LucideIcon => {
  // First check if it's an emoji and map it to an icon ID
  const mappedId = EMOJI_TO_ICON_MAP[iconId] || iconId
  
  // Find the icon by ID
  const found = CATEGORY_ICONS.find(i => i.id === mappedId)
  return found?.icon || Folder
}

// Map icon ID to icon option
export const getIconOptionById = (iconId: string): CategoryIconOption => {
  // First check if it's an emoji and map it to an icon ID
  const mappedId = EMOJI_TO_ICON_MAP[iconId] || iconId
  
  const found = CATEGORY_ICONS.find(i => i.id === mappedId)
  return found || { id: 'folder', name: 'Other', icon: Folder }
}

// Check if a string is an emoji (for detection)
export const isEmoji = (str: string): boolean => {
  return /\p{Emoji}/u.test(str) && str.length <= 4
}

// Convert emoji to icon ID if needed
export const normalizeIconId = (iconId: string): string => {
  return EMOJI_TO_ICON_MAP[iconId] || iconId
}
