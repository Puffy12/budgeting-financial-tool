import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { useTheme } from '../context/ThemeContext'
import { categoriesApi, transactionsApi } from '../api'
import type { Category, TransactionType } from '../types'
import { getIconById } from '../utils/categoryIcons'
import { Delete, ChevronDown, Folder } from 'lucide-react'

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

  // Helper to render category icon
  const renderCategoryIcon = (iconId: string | undefined, className: string = '') => {
    if (!iconId) return <Folder className={className} strokeWidth={1.75} />
    const IconComponent = getIconById(iconId)
    return <IconComponent className={className} strokeWidth={1.75} />
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed inset-x-2 bottom-2 z-50 overflow-hidden rounded-3xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 ${
              isDark ? 'bg-[#0a0a0b]' : 'bg-white'
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
                <div className={`h-1 w-12 rounded-full ${isDark ? 'bg-[#242428]' : 'bg-slate-200'}`} />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3 sm:px-6 sm:pt-5">
                <button
                  onClick={onClose}
                  className={`-ml-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    isDark ? 'text-[#52525e] active:bg-[#1a1a1e]' : 'text-slate-400 active:bg-[#f5f5dc]'
                  }`}
                >
                  Cancel
                </button>
                <h2 className={`text-base font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Quick Add
                </h2>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !amount || !categoryId}
                  className={`-mr-2 rounded-xl px-3 py-2 text-sm font-semibold transition-opacity ${
                    !amount || !categoryId ? 'opacity-40' : ''
                  } ${type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}
                >
                  {loading ? '...' : 'Add'}
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Type Toggle */}
                <div className={`mx-5 flex gap-1 rounded-2xl p-1 sm:mx-6 ${isDark ? 'bg-[#121214]' : 'bg-[#f5f5dc]/60'}`}>
                  <button
                    type="button"
                    onClick={() => { setType('expense'); setCategoryId(''); setShowCategories(true) }}
                    className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${
                      type === 'expense'
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                        : isDark ? 'text-[#52525e]' : 'text-slate-400'
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
                        : isDark ? 'text-[#52525e]' : 'text-slate-400'
                    }`}
                  >
                    Income
                  </button>
                </div>

                {/* Amount Display */}
                <div className="px-5 py-6 text-center sm:px-6">
                  <div className={`text-5xl font-bold tabular-nums tracking-tight sm:text-6xl ${
                    type === 'expense' 
                      ? isDark ? 'text-red-400' : 'text-red-500'
                      : isDark ? 'text-emerald-400' : 'text-emerald-500'
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
                <div className="grid grid-cols-3 gap-1.5 px-4 pb-3 sm:hidden">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleNumPadPress(key)}
                      className={`flex h-14 items-center justify-center rounded-xl text-lg font-semibold transition-all active:scale-95 ${
                        isDark 
                          ? 'bg-[#121214] text-white active:bg-[#1a1a1e]' 
                          : 'bg-[#f5f5dc]/60 text-slate-900 active:bg-[#ede9d5]'
                      }`}
                    >
                      {key === 'backspace' ? (
                        <Delete className="h-5 w-5" strokeWidth={1.75} />
                      ) : key}
                    </button>
                  ))}
                </div>

                {/* Category Section */}
                <div className={`border-t ${isDark ? 'border-[#1a1a1e]' : 'border-[#ede9d5]'}`}>
                  {/* Category Header - Clickable to expand/collapse */}
                  <button
                    type="button"
                    onClick={() => setShowCategories(!showCategories)}
                    className={`flex w-full items-center justify-between px-5 py-3 sm:px-6 ${
                      isDark ? 'text-[#52525e]' : 'text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
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
                      className={`h-4 w-4 transition-transform duration-200 ${showCategories ? 'rotate-180' : ''} ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}
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
                              className={`flex shrink-0 items-center gap-2 rounded-full border-2 px-3 py-2 transition-all duration-200 active:scale-95 ${
                                categoryId === cat.id
                                  ? type === 'expense'
                                    ? 'border-red-500 bg-red-500/10 text-red-500'
                                    : 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                                  : isDark
                                  ? 'border-[#1a1a1e] bg-[#121214] text-[#52525e]'
                                  : 'border-[#ede9d5] bg-[#faf9f6] text-slate-500'
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
                <div className={`border-t ${isDark ? 'border-[#1a1a1e]' : 'border-[#ede9d5]'}`}>
                  <button
                    type="button"
                    onClick={() => setShowMore(!showMore)}
                    className={`flex w-full items-center justify-between px-5 py-3 text-sm sm:px-6 ${
                      isDark ? 'text-[#52525e]' : 'text-slate-500'
                    }`}
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
                            <label className={`mb-1.5 block text-xs font-medium ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
                              Date
                            </label>
                            <input
                              type="date"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-all duration-200 ${
                                isDark
                                  ? 'border-[#1a1a1e] bg-[#121214] text-white focus:border-primary-500'
                                  : 'border-[#ede9d5] bg-[#faf9f6] text-slate-900 focus:border-primary-500'
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`mb-1.5 block text-xs font-medium ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
                              Notes
                            </label>
                            <input
                              type="text"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Add a note..."
                              className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-all duration-200 ${
                                isDark
                                  ? 'border-[#1a1a1e] bg-[#121214] text-white placeholder:text-[#3d3d45] focus:border-primary-500'
                                  : 'border-[#ede9d5] bg-[#faf9f6] text-slate-900 placeholder:text-slate-400 focus:border-primary-500'
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
                    className={`btn-premium w-full rounded-2xl py-4 text-base font-bold shadow-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${
                      type === 'expense'
                        ? 'bg-red-500 text-white shadow-red-500/25'
                        : 'bg-emerald-500 text-white shadow-emerald-500/25'
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
