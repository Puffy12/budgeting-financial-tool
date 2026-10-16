import { Pencil, Trash2 } from 'lucide-react'
import type { Transaction } from '../../../types'

interface Props {
  transactions: Transaction[]
  isDark: boolean
  openEditModal: (transaction: Transaction) => void
  handleDelete: (transactionId: string) => void
  formatCurrency: (amount: number) => string
  renderCategoryIcon: (iconId: string | undefined, className?: string) => React.ReactNode
}

export function TransactionDesktopTable({
  transactions, isDark, openEditModal, handleDelete, formatCurrency, renderCategoryIcon,
}: Props) {
  return (
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full">
              <thead>
                <tr className={`border-b border-[var(--line)]`}>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]`}>Category</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]`}>Date</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]`}>Notes</th>
                  <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[var(--muted)]`}>Amount</th>
                  <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[var(--muted)]`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-[var(--line)]`}>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className={`transition-colors hover:bg-[var(--bg)]`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg)]`}>
                          {renderCategoryIcon(transaction.category?.icon, `h-4 w-4 text-[var(--muted)]`)}
                        </div>
                        <span className={`font-medium text-[var(--text)]`}>
                          {transaction.category?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-[var(--muted)]`}>
                      {new Date(transaction.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className={`max-w-xs truncate px-6 py-4 text-[var(--muted)]`}>
                      {transaction.notes || '-'}
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold money tabular-nums ${
                      transaction.type === 'income'
                        ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                        : isDark ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(transaction)}
                          className={`rounded-lg p-2 transition-all duration-200 text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]`}
                        >
                          <Pencil className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className={`rounded-lg p-2 transition-all duration-200 ${
                            isDark ? 'text-[var(--muted)] hover:bg-red-500/15 hover:text-red-400' : 'text-[var(--muted)] hover:bg-red-50 hover:text-red-600'
                          }`}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
  )
}
