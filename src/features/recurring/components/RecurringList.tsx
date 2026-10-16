import { motion } from 'framer-motion'
import { Folder, Pencil, Play, Trash2 } from 'lucide-react'
import type { RecurringTransaction } from '../../../types'
import { FREQUENCY_LABELS } from '../frequency'

interface Props {
  isDark: boolean
  loading: boolean
  filteredRecurring: RecurringTransaction[]
  formatCurrency: (amount: number) => string
  renderCategoryIcon: (iconId: string | undefined, className?: string) => React.ReactNode
  handleToggleActive: (rec: RecurringTransaction) => void
  handleProcess: (recurringId: string) => void
  openEditModal: (rec: RecurringTransaction) => void
  handleDelete: (recurringId: string) => void
}

export function RecurringList(props: Props) {
  const { isDark, loading, filteredRecurring, formatCurrency, renderCategoryIcon, handleToggleActive, handleProcess, openEditModal, handleDelete } = props
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }
  return filteredRecurring.length > 0 ? (
        <div className="space-y-3">
          {filteredRecurring.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
              className={`card-hover rounded-xl border p-4 transition-all ${
                rec.isActive
                  ? 'border-[var(--line)] bg-[var(--surface)]'
                  : isDark ? 'border-[var(--line)] bg-[var(--surface)]/70 opacity-60' : 'border-[var(--line)] bg-[var(--surface)] opacity-60'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    rec.type === 'expense'
                      ? isDark ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-600'
                      : isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {renderCategoryIcon(rec.category?.icon, 'h-6 w-6')}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-semibold text-[var(--text)]`}>{rec.name}</p>
                    <p className={`text-sm text-[var(--muted)]`}>
                      {rec.category?.name} · {FREQUENCY_LABELS[rec.frequency]}
                    </p>
                    <p className={`text-xs text-[var(--muted)]`}>
                      Next: {new Date(rec.nextDueDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <p className={`text-xl font-bold money tabular-nums ${
                    rec.type === 'expense'
                      ? isDark ? 'text-red-400' : 'text-red-600'
                      : isDark ? 'text-emerald-400' : 'text-emerald-600'
                  }`}>
                    {rec.type === 'expense' ? '-' : '+'}
                    {formatCurrency(rec.amount)}
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(rec)}
                      className={`rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
                        rec.isActive
                          ? isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                          : isDark ? 'bg-[var(--surface)] text-[var(--muted)]' : 'bg-[var(--bg)] text-[var(--muted)]'
                      }`}
                    >
                      {rec.isActive ? 'Active' : 'Off'}
                    </button>
                    <button
                      onClick={() => handleProcess(rec.id)}
                      className={`rounded-lg p-2.5 transition-all duration-200 ${
                        isDark ? 'text-[var(--muted)] hover:bg-blue-500/15 hover:text-blue-400' : 'text-[var(--muted)] hover:bg-blue-50 hover:text-blue-600'
                      }`}
                      title="Create transaction now"
                    >
                      <Play className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                    <button
                      onClick={() => openEditModal(rec)}
                      className={`rounded-lg p-2.5 transition-all duration-200 text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]`}
                    >
                      <Pencil className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                    <button
                      onClick={() => handleDelete(rec.id)}
                      className={`rounded-lg p-2.5 transition-all duration-200 ${
                        isDark ? 'text-[var(--muted)] hover:bg-red-500/15 hover:text-red-400' : 'text-[var(--muted)] hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className={`flex flex-col items-center justify-center gap-3 panel py-16 text-[var(--muted)]`}>
          <Folder className="h-10 w-10" strokeWidth={1.5} />
          <span className="text-sm">No recurring transactions yet.</span>
        </div>
      )
}
