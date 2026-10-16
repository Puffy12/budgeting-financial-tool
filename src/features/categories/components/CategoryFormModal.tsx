import { AnimatePresence, motion } from 'framer-motion'
import { CATEGORY_ICONS } from '../../../lib/categoryIcons'

interface FormData { name: string; type: 'income' | 'expense'; icon: string }

interface Props {
  showModal: boolean
  isDark: boolean
  editingCategory: { id: string } | null
  formData: FormData
  setFormData: (data: FormData) => void
  setShowModal: (open: boolean) => void
  handleSubmit: (event: React.FormEvent) => void
  error: string
}

export function CategoryFormModal(props: Props) {
  const { showModal, isDark, editingCategory, formData, setFormData, setShowModal, handleSubmit, error } = props
  return (
    <>
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
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Type Toggle */}
                <div className={`flex gap-1 rounded-xl p-1 bg-[var(--bg)]`}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
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
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all duration-200 ${
                      formData.type === 'income'
                        ? isDark ? 'bg-[var(--surface)] text-emerald-400 shadow-sm' : 'bg-[var(--surface)] text-emerald-600 shadow-sm'
                        : 'text-[var(--muted)]'
                    }`}
                  >
                    Income
                  </button>
                </div>

                {/* Name */}
                <div>
                  <label className={`mb-2 block text-sm font-medium text-[var(--muted)]`}>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full rounded-xl border px-4 py-3.5 transition-all duration-200 border-[var(--line)] bg-[var(--surface)] text-[var(--text)] focus:border-primary-500`}
                    placeholder="Category name"
                    required
                  />
                </div>

                {/* Icon Picker */}
                <div>
                  <label className={`mb-2 block text-sm font-medium text-[var(--muted)]`}>Icon</label>
                  <div className={`grid grid-cols-6 gap-2 rounded-xl border p-3 sm:grid-cols-8 border-[var(--line)] bg-[var(--surface)]`}>
                    {CATEGORY_ICONS.map((iconOption) => {
                      const IconComponent = iconOption.icon
                      return (
                        <button
                          key={iconOption.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: iconOption.id })}
                          className={`flex h-11 w-full items-center justify-center rounded-lg transition-all duration-200 active:scale-90 ${
                            formData.icon === iconOption.id
                              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                              : 'bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]'
                          }`}
                          title={iconOption.name}
                        >
                          <IconComponent className="h-5 w-5" strokeWidth={1.75} />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

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
                    {editingCategory ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
