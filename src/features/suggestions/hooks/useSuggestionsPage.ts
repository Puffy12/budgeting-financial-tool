import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { categoriesApi } from '../../categories/api'
import { monthEnd } from '../../breakdown/breakdownLinks'
import { usersApi } from '../../dashboard/api'
import { transactionsApi } from '../../transactions/api'
import type { Category, MonthlyData, Transaction } from '../../../types'
import { budgetsApi, type MonthlyBudget } from '../api'
import { averageSpend, budgetStanding, shiftMonth, sumCategoryExpenses, topExpenses } from '../suggestions.rules.ts'

export function useSuggestionsPage() {
  const { userId = '' } = useParams()
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [budget, setBudget] = useState<MonthlyBudget | null>(null)
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const start = shiftMonth(year, month, -5)
    const from = `${start.year}-${String(start.month).padStart(2, '0')}-01`
    try {
      const [months, budgets, cats, txs] = await Promise.all([
        usersApi.getMonthlyStats(userId, 6, { month: month - 1, year }),
        budgetsApi.list(userId),
        categoriesApi.getAll(userId),
        transactionsApi.getAll(userId, { type: 'expense', startDate: from, endDate: monthEnd(year, month) }),
      ])
      const current = budgets.find((item) => item.year === year && item.month === month) ?? null
      setMonthlyData(months)
      setCategories(cats)
      setTransactions(txs.transactions)
      setBudget(current)
      setAmount(current ? String(current.amount) : '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load suggestions')
    } finally {
      setLoading(false)
    }
  }, [userId, year, month])

  useEffect(() => { void load() }, [load])

  async function saveBudget() {
    const value = Number(amount)
    if (amount.trim() === '' || !Number.isFinite(value) || value < 0) {
      setError('Enter a monthly budget of zero or more.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const saved = await budgetsApi.save(userId, { year, month, amount: value })
      setBudget(saved)
      setAmount(String(saved.amount))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save budget')
    } finally {
      setSaving(false)
    }
  }

  const fullDate = `${year}-${String(month).padStart(2, '0')}`
  const spent = monthlyData.find((item) => item.fullDate === fullDate)?.expenses ?? 0
  const start = shiftMonth(year, month, -5)
  return {
    userId, year, month, loading, error, amount, setAmount, saving, saveBudget, spent, budget,
    standing: budgetStanding(spent, budget?.amount ?? 0),
    projection: averageSpend(monthlyData.map((item) => item.expenses)),
    categoryTotals: sumCategoryExpenses(monthlyData).slice(0, 5),
    spenders: topExpenses(transactions, 5),
    categories,
    from: `${start.year}-${String(start.month).padStart(2, '0')}-01`,
    to: monthEnd(year, month),
  }
}
