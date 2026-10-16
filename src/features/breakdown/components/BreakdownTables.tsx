import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Category, MonthlyData } from '../../../types'
import { categorySpendPath, monthBreakdownPath } from '../breakdownLinks'

interface Props {
  isDark: boolean
  userId: string
  range: { from?: string; to?: string }
  monthlyData: MonthlyData[]
  totalIncome: number
  totalExpenses: number
  totalDifference: number
  formatCurrency: (amount: number) => string
  sortedCategories: [string, number][]
  categories: Category[]
  pieColors: string[]
  renderCategoryIcon: (iconId: string | undefined, className?: string) => React.ReactNode
}

export function MonthlyBreakdownTable(props: Props) {
  const { isDark, monthlyData, totalIncome, totalExpenses, totalDifference, formatCurrency } = props
  return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.3 }}
            className={`card-hover panel`}>
            <div className={`border-b px-5 py-4 sm:px-6 border-[var(--line)]`}>
              <h2 className={`text-base font-semibold tracking-tight sm:text-lg text-[var(--text)]`}>Monthly Breakdown</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">Open a month to see each transaction.</p>
            </div>

            {/* Mobile Card View */}
            <div className={`divide-y sm:hidden divide-[var(--line)]`}>
              {monthlyData.map((month) => (
                <Link key={month.fullDate} to={monthBreakdownPath(props.userId, month.fullDate)} className="block px-5 py-3.5 hover:bg-[var(--bg)]">
                  <p className={`mb-2 text-sm font-semibold text-[var(--text)]`}>{month.month} {month.year}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs money tabular-nums ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>+{formatCurrency(month.income)}</span>
                    <span className={`text-xs money tabular-nums ${isDark ? 'text-red-400' : 'text-red-600'}`}>-{formatCurrency(month.expenses)}</span>
                    <span className={`text-xs font-semibold money tabular-nums ${month.difference >= 0 ? isDark ? 'text-emerald-400' : 'text-emerald-600' : isDark ? 'text-red-400' : 'text-red-600'}`}>{formatCurrency(month.difference)}</span>
                  </div>
                </Link>
              ))}
              <div className="bg-[var(--bg)] px-5 py-3.5">
                <p className={`mb-2 text-sm font-semibold text-[var(--text)]`}>Total</p>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-semibold money tabular-nums ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>+{formatCurrency(totalIncome)}</span>
                  <span className={`text-xs font-semibold money tabular-nums ${isDark ? 'text-red-400' : 'text-red-600'}`}>-{formatCurrency(totalExpenses)}</span>
                  <span className={`text-xs font-bold money tabular-nums ${totalDifference >= 0 ? isDark ? 'text-emerald-400' : 'text-emerald-600' : isDark ? 'text-red-400' : 'text-red-600'}`}>{formatCurrency(totalDifference)}</span>
                </div>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full">
                <thead>
                  <tr className={`border-b border-[var(--line)]`}>
                    <th className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider sm:px-6 text-[var(--muted)]`}>Month</th>
                    <th className={`px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider sm:px-6 text-[var(--muted)]`}>Income</th>
                    <th className={`px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider sm:px-6 text-[var(--muted)]`}>Expenses</th>
                    <th className={`px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider sm:px-6 text-[var(--muted)]`}>Net</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-[var(--line)]`}>
                  {monthlyData.map((month) => (
                    <tr key={month.fullDate} className={`transition-colors hover:bg-[var(--bg)]`}>
                      <td className={`px-5 py-3.5 font-medium sm:px-6 text-[var(--text)]`}><Link to={monthBreakdownPath(props.userId, month.fullDate)} className="underline-offset-2 hover:underline">{month.month} {month.year}</Link></td>
                      <td className={`px-5 py-3.5 text-right money tabular-nums sm:px-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{formatCurrency(month.income)}</td>
                      <td className={`px-5 py-3.5 text-right money tabular-nums sm:px-6 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{formatCurrency(month.expenses)}</td>
                      <td className={`px-5 py-3.5 text-right font-medium money tabular-nums sm:px-6 ${month.difference >= 0 ? isDark ? 'text-emerald-400' : 'text-emerald-600' : isDark ? 'text-red-400' : 'text-red-600'}`}>
                        {formatCurrency(month.difference)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[var(--bg)]">
                    <td className={`px-5 py-3.5 font-semibold sm:px-6 text-[var(--text)]`}>Total</td>
                    <td className={`px-5 py-3.5 text-right font-semibold money tabular-nums sm:px-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{formatCurrency(totalIncome)}</td>
                    <td className={`px-5 py-3.5 text-right font-semibold money tabular-nums sm:px-6 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{formatCurrency(totalExpenses)}</td>
                    <td className={`px-5 py-3.5 text-right font-semibold money tabular-nums sm:px-6 ${totalDifference >= 0 ? isDark ? 'text-emerald-400' : 'text-emerald-600' : isDark ? 'text-red-400' : 'text-red-600'}`}>
                      {formatCurrency(totalDifference)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>
  )
}

export function CategoryBreakdownTable(props: Props) {
  const { sortedCategories, categories, pieColors, totalExpenses, formatCurrency, renderCategoryIcon } = props
  if (sortedCategories.length === 0) return null
  return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.3 }}
              className={`mt-6 card-hover panel`}>
              <div className={`border-b px-5 py-4 sm:px-6 border-[var(--line)]`}>
                <h2 className={`text-base font-semibold tracking-tight sm:text-lg text-[var(--text)]`}>Category Breakdown</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">Open a category to see where and when it was spent.</p>
              </div>
              {/* Mobile Card View */}
              <div className={`divide-y sm:hidden divide-[var(--line)]`}>
                {sortedCategories.map(([name, amount], idx) => {
                  const category = categories.find(c => c.name === name)
                  const href = category ? categorySpendPath(props.userId, category.id, props.range.from, props.range.to) : undefined
                  const body = (
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: pieColors[idx % pieColors.length] }} />
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg)]`}>
                          {renderCategoryIcon(category?.icon, `h-4 w-4 text-[var(--muted)]`)}
                        </div>
                        <span className="truncate text-sm font-medium text-[var(--text)]">{name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 pl-3">
                        <span className={`text-sm font-semibold money tabular-nums text-[var(--text)]`}>{formatCurrency(amount)}</span>
                        <span className={`text-xs tabular-nums text-[var(--muted)]`}>
                          {totalExpenses > 0 ? (amount / totalExpenses * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </>
                  )
                  return href
                    ? <Link key={name} to={href} className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--bg)]">{body}</Link>
                    : <div key={name} className="flex items-center justify-between px-5 py-3.5">{body}</div>
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b border-[var(--line)]`}>
                      <th className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider sm:px-6 text-[var(--muted)]`}>Category</th>
                      <th className={`px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider sm:px-6 text-[var(--muted)]`}>Total</th>
                      <th className={`px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider sm:px-6 text-[var(--muted)]`}>%</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-[var(--line)]`}>
                    {sortedCategories.map(([name, amount], idx) => {
                      const category = categories.find(c => c.name === name)
                      return (
                        <tr key={name} className={`transition-colors hover:bg-[var(--bg)]`}>
                          <td className="px-5 py-3.5 sm:px-6">
                            <div className="flex items-center gap-3">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pieColors[idx % pieColors.length] }} />
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg)]`}>
                                {renderCategoryIcon(category?.icon, `h-4 w-4 text-[var(--muted)]`)}
                              </div>
                              {category ? <Link to={categorySpendPath(props.userId, category.id, props.range.from, props.range.to)} className="font-medium text-[var(--text)] underline-offset-2 hover:underline">{name}</Link> : <span className="font-medium text-[var(--text)]">{name}</span>}
                            </div>
                          </td>
                          <td className={`px-5 py-3.5 text-right money tabular-nums sm:px-6 text-[var(--text)]`}>{formatCurrency(amount)}</td>
                          <td className={`px-5 py-3.5 text-right tabular-nums sm:px-6 text-[var(--muted)]`}>
                            {totalExpenses > 0 ? (amount / totalExpenses * 100).toFixed(1) : 0}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
  )
}
