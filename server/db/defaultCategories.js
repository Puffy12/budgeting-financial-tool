// Icon IDs correspond to Lucide icons in src/lib/categoryIcons.ts
const DEFAULT_CATEGORIES = [
  { name: 'Groceries', type: 'expense', icon: 'shopping-cart' },
  { name: 'Rent', type: 'expense', icon: 'home' },
  { name: 'Utilities', type: 'expense', icon: 'lightbulb' },
  { name: 'Transportation', type: 'expense', icon: 'car' },
  { name: 'Entertainment', type: 'expense', icon: 'film' },
  { name: 'Dining Out', type: 'expense', icon: 'utensils' },
  { name: 'Healthcare', type: 'expense', icon: 'stethoscope' },
  { name: 'Shopping', type: 'expense', icon: 'shopping-bag' },
  { name: 'Subscriptions', type: 'expense', icon: 'smartphone' },
  { name: 'Insurance', type: 'expense', icon: 'shield' },
  { name: 'Education', type: 'expense', icon: 'book' },
  { name: 'Personal Care', type: 'expense', icon: 'sparkles' },
  { name: 'Other Expense', type: 'expense', icon: 'folder' },
  { name: 'Salary', type: 'income', icon: 'wallet' },
  { name: 'Freelance', type: 'income', icon: 'laptop' },
  { name: 'Investments', type: 'income', icon: 'trending-up' },
  { name: 'Gifts', type: 'income', icon: 'gift' },
  { name: 'Refunds', type: 'income', icon: 'banknote' },
  { name: 'Other Income', type: 'income', icon: 'star' },
];

function getDefaultCategories() {
  return DEFAULT_CATEGORIES;
}

module.exports = { getDefaultCategories };
