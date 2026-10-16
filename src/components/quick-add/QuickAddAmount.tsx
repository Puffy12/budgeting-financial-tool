import { Delete } from 'lucide-react'
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
export function QuickAddAmount(props: QuickAddFieldsProps) {
  const { isDark, type, setType, setCategoryId, setShowCategories, amount, setAmount, amountInputRef, handleNumPadPress } = props
  return (
    <>
                {/* Type Toggle */}
                <div className={`mx-5 flex gap-1 rounded-2xl p-1 sm:mx-6 bg-[var(--bg)]`}>
                  <button
                    type="button"
                    onClick={() => { setType('expense'); setCategoryId(''); setShowCategories(true) }}
                    className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${
                      type === 'expense'
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                        : 'text-[var(--muted)]'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => { setType('income'); setCategoryId(''); setShowCategories(true) }}
                    className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${
                      type === 'income'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'text-[var(--muted)]'
                    }`}
                  >
                    Income
                  </button>
                </div>

                {/* Amount Display - Mobile */}
                <div className="px-5 py-6 text-center sm:hidden">
                  <div className={`money text-4xl font-bold tabular-nums tracking-tight ${
                    type === 'expense' 
                      ? isDark ? 'text-red-400' : 'text-red-500'
                      : isDark ? 'text-emerald-400' : 'text-emerald-500'
                  }`}>
                    ${amount || '0'}
                  </div>
                </div>

                {/* Amount Input - Desktop */}
                <div className="hidden px-5 py-6 sm:block sm:px-6">
                  <label className={`mb-2 block text-xs font-medium text-[var(--muted)]`}>
                    Amount
                  </label>
                  <div className="relative">
                    <span className={`money absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold ${
                      type === 'expense'
                        ? isDark ? 'text-red-400' : 'text-red-500'
                        : isDark ? 'text-emerald-400' : 'text-emerald-500'
                    }`}>$</span>
                    <input
                      ref={amountInputRef}
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className={`w-full rounded-xl border py-4 pl-10 pr-4 money text-2xl font-bold tabular-nums transition-all duration-200 border-[var(--line)] bg-[var(--surface)] focus:border-primary-500 ${
                        type === 'expense'
                          ? isDark ? 'text-red-400' : 'text-red-500'
                          : isDark ? 'text-emerald-400' : 'text-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Number Pad - Mobile Only */}
                <div className="grid grid-cols-3 gap-1.5 px-4 pb-3 sm:hidden">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleNumPadPress(key)}
                      className="flex h-14 items-center justify-center rounded-xl bg-[var(--bg)] text-lg font-semibold text-[var(--text)] transition-all active:scale-95 active:bg-[var(--surface)]"
                    >
                      {key === 'backspace' ? (
                        <Delete className="h-5 w-5" strokeWidth={1.75} />
                      ) : key}
                    </button>
                  ))}
                </div>

    </>
  )
}
