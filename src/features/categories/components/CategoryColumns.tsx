import { motion } from 'framer-motion'
import { ArrowDownCircle, ArrowUpCircle, Folder, Pencil, Trash2 } from 'lucide-react'
import type { Category } from '../../../types'

interface Props {
  isDark: boolean
  filter: 'all' | 'income' | 'expense'
  expenseCategories: Category[]
  incomeCategories: Category[]
  filteredCategories: Category[]
  renderCategoryIcon: (iconId: string, className?: string) => React.ReactNode
  openEditModal: (category: Category) => void
  handleDelete: (categoryId: string) => void
}

export function CategoryColumns(props: Props) {
  const { isDark, filter, expenseCategories, incomeCategories, filteredCategories, renderCategoryIcon, openEditModal, handleDelete } = props
  return (
    <div className="space-y-8">
          {/* Expense Categories */}
          {(filter === 'all' || filter === 'expense') && expenseCategories.length > 0 && (
            <div>
              <h2 className={`mb-4 flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]`}>
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${isDark ? 'bg-red-500/15' : 'bg-red-100'}`}>
                  <ArrowDownCircle className={`h-4 w-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} strokeWidth={2} />
                </div>
                Expense Categories
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {expenseCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.3 }}
                    className={`card-hover flex items-center justify-between rounded-xl border p-4 border-[var(--line)] bg-[var(--surface)]`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        isDark ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-600'
                      }`}>
                        {renderCategoryIcon(category.icon, 'h-5 w-5')}
                      </div>
                      <span className={`font-medium text-[var(--text)]`}>{category.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(category)}
                        className={`rounded-lg p-2.5 transition-all duration-200 text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]`}
                      >
                        <Pencil className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className={`rounded-lg p-2.5 transition-all duration-200 ${
                          isDark ? 'text-[var(--muted)] hover:bg-red-500/15 hover:text-red-400' : 'text-[var(--muted)] hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Income Categories */}
          {(filter === 'all' || filter === 'income') && incomeCategories.length > 0 && (
            <div>
              <h2 className={`mb-4 flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]`}>
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${isDark ? 'bg-emerald-500/15' : 'bg-emerald-100'}`}>
                  <ArrowUpCircle className={`h-4 w-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} strokeWidth={2} />
                </div>
                Income Categories
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {incomeCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.3 }}
                    className={`card-hover flex items-center justify-between rounded-xl border p-4 border-[var(--line)] bg-[var(--surface)]`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {renderCategoryIcon(category.icon, 'h-5 w-5')}
                      </div>
                      <span className={`font-medium text-[var(--text)]`}>{category.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(category)}
                        className={`rounded-lg p-2.5 transition-all duration-200 text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]`}
                      >
                        <Pencil className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className={`rounded-lg p-2.5 transition-all duration-200 ${
                          isDark ? 'text-[var(--muted)] hover:bg-red-500/15 hover:text-red-400' : 'text-[var(--muted)] hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {filteredCategories.length === 0 && (
            <div className={`flex flex-col items-center justify-center gap-3 panel py-16 text-[var(--muted)]`}>
              <Folder className="h-10 w-10" strokeWidth={1.5} />
              <span className="text-sm">No categories found. Add one to get started!</span>
            </div>
          )}
    </div>
  )
}
