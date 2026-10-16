import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
interface QuickAddFieldsProps {
  isDark: boolean
  type: 'income' | 'expense'
  setType: (type: 'income' | 'expense') => void
  setCategoryId: (id: string) => void
  setShowCategories: (open: boolean | ((value: boolean) => boolean)) => void
  amount: string
  setAmount: (value: string) => void
  amountInputRef: React.RefObject<HTMLInputElement | null>
  handleNumPadPress: (value: string) => void
  showCategories: boolean
  selectedCategory: { icon?: string; name: string } | undefined
  renderCategoryIcon: (iconId: string | undefined, className?: string) => React.ReactNode
  filteredCategories: { id: string; icon?: string; name: string }[]
  categoryId: string
  handleSelectCategory: (id: string) => void
  showMore: boolean
  setShowMore: (open: boolean | ((value: boolean) => boolean)) => void
  date: string
  setDate: (value: string) => void
  notes: string
  setNotes: (value: string) => void
  error: string
  loading: boolean
  handleSubmit: (event: React.FormEvent) => void
}
export function QuickAddDetails(props: QuickAddFieldsProps) {
  const { isDark, type, showCategories, setShowCategories, amount, selectedCategory, renderCategoryIcon, filteredCategories, categoryId, handleSelectCategory, showMore, setShowMore, date, setDate, notes, setNotes, error, loading } = props
  return (
    <>
                {/* Category Section */}
                <div className={`border-t border-[var(--line)]`}>
                  {/* Category Header - Clickable to expand/collapse */}
                  <button
                    type="button"
                    onClick={() => setShowCategories(!showCategories)}
                    className={`flex w-full items-center justify-between px-5 py-3 sm:px-6 text-[var(--muted)]`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold uppercase tracking-wider text-[var(--muted)]`}>
                        Category
                      </span>
                      {selectedCategory && !showCategories && (
                        <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          type === 'expense'
                            ? isDark ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-600'
                            : isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {renderCategoryIcon(selectedCategory.icon, 'h-3.5 w-3.5')}
                          <span>{selectedCategory.name}</span>
                        </span>
                      )}
                    </div>
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform duration-200 ${showCategories ? 'rotate-180' : ''} text-[var(--muted)]`}
                      strokeWidth={1.75}
                    />
                  </button>

                  {/* Category List - Expandable */}
                  <AnimatePresence>
                    {showCategories && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-2 overflow-x-auto px-5 pb-4 sm:flex-wrap sm:px-6">
                          {filteredCategories.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => handleSelectCategory(cat.id)}
                              className={`flex shrink-0 items-center gap-2 rounded-full border-2 px-3.5 py-2.5 transition-all duration-200 active:scale-95 ${
                                categoryId === cat.id
                                  ? type === 'expense'
                                    ? 'border-red-500 bg-red-500/10 text-red-500'
                                    : 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                                  : isDark
                                  ? 'border-[var(--line)] bg-[var(--surface)] text-[var(--text)]'
                                  : 'border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]'
                              }`}
                            >
                              {renderCategoryIcon(cat.icon, 'h-4 w-4')}
                              <span className="text-sm font-medium whitespace-nowrap">{cat.name}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Optional Fields Toggle */}
                <div className={`border-t border-[var(--line)]`}>
                  <button
                    type="button"
                    onClick={() => setShowMore(!showMore)}
                    className={`flex w-full items-center justify-between px-5 py-3 text-sm sm:px-6 text-[var(--muted)]`}
                  >
                    <span>Date & Notes</span>
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform duration-200 ${showMore ? 'rotate-180' : ''}`}
                      strokeWidth={1.75}
                    />
                  </button>

                  <AnimatePresence>
                    {showMore && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 px-5 pb-4 sm:px-6">
                          <div>
                            <label className={`mb-1.5 block text-xs font-medium text-[var(--muted)]`}>
                              Date
                            </label>
                            <input
                              type="date"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-all duration-200 border-[var(--line)] bg-[var(--surface)] text-[var(--text)] focus:border-primary-500`}
                            />
                          </div>
                          <div>
                            <label className={`mb-1.5 block text-xs font-medium text-[var(--muted)]`}>
                              Notes
                            </label>
                            <input
                              type="text"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Add a note..."
                              className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-all duration-200 border-[var(--line)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] focus:border-primary-500`}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {error && (
                  <p className="px-5 pb-3 text-sm text-red-500 sm:px-6">{error}</p>
                )}

                {/* Submit Button */}
                <div className="p-4 pt-2 sm:p-5 sm:pt-2">
                  <button
                    type="submit"
                    disabled={loading || !amount || !categoryId}
                    className={`btn-premium w-full rounded-2xl py-4 text-base font-bold shadow-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${
                      type === 'expense'
                        ? 'bg-red-500 text-white shadow-red-500/25'
                        : 'bg-emerald-500 text-white shadow-emerald-500/25'
                    }`}
                  >
                    {loading ? 'Adding...' : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}
                  </button>
                </div>
    </>
  )
}
