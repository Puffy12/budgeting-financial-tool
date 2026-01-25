import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { useTheme } from '../context/ThemeContext'
import { categoriesApi, transactionsApi } from '../api'
import type { Category, TransactionType } from '../types'

interface QuickAddModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function QuickAddModal({ open, onClose, onSuccess }: QuickAddModalProps) {
  const { currentUser } = useUser()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open && currentUser) {
      categoriesApi.getAll(currentUser.id).then(setCategories).catch(console.error)
    }
  }, [open, currentUser])

  useEffect(() => {
    if (open) {
      setAmount('')
      setCategoryId('')
      setDate(new Date().toISOString().split('T')[0])
      setNotes('')
      setError('')
    }
  }, [open])

  const filteredCategories = categories.filter(c => c.type === type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !amount || !categoryId) return

    setLoading(true)
    setError('')

    try {
      await transactionsApi.create(currentUser.id, {
        amount: parseFloat(amount),
        type,
        categoryId,
        date,
        notes,
      })
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl p-6 safe-area-bottom sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[85vh] sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl ${
              isDark ? 'bg-slate-800' : 'bg-white'
            }`}
          >
            {/* Handle bar for mobile */}
            <div className="absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full bg-slate-300 sm:hidden" />

            <div className="mb-6 flex items-center justify-between pt-2 sm:pt-0">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Quick Add</h2>
              <button
                onClick={onClose}
                className={`rounded-xl p-2.5 transition-colors ${
                  isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type Toggle */}
              <div className={`flex gap-2 rounded-xl p-1 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all ${
                    type === 'expense'
                      ? isDark
                        ? 'bg-slate-600 text-red-400 shadow-sm'
                        : 'bg-white text-red-600 shadow-sm'
                      : isDark
                      ? 'text-slate-400'
                      : 'text-slate-600'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all ${
                    type === 'income'
                      ? isDark
                        ? 'bg-slate-600 text-green-400 shadow-sm'
                        : 'bg-white text-green-600 shadow-sm'
                      : isDark
                      ? 'text-slate-400'
                      : 'text-slate-600'
                  }`}
                >
                  Income
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Amount
                </label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={`w-full rounded-xl border py-4 pl-10 pr-4 text-xl font-semibold transition-colors ${
                      isDark
                        ? 'border-slate-600 bg-slate-700 text-white placeholder:text-slate-500 focus:border-primary-500'
                        : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary-500'
                    }`}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {filteredCategories.slice(0, 8).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all active:scale-95 ${
                        categoryId === cat.id
                          ? 'border-primary-500 bg-primary-500/10'
                          : isDark
                          ? 'border-transparent bg-slate-700 hover:bg-slate-600'
                          : 'border-transparent bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className={`text-[10px] font-medium truncate w-full text-center ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
                {filteredCategories.length > 8 && (
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className={`mt-3 w-full rounded-xl border px-4 py-3 transition-colors ${
                      isDark
                        ? 'border-slate-600 bg-slate-700 text-white'
                        : 'border-slate-200 bg-white text-slate-900'
                    }`}
                  >
                    <option value="">More categories...</option>
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Date */}
              <div>
                <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3.5 transition-colors ${
                    isDark
                      ? 'border-slate-600 bg-slate-700 text-white'
                      : 'border-slate-200 bg-white text-slate-900'
                  }`}
                />
              </div>

              {/* Notes */}
              <div>
                <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a note..."
                  className={`w-full rounded-xl border px-4 py-3.5 transition-colors ${
                    isDark
                      ? 'border-slate-600 bg-slate-700 text-white placeholder:text-slate-500'
                      : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !amount || !categoryId}
                className="w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-base font-semibold text-white shadow-lg shadow-primary-500/30 transition-all hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Adding...' : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
