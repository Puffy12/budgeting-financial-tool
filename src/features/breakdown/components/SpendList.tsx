import { Link } from 'react-router-dom'
import { useTheme } from '../../../context/ThemeContext'
import type { Transaction } from '../../../types'
import { categorySpendPath } from '../breakdownLinks'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function showDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function SpendList({
  userId,
  transactions,
  from,
  to,
  empty,
}: {
  userId: string
  transactions: Transaction[]
  from?: string
  to?: string
  empty: string
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  if (transactions.length === 0) {
    return <p className="px-5 py-8 text-sm text-[var(--muted)]">{empty}</p>
  }
  return (
    <ul className="divide-y divide-[var(--line)]">
      {transactions.map((item) => {
        const category = item.category?.name || 'Uncategorized'
        const href = item.category?.id ? categorySpendPath(userId, item.category.id, from, to) : undefined
        return (
          <li key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 px-5 py-3.5 sm:px-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--text)]">{item.notes || category}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {showDate(item.date)}
                {href ? (
                  <>
                    {' · '}
                    <Link to={href} className="underline-offset-2 hover:underline">{category}</Link>
                  </>
                ) : ` · ${category}`}
              </p>
            </div>
            <p className={`shrink-0 text-sm font-semibold money tabular-nums ${item.type === 'income' ? isDark ? 'text-emerald-400' : 'text-emerald-600' : isDark ? 'text-red-400' : 'text-red-600'}`}>
              {item.type === 'income' ? '+' : '-'}{money.format(item.amount)}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
