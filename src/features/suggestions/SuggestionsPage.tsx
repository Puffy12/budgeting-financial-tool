import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { categorySpendPath } from '../breakdown/breakdownLinks'
import { useSuggestionsPage } from './hooks/useSuggestionsPage'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const standingCopy = { unset: 'No budget', inside: 'Inside', close: 'Close', over: 'Over' }
const standingClass = { unset: 'bg-[var(--bg)] text-[var(--muted)]', inside: 'status-ok', close: 'status-warn', over: 'status-over' }

export default function SuggestionsPage() {
  const page = useSuggestionsPage()
  const title = new Date(page.year, page.month - 1, 15).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const next = new Date(page.year, page.month, 15).toLocaleDateString(undefined, { month: 'long' })

  return (
    <div className="p-4 pb-24 lg:p-8 lg:pb-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Experimental</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)]">Suggestions</h1>
      <p className="mt-1 max-w-2xl text-[var(--muted)]">A working look at {title}. The 80% line, the expense comparison, and the average projection are still open choices.</p>
      {page.loading ? <div className="mt-10 flex justify-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" /></div> : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="panel p-5 sm:p-6">
            <h2 className="text-base font-semibold text-[var(--text)]">Monthly budget</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">One total for {title}, compared with expenses.</p>
            <label className="mt-4 block text-sm font-medium text-[var(--muted)]" htmlFor="monthly-budget">Budget amount</label>
            <div className="mt-2 flex gap-3">
              <input id="monthly-budget" inputMode="decimal" value={page.amount} onChange={(event) => page.setAmount(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-base text-[var(--text)] focus:border-primary-500" placeholder="0" />
              <button type="button" onClick={() => void page.saveBudget()} disabled={page.saving} className="btn-premium shrink-0 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 px-4 py-3 text-base font-semibold text-white">{page.saving ? 'Saving' : 'Save'}</button>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-[var(--muted)]">Spent {money.format(page.spent)}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${standingClass[page.standing]}`}>{standingCopy[page.standing]}</span>
            </div>
          </section>
          <section className="panel p-5 sm:p-6">
            <h2 className="text-base font-semibold text-[var(--text)]">Estimated {next}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Average expenses across the six months shown.</p>
            <p className="mt-4 text-3xl font-bold money tabular-nums text-[var(--text)]">{money.format(page.projection)}</p>
            {page.budget ? <p className="mt-2 text-sm text-[var(--muted)]">Your {title} budget is {money.format(page.budget.amount)}.</p> : null}
          </section>
          <CategoryList page={page} />
          <SpenderList page={page} />
        </div>
      )}
      {page.error ? <p className="mt-4 text-sm text-red-500">{page.error}</p> : null}
    </div>
  )
}

function CategoryList({ page }: { page: ReturnType<typeof useSuggestionsPage> }) {
  return (
    <section className="panel p-5 sm:p-6">
      <h2 className="text-base font-semibold text-[var(--text)]">Largest categories</h2>
      <ul className="mt-4 divide-y divide-[var(--line)]">
        {page.categoryTotals.map((item) => {
          const category = page.categories.find((entry) => entry.name === item.name)
          return (
            <li key={item.name} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
              {category ? <Link to={categorySpendPath(page.userId, category.id, page.from, page.to)} className="truncate text-sm font-medium text-[var(--text)] underline-offset-2 hover:underline">{item.name}</Link> : <span className="truncate text-sm text-[var(--text)]">{item.name}</span>}
              <span className="shrink-0 text-sm font-semibold money tabular-nums text-[var(--text)]">{money.format(item.amount)}</span>
            </li>
          )
        })}
        {page.categoryTotals.length === 0 ? <li className="py-3 text-sm text-[var(--muted)]">No category spending in this window.</li> : null}
      </ul>
    </section>
  )
}

function SpenderList({ page }: { page: ReturnType<typeof useSuggestionsPage> }) {
  const { resolvedTheme } = useTheme()
  const amountClass = resolvedTheme === 'dark' ? 'text-red-400' : 'text-red-600'
  return (
    <section className="panel p-5 sm:p-6">
      <h2 className="text-base font-semibold text-[var(--text)]">Largest expenses</h2>
      <ul className="mt-4 divide-y divide-[var(--line)]">
        {page.spenders.map((item) => (
          <li key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--text)]">{item.notes || item.category?.name || 'Expense'}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{new Date(`${item.date}T12:00:00`).toLocaleDateString()} · {item.category?.name || 'Uncategorized'}</p>
            </div>
            <span className={`shrink-0 text-sm font-semibold money tabular-nums ${amountClass}`}>{money.format(item.amount)}</span>
          </li>
        ))}
        {page.spenders.length === 0 ? <li className="py-3 text-sm text-[var(--muted)]">No expenses in this window.</li> : null}
      </ul>
    </section>
  )
}
