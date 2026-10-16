import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { transactionsApi } from '../transactions/api'
import type { Transaction } from '../../types'
import { monthEnd } from './breakdownLinks'
import { SpendList } from './components/SpendList'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function MonthBreakdownPage() {
  const { userId = '', year = '', month = '' } = useParams()
  const yearNumber = Number(year)
  const monthNumber = Number(month)
  const valid = /^\d{4}$/.test(year) && monthNumber >= 1 && monthNumber <= 12
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    if (!valid) {
      setLoading(false)
      setError('That month is not available.')
      return
    }
    let cancel = false
    setLoading(true)
    transactionsApi.getAll(userId, { month: monthNumber - 1, year: yearNumber })
      .then((result) => { if (!cancel) setTransactions(result.transactions) })
      .catch((err: unknown) => { if (!cancel) setError(err instanceof Error ? err.message : 'Failed to load this month') })
      .finally(() => { if (!cancel) setLoading(false) })
    return () => { cancel = true }
  }, [userId, valid, monthNumber, yearNumber])

  const title = valid
    ? new Date(yearNumber, monthNumber - 1, 15).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : 'Month'
  const expenses = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)
  const income = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0)
  const from = valid ? `${year}-${String(monthNumber).padStart(2, '0')}-01` : undefined
  const to = valid ? monthEnd(yearNumber, monthNumber) : undefined

  return (
    <div className="p-4 pb-24 lg:p-8 lg:pb-8">
      <Link to={`/app/${userId}/breakdown`} className="text-sm font-medium text-[var(--muted)] underline-offset-2 hover:underline">Breakdown</Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--text)]">{title}</h1>
      <p className="mt-1 text-[var(--muted)]">Every transaction in this month.</p>
      {loading ? <div className="mt-10 flex justify-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" /></div> : error ? <p className="mt-6 text-sm text-red-500">{error}</p> : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-emerald-500/8 p-4 accent-income">
              <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Income</p>
              <p className={`mt-1 text-xl font-bold money tabular-nums ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>{money.format(income)}</p>
            </div>
            <div className="rounded-xl bg-red-500/8 p-4 accent-expense">
              <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-red-300' : 'text-red-700'}`}>Expenses</p>
              <p className={`mt-1 text-xl font-bold money tabular-nums ${isDark ? 'text-red-300' : 'text-red-700'}`}>{money.format(expenses)}</p>
            </div>
          </div>
          <div className="panel mt-6">
            <SpendList userId={userId} transactions={transactions} from={from} to={to} empty="No transactions in this month." />
          </div>
        </>
      )}
    </div>
  )
}
