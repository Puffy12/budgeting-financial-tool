// Experimental readings. The product has not locked these formulas.

export function shiftMonth(year: number, month: number, delta: number) {
  const index = year * 12 + (month - 1) + delta
  return { year: Math.floor(index / 12), month: (index % 12) + 1 }
}

export function budgetStanding(spent: number, budget: number) {
  if (!(budget > 0)) return 'unset' as const
  const ratio = spent / budget
  if (ratio > 1) return 'over' as const
  if (ratio >= 0.8) return 'close' as const
  return 'inside' as const
}

export function averageSpend(amounts: number[]) {
  if (amounts.length === 0) return 0
  return amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
}

export function sumCategoryExpenses(months: Array<{ categoryBreakdown?: Record<string, { expenses?: number }> }>) {
  const totals = new Map<string, number>()
  for (const month of months) {
    for (const [name, values] of Object.entries(month.categoryBreakdown || {})) {
      totals.set(name, (totals.get(name) || 0) + (values.expenses || 0))
    }
  }
  return [...totals.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
}

export function topExpenses<T extends { type: string; amount: number; date: string }>(transactions: T[], limit = 5) {
  return transactions
    .filter((item) => item.type === 'expense')
    .slice()
    .sort((a, b) => b.amount - a.amount || b.date.localeCompare(a.date))
    .slice(0, limit)
}
