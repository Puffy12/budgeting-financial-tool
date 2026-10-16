import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Pencil, Trash2 } from 'lucide-react'
import type { Transaction } from '../../../types'

interface Props {
  transactions: Transaction[]
  isDark: boolean
  expandedId: string | null
  toggleExpand: (id: string) => void
  openEditModal: (transaction: Transaction) => void
  handleDelete: (transactionId: string) => void
  formatCurrency: (amount: number) => string
  renderCategoryIcon: (iconId: string | undefined, className?: string) => React.ReactNode
}

export function TransactionMobileList({
  transactions, isDark, expandedId, toggleExpand, openEditModal, handleDelete, formatCurrency, renderCategoryIcon,
}: Props) {
  return (
    <div className={`divide-y lg:hidden divide-[var(--line)]`}>
      {transactions.map((transaction) => (
              <div key={transaction.id}>
                {/* Main Row - Tappable */}
                <button
                  onClick={() => toggleExpand(transaction.id)}
                  className={`flex w-full items-center justify-between p-4 text-left transition-colors ${
                    expandedId === transaction.id
                      ? isDark ? 'bg-[var(--surface)]/70' : 'bg-[var(--surface)]'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--bg)]`}>
                      {renderCategoryIcon(transaction.category?.icon, `h-5 w-5 text-[var(--muted)]`)}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-medium text-[var(--text)]`}>
                        {transaction.category?.name || 'Unknown'}
                      </p>
                      <p className={`text-xs text-[var(--muted)]`}>
                        {new Date(transaction.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold money tabular-nums ${
                      transaction.type === 'income'
                        ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                        : isDark ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform duration-200 ${
                        expandedId === transaction.id ? 'rotate-180' : ''
                      } text-[var(--muted)]`}
                      strokeWidth={1.75}
                    />
                  </div>
                </button>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === transaction.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-[var(--line)] bg-[var(--bg)] px-4 pb-4 pt-3">
                        {/* Details Grid */}
                        <div className="mb-4 space-y-2">
                          <div className="flex justify-between">
                            <span className={`text-sm text-[var(--muted)]`}>Date</span>
                            <span className={`text-sm font-medium text-[var(--text)]`}>
                              {new Date(transaction.date + 'T12:00:00').toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`text-sm text-[var(--muted)]`}>Type</span>
                            <span className={`text-sm font-medium capitalize ${
                              transaction.type === 'income' 
                                ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                : isDark ? 'text-red-400' : 'text-red-600'
                            }`}>
                              {transaction.type}
                            </span>
                          </div>
                          {transaction.notes && (
                            <div className="flex justify-between gap-4">
                              <span className={`shrink-0 text-sm text-[var(--muted)]`}>Notes</span>
                              <span className={`text-right text-sm text-[var(--muted)]`}>
                                {transaction.notes}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(transaction)}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-medium transition-all active:scale-[0.98] ${
                              isDark 
                                ? 'bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--bg)]' 
                                : 'bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--bg)] border border-[var(--line)]'
                            }`}
                          >
                            <Pencil className="h-4 w-4" strokeWidth={1.75} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-medium transition-all active:scale-[0.98] ${
                              isDark 
                                ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25' 
                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                            }`}
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
    </div>
  )
}
