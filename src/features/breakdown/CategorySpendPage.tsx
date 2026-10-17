import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { categoriesApi } from '../categories/api'
import { transactionsApi } from '../transactions/api'
import type { Transaction } from '../../types'
import { BackToBreakdown } from './components/BackToBreakdown'
import { SpendList } from './components/SpendList'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const day = /^\d{4}-\d{2}-\d{2}$/

export default function CategorySpendPage() {
  const { userId = '', categoryId = '' } = useParams()
  const [search] = useSearchParams()
  const from = search.get('from') || undefined
  const to = search.get('to') || undefined
  const [name, setName] = useState('Category')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    let cancel = false
    setLoading(true)
    const query = {
      categoryId,
      type: 'expense' as const,
      startDate: from && day.test(from) ? from : undefined,
      endDate: to && day.test(to) ? to : undefined,
    }
    Promise.all([
      categoriesApi.getById(userId, categoryId),
      transactionsApi.getAll(userId, query),
    ]).then(([category, result]) => {
      if (cancel) return
      setName(category.name)
      setTransactions(result.transactions)
    }).catch((err: unknown) => {
      if (!cancel) setError(err instanceof Error ? err.message : 'Failed to load this category')
    }).finally(() => { if (!cancel) setLoading(false) })
    return () => { cancel = true }
  }, [userId, categoryId, from, to])

  const total = transactions.reduce((sum, item) => sum + item.amount, 0)
  const range = from && to ? `${showDay(from)} – ${showDay(to)}` : 'All recorded expenses'

  return (
    <div className="p-4 pb-24 lg:p-8 lg:pb-8">
      <BackToBreakdown userId={userId} />
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--text)]">{name}</h1>
      <p className="mt-1 text-[var(--muted)]">{range}</p>
      {loading ? <div className="mt-10 flex justify-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" /></div> : error ? <p className="mt-6 text-sm text-red-500">{error}</p> : (
        <>
          <p className={`mt-6 text-xl font-bold money tabular-nums ${isDark ? 'text-red-300' : 'text-red-700'}`}>{money.format(total)}</p>
          <div className="panel mt-6">
            <SpendList userId={userId} transactions={transactions} from={from} to={to} empty="No expenses in this range." />
          </div>
        </>
      )}
    </div>
  )
}

function showDay(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
