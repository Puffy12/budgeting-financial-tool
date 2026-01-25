import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { useTheme } from '../context/ThemeContext'
import { recurringApi, categoriesApi } from '../api'
import type { RecurringTransaction, Category, Frequency } from '../types'

const FREQUENCY_LABELS: Record<Frequency, string> = {
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
}

export default function Recurring() {
  const { currentUser } = useUser()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    categoryId: '',
    frequency: 'monthly' as Frequency,
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
  })

  useEffect(() => {
    if (currentUser) {
      loadData()
    }
  }, [currentUser])

  const loadData = async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const [recData, catData] = await Promise.all([
        recurringApi.getAll(currentUser.id),
        categoriesApi.getAll(currentUser.id),
      ])
      setRecurring(recData)
      setCategories(catData)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingRecurring(null)
    setFormData({
      name: '',
      amount: '',
      type: 'expense',
      categoryId: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      notes: '',
    })
    setShowModal(true)
  }

  const openEditModal = (rec: RecurringTransaction) => {
    setEditingRecurring(rec)
    setFormData({
      name: rec.name,
      amount: rec.amount.toString(),
      type: rec.type,
      categoryId: rec.categoryId,
      frequency: rec.frequency,
      startDate: rec.startDate,
      notes: rec.notes,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    try {
      if (editingRecurring) {
        await recurringApi.update(currentUser.id, editingRecurring.id, {
          name: formData.name,
          amount: parseFloat(formData.amount),
          type: formData.type,
          categoryId: formData.categoryId,
          frequency: formData.frequency,
          notes: formData.notes,
        })
      } else {
        await recurringApi.create(currentUser.id, {
          name: formData.name,
          amount: parseFloat(formData.amount),
          type: formData.type,
          categoryId: formData.categoryId,
          frequency: formData.frequency,
          startDate: formData.startDate,
          notes: formData.notes,
        })
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      console.error('Failed to save recurring:', err)
    }
  }

  const handleToggleActive = async (rec: RecurringTransaction) => {
    if (!currentUser) return
    try {
      await recurringApi.update(currentUser.id, rec.id, { isActive: !rec.isActive })
      loadData()
    } catch (err) {
      console.error('Failed to toggle recurring:', err)
    }
  }

  const handleDelete = async (recurringId: string) => {
    if (!currentUser || !confirm('Are you sure you want to delete this recurring transaction?')) return

    try {
      await recurringApi.delete(currentUser.id, recurringId)
      loadData()
    } catch (err) {
      console.error('Failed to delete recurring:', err)
    }
  }

  const handleProcess = async (recurringId: string) => {
    if (!currentUser) return
    try {
      await recurringApi.process(currentUser.id, recurringId)
      loadData()
      alert('Transaction created successfully!')
    } catch (err) {
      console.error('Failed to process recurring:', err)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const filteredCategories = categories.filter(c => c.type === formData.type)

  const filteredRecurring = recurring.filter(r => {
    if (filter === 'active') return r.isActive
    if (filter === 'inactive') return !r.isActive
    return true
  })

  const totalMonthlyExpenses = recurring
    .filter(r => r.isActive && r.type === 'expense')
    .reduce((sum, r) => {
      const multiplier = { weekly: 4, biweekly: 2, monthly: 1, quarterly: 1/3, yearly: 1/12 }
      return sum + (r.amount * (multiplier[r.frequency] || 1))
    }, 0)

  const totalMonthlyIncome = recurring
    .filter(r => r.isActive && r.type === 'income')
    .reduce((sum, r) => {
      const multiplier = { weekly: 4, biweekly: 2, monthly: 1, quarterly: 1/3, yearly: 1/12 }
      return sum + (r.amount * (multiplier[r.frequency] || 1))
    }, 0)

  return (
    <div className="p-4 pb-24 lg:p-8 lg:pb-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Recurring</h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Manage recurring income and expenses</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-3 font-medium text-white shadow-lg shadow-primary-500/30 transition-all hover:shadow-xl active:scale-[0.98]"
        >
          <span>+</span> Add Recurring
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className={`rounded-xl p-3 sm:p-4 ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
          <p className={`text-xs font-medium sm:text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>Expenses/mo</p>
          <p className={`text-lg font-bold sm:text-xl ${isDark ? 'text-red-400' : 'text-red-700'}`}>
            {formatCurrency(totalMonthlyExpenses)}
          </p>
        </div>
        <div className={`rounded-xl p-3 sm:p-4 ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
          <p className={`text-xs font-medium sm:text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>Income/mo</p>
          <p className={`text-lg font-bold sm:text-xl ${isDark ? 'text-green-400' : 'text-green-700'}`}>
            {formatCurrency(totalMonthlyIncome)}
          </p>
        </div>
        <div className={`rounded-xl p-3 sm:p-4 ${isDark ? 'bg-slate-700' : 'bg-white border border-slate-200'}`}>
          <p className={`text-xs font-medium sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Net/mo</p>
          <p className={`text-lg font-bold sm:text-xl ${
            totalMonthlyIncome - totalMonthlyExpenses >= 0
              ? isDark ? 'text-green-400' : 'text-green-700'
              : isDark ? 'text-red-400' : 'text-red-700'
          }`}>
            {formatCurrency(totalMonthlyIncome - totalMonthlyExpenses)}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {(['all', 'active', 'inactive'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              filter === f
                ? 'bg-primary-500 text-white'
                : isDark
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : filteredRecurring.length > 0 ? (
        <div className="space-y-3">
          {filteredRecurring.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`rounded-xl border p-4 transition-all ${
                rec.isActive
                  ? isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
                  : isDark ? 'border-slate-700 bg-slate-800/50 opacity-60' : 'border-slate-100 bg-slate-50 opacity-60'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${
                    rec.type === 'expense'
                      ? isDark ? 'bg-red-500/20' : 'bg-red-50'
                      : isDark ? 'bg-green-500/20' : 'bg-green-50'
                  }`}>
                    {rec.category?.icon || '📋'}
                  </span>
                  <div className="min-w-0">
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{rec.name}</p>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {rec.category?.name} · {FREQUENCY_LABELS[rec.frequency]}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Next: {new Date(rec.nextDueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <p className={`text-xl font-bold ${
                    rec.type === 'expense'
                      ? isDark ? 'text-red-400' : 'text-red-600'
                      : isDark ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {rec.type === 'expense' ? '-' : '+'}
                    {formatCurrency(rec.amount)}
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(rec)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                        rec.isActive
                          ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                          : isDark ? 'bg-slate-600 text-slate-400' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rec.isActive ? 'Active' : 'Off'}
                    </button>
                    <button
                      onClick={() => handleProcess(rec.id)}
                      className={`rounded-lg p-2 transition-colors ${
                        isDark ? 'text-slate-400 hover:bg-blue-500/20 hover:text-blue-400' : 'text-slate-400 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                      title="Create transaction now"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => openEditModal(rec)}
                      className={`rounded-lg p-2 transition-colors ${
                        isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(rec.id)}
                      className={`rounded-lg p-2 transition-colors ${
                        isDark ? 'text-slate-400 hover:bg-red-500/20 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className={`rounded-2xl border py-16 text-center ${
          isDark ? 'border-slate-700 bg-slate-800 text-slate-400' : 'border-slate-200 bg-white text-slate-500'
        }`}>
          No recurring transactions yet.
        </div>
      )}

      {/* Modal */}
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
              className={`fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl p-6 safe-area-bottom sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[85vh] sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl ${
                isDark ? 'bg-slate-800' : 'bg-white'
              }`}
            >
              <div className="absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full bg-slate-300 sm:hidden" />
              
              <h2 className={`mb-6 pt-2 text-xl font-semibold sm:pt-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {editingRecurring ? 'Edit Recurring' : 'Add Recurring'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type Toggle */}
                <div className={`flex gap-2 rounded-xl p-1 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense', categoryId: '' })}
                    className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all ${
                      formData.type === 'expense'
                        ? isDark ? 'bg-slate-600 text-red-400 shadow-sm' : 'bg-white text-red-600 shadow-sm'
                        : isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income', categoryId: '' })}
                    className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all ${
                      formData.type === 'income'
                        ? isDark ? 'bg-slate-600 text-green-400 shadow-sm' : 'bg-white text-green-600 shadow-sm'
                        : isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    Income
                  </button>
                </div>

                {/* Name & Amount */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full rounded-xl border px-4 py-3 transition-colors ${
                        isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-200 bg-white text-slate-900'
                      }`}
                      placeholder="Netflix"
                      required
                    />
                  </div>
                  <div>
                    <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className={`w-full rounded-xl border px-4 py-3 transition-colors ${
                        isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-200 bg-white text-slate-900'
                      }`}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* Category & Frequency */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Category</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className={`w-full rounded-xl border px-4 py-3 transition-colors ${
                        isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-200 bg-white text-slate-900'
                      }`}
                      required
                    >
                      <option value="">Select</option>
                      {filteredCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Frequency</label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value as Frequency })}
                      className={`w-full rounded-xl border px-4 py-3 transition-colors ${
                        isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-200 bg-white text-slate-900'
                      }`}
                      required
                    >
                      {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Start Date (only for new) */}
                {!editingRecurring && (
                  <div>
                    <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className={`w-full rounded-xl border px-4 py-3 transition-colors ${
                        isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-200 bg-white text-slate-900'
                      }`}
                      required
                    />
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Notes (optional)</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className={`w-full rounded-xl border px-4 py-3 transition-colors ${
                      isDark ? 'border-slate-600 bg-slate-700 text-white placeholder:text-slate-500' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
                    }`}
                    placeholder="Add a note..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`flex-1 rounded-xl border py-3.5 font-medium transition-all active:scale-[0.98] ${
                      isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-3.5 font-medium text-white shadow-lg shadow-primary-500/30 transition-all hover:shadow-xl active:scale-[0.98]"
                  >
                    {editingRecurring ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
