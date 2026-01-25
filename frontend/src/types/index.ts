export interface User {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  userId: string
  name: string
  type: 'income' | 'expense'
  icon: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  userId: string
  categoryId: string
  amount: number
  type: 'income' | 'expense'
  date: string
  notes: string
  isRecurring: boolean
  recurringId: string | null
  createdAt: string
  updatedAt: string
  category?: {
    id: string
    name: string
    icon: string
  }
}

export interface RecurringTransaction {
  id: string
  userId: string
  name: string
  categoryId: string
  amount: number
  type: 'income' | 'expense'
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  nextDueDate: string
  notes: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  category?: {
    id: string
    name: string
    icon: string
  }
}

export interface Summary {
  currentMonth: {
    income: number
    expenses: number
    difference: number
  }
  recurring: {
    monthlyExpenses: number
    monthlyIncome: number
    count: number
  }
  totals: {
    transactions: number
    income: number
    expenses: number
  }
}

export interface MonthlyData {
  month: string
  year: number
  fullDate: string
  income: number
  expenses: number
  difference: number
  transactionCount: number
  categoryBreakdown: Record<string, { income: number; expenses: number }>
}

export interface ComparisonData {
  label: string
  month: string
  year: number
  income: number
  expenses: number
  savings: number
  savingsRate: string | number
}

export type TransactionType = 'income' | 'expense'
export type Frequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
