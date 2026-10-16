import { LayoutDashboard, Receipt, RefreshCw, Settings, Tags, TrendingUp } from 'lucide-react'

export const navItems = [
  { path: '', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: 'transactions', label: 'Transactions', icon: Receipt },
  { path: 'recurring', label: 'Recurring', icon: RefreshCw },
  { path: 'breakdown', label: 'Breakdown', icon: TrendingUp },
  { path: 'categories', label: 'Categories', icon: Tags },
  { path: 'settings', label: 'Settings', icon: Settings },
]
