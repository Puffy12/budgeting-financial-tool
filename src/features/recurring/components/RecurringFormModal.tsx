import { AnimatePresence, motion } from 'framer-motion'
import { MenuSelect } from '../../../components/ui/Select'
import type { Category, Frequency, RecurringTransaction } from '../../../types'
import { FREQUENCY_LABELS } from '../frequency'

interface FormData {
  name: string
  amount: string
  type: 'income' | 'expense'
  categoryId: string
  frequency: Frequency
  startDate: string
  notes: string
}
interface Props {
  showModal: boolean
  isDark: boolean
  editingRecurring: RecurringTransaction | null
  formData: FormData
  setFormData: (data: FormData) => void
  setShowModal: (open: boolean) => void
  handleSubmit: (event: React.FormEvent) => void
  filteredCategories: Category[]
}

export function RecurringFormModal(props: Props) {
  const { showModal, isDark, editingRecurring, formData, setFormData, setShowModal, handleSubmit, filteredCategories } = props
  return (
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl p-6 safe-area-bottom sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[85vh] sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl bg-[var(--surface)]`}
            >
              <div className={`absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full sm:hidden ${isDark ? 'bg-[var(--surface)]' : 'bg-[var(--line)]'}`} />
              
              <h2 className={`mb-6 pt-2 text-xl font-semibold tracking-tight sm:pt-0 text-[var(--text)]`}>
                {editingRecurring ? 'Edit Recurring' : 'Add Recurring'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type Toggle */}
                <div className={`flex gap-1 rounded-xl p-1 bg-[var(--bg)]`}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense', categoryId: '' })}
                    className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all duration-200 ${
                      formData.type === 'expense'
                        ? isDark ? 'bg-[var(--surface)] text-red-400 shadow-sm' : 'bg-[var(--surface)] text-red-600 shadow-sm'
                        : 'text-[var(--muted)]'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income', categoryId: '' })}
                    className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all duration-200 ${
                      formData.type === 'income'
                        ? isDark ? 'bg-[var(--surface)] text-emerald-400 shadow-sm' : 'bg-[var(--surface)] text-emerald-600 shadow-sm'
                        : 'text-[var(--muted)]'
                    }`}
                  >
                    Income
                  </button>
                </div>

                {/* Name & Amount */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={`mb-2 block text-sm font-medium text-[var(--muted)]`}>Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 border-[var(--line)] bg-[var(--surface)] text-[var(--text)] focus:border-primary-500`}
                      placeholder="Netflix"
                      required
                    />
                  </div>
                  <div>
                    <label className={`mb-2 block text-sm font-medium text-[var(--muted)]`}>Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 border-[var(--line)] bg-[var(--surface)] text-[var(--text)] focus:border-primary-500`}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* Category & Frequency */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={`mb-2 block text-sm font-medium text-[var(--muted)]`}>Category</label>
                    <MenuSelect
                      ariaLabel="Category"
                      placeholder="Select"
                      value={formData.categoryId}
                      onChange={(categoryId) => setFormData({ ...formData, categoryId })}
                      options={filteredCategories.map((cat) => ({ value: cat.id, label: cat.name }))}
                    />
                  </div>
                  <div>
                    <label className={`mb-2 block text-sm font-medium text-[var(--muted)]`}>Frequency</label>
                    <MenuSelect
                      ariaLabel="Frequency"
                      value={formData.frequency}
                      onChange={(frequency) => setFormData({ ...formData, frequency: frequency as Frequency })}
                      options={Object.entries(FREQUENCY_LABELS).map(([value, label]) => ({ value, label }))}
                    />
                  </div>
                </div>

                {/* Start Date (only for new) */}
                {!editingRecurring && (
                  <div>
                    <label className={`mb-2 block text-sm font-medium text-[var(--muted)]`}>Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 border-[var(--line)] bg-[var(--surface)] text-[var(--text)] focus:border-primary-500`}
                      required
                    />
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className={`mb-2 block text-sm font-medium text-[var(--muted)]`}>Notes (optional)</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 border-[var(--line)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] focus:border-primary-500`}
                    placeholder="Add a note..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`flex-1 rounded-xl border py-3.5 font-medium transition-all duration-200 active:scale-[0.98] ${
                      isDark ? 'border-[var(--line)] text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]' : 'border-[var(--line)] text-[var(--muted)] hover:bg-[var(--bg)]'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-premium flex-1 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-3.5 font-medium text-white shadow-lg shadow-primary-500/25"
                  >
                    {editingRecurring ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
  )
}
