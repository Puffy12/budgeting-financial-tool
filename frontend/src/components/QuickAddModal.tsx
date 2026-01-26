import { useState, useEffect, useRef } from 'react'
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
  const [showMore, setShowMore] = useState(false)
  const [showCategories, setShowCategories] = useState(true)
  const amountInputRef = useRef<HTMLInputElement>(null)

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
      setShowMore(false)
      setShowCategories(true)
    }
  }, [open])

  const filteredCategories = categories.filter(c => c.type === type)
  const selectedCategory = categories.find(c => c.id === categoryId)

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

  const handleSelectCategory = (id: string) => {
    setCategoryId(id)
    // Collapse category section after selection on mobile
    setShowCategories(false)
  }

  // Quick number pad for mobile
  const handleNumPadPress = (value: string) => {
    if (value === 'backspace') {
      setAmount(prev => prev.slice(0, -1))
    } else if (value === '.') {
      if (!amount.includes('.')) {
        setAmount(prev => prev + '.')
      }
    } else {
      // Limit to 2 decimal places
      const parts = amount.split('.')
      if (parts[1] && parts[1].length >= 2) return
      setAmount(prev => prev + value)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed inset-x-2 bottom-2 z-50 overflow-hidden rounded-3xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 ${
              isDark ? 'bg-slate-900' : 'bg-white'
            }`}
            style={{ 
              maxHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 80px)',
            }}
          >
            {/* Scrollable Content */}
            <div 
              className="overflow-y-auto"
              style={{ 
                maxHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 80px)',
                paddingBottom: 'env(safe-area-inset-bottom)'
              }}
            >
              {/* Handle bar */}
              <div className="flex justify-center py-3 sm:hidden">
                <div className={`h-1 w-12 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3 sm:px-6 sm:pt-5">
                <button
                  onClick={onClose}
                  className={`-ml-2 rounded-xl px-3 py-2 text-sm font-medium ${
                    isDark ? 'text-slate-400 active:bg-slate-800' : 'text-slate-500 active:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Quick Add
                </h2>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !amount || !categoryId}
                  className={`-mr-2 rounded-xl px-3 py-2 text-sm font-semibold transition-opacity ${
                    !amount || !categoryId ? 'opacity-40' : ''
                  } ${type === 'expense' ? 'text-red-500' : 'text-green-500'}`}
                >
                  {loading ? '...' : 'Add'}
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Type Toggle */}
                <div className={`mx-5 flex gap-1 rounded-2xl p-1 sm:mx-6 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <button
                    type="button"
                    onClick={() => { setType('expense'); setCategoryId(''); setShowCategories(true) }}
                    className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
                      type === 'expense'
                        ? 'bg-red-500 text-white shadow-lg'
                        : isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => { setType('income'); setCategoryId(''); setShowCategories(true) }}
                    className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
                      type === 'income'
                        ? 'bg-green-500 text-white shadow-lg'
                        : isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Income
                  </button>
                </div>

                {/* Amount Display */}
                <div className="px-5 py-5 text-center sm:px-6">
                  <div className={`text-4xl font-bold tabular-nums sm:text-5xl ${
                    type === 'expense' 
                      ? isDark ? 'text-red-400' : 'text-red-500'
                      : isDark ? 'text-green-400' : 'text-green-500'
                  }`}>
                    ${amount || '0'}
                  </div>
                  {/* Hidden input for desktop */}
                  <input
                    ref={amountInputRef}
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="sr-only"
                  />
                </div>

                {/* Number Pad - Mobile Only */}
                <div className="grid grid-cols-3 gap-1 px-3 pb-2 sm:hidden">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleNumPadPress(key)}
                      className={`flex h-12 items-center justify-center rounded-xl text-lg font-semibold transition-all active:scale-95 ${
                        isDark 
                          ? 'bg-slate-800 text-white active:bg-slate-700' 
                          : 'bg-slate-100 text-slate-900 active:bg-slate-200'
                      }`}
                    >
                      {key === 'backspace' ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                        </svg>
                      ) : key}
                    </button>
                  ))}
                </div>

                {/* Category Section */}
                <div className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  {/* Category Header - Clickable to expand/collapse */}
                  <button
                    type="button"
                    onClick={() => setShowCategories(!showCategories)}
                    className={`flex w-full items-center justify-between px-5 py-3 sm:px-6 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Category
                      </span>
                      {selectedCategory && !showCategories && (
                        <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          type === 'expense'
                            ? isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600'
                            : isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'
                        }`}>
                          <span>{selectedCategory.icon}</span>
                          <span>{selectedCategory.name}</span>
                        </span>
                      )}
                    </div>
                    <svg 
                      className={`h-4 w-4 transition-transform ${showCategories ? 'rotate-180' : ''} ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
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
                              className={`flex shrink-0 items-center gap-2 rounded-full border-2 px-3 py-2 transition-all active:scale-95 ${
                                categoryId === cat.id
                                  ? type === 'expense'
                                    ? 'border-red-500 bg-red-500/10 text-red-500'
                                    : 'border-green-500 bg-green-500/10 text-green-500'
                                  : isDark
                                  ? 'border-slate-700 bg-slate-800 text-slate-300'
                                  : 'border-slate-200 bg-slate-50 text-slate-700'
                              }`}
                            >
                              <span className="text-base">{cat.icon}</span>
                              <span className="text-sm font-medium whitespace-nowrap">{cat.name}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Optional Fields Toggle */}
                <div className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <button
                    type="button"
                    onClick={() => setShowMore(!showMore)}
                    className={`flex w-full items-center justify-between px-5 py-3 text-sm sm:px-6 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    <span>Date & Notes</span>
                    <svg 
                      className={`h-4 w-4 transition-transform ${showMore ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
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
                            <label className={`mb-1.5 block text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              Date
                            </label>
                            <input
                              type="date"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className={`w-full rounded-xl border px-4 py-2.5 text-sm ${
                                isDark
                                  ? 'border-slate-700 bg-slate-800 text-white'
                                  : 'border-slate-200 bg-slate-50 text-slate-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`mb-1.5 block text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              Notes
                            </label>
                            <input
                              type="text"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Add a note..."
                              className={`w-full rounded-xl border px-4 py-2.5 text-sm ${
                                isDark
                                  ? 'border-slate-700 bg-slate-800 text-white placeholder:text-slate-600'
                                  : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400'
                              }`}
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
                    className={`w-full rounded-2xl py-3.5 text-base font-bold shadow-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${
                      type === 'expense'
                        ? 'bg-red-500 text-white shadow-red-500/30'
                        : 'bg-green-500 text-white shadow-green-500/30'
                    }`}
                  >
                    {loading ? 'Adding...' : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
