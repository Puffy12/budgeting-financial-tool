import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Folder } from 'lucide-react'
import type { Transaction } from '../../../types'

interface Props {
  isDark: boolean
  recentTransactions: Transaction[]
  formatCurrency: (amount: number) => string
  renderCategoryIcon: (iconId: string | undefined, className?: string) => React.ReactNode
}

export function RecentTransactions(props: Props) {
  const { isDark, recentTransactions, formatCurrency, renderCategoryIcon } = props
  return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`card-hover panel`}
      >
        <div className={`flex items-center justify-between border-b px-5 py-4 sm:px-6 border-[var(--line)]`}>
          <h2 className={`text-base font-semibold tracking-tight sm:text-lg text-[var(--text)]`}>
            Recent Transactions
          </h2>
          <Link
            to="transactions"
            className="flex items-center gap-1.5 text-sm font-medium text-primary-500 transition-colors hover:text-primary-600"
          >
            View All
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className={`divide-y divide-[var(--line)]`}>
            {recentTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05, duration: 0.3 }}
                className={`flex items-center justify-between px-5 py-4 transition-colors sm:px-6 hover:bg-[var(--bg)]`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--bg)]`}>
                    {renderCategoryIcon(transaction.category?.icon, `h-5 w-5 text-[var(--muted)]`)}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-medium truncate text-[var(--text)]`}>
                      {transaction.category?.name || 'Unknown'}
                    </p>
                    <p className={`text-xs truncate text-[var(--muted)]`}>
                      {new Date(transaction.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {transaction.notes && ` · ${transaction.notes}`}
                    </p>
                  </div>
                </div>
                <p className={`font-semibold money tabular-nums whitespace-nowrap ${
                  transaction.type === 'income'
                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                    : isDark ? 'text-red-400' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={`flex flex-col items-center justify-center gap-3 py-16 text-[var(--muted)]`}>
            <Folder className="h-10 w-10" strokeWidth={1.5} />
            <span className="text-sm">No transactions yet. Use Quick Add to create one!</span>
          </div>
        )}
      </motion.div>
  )
}
