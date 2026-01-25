import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { useTheme } from '../context/ThemeContext'
import { transactionsApi, categoriesApi } from '../api'
import type { Transaction, Category } from '../types'

export default function Transactions() {
  const { currentUser } = useUser()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [filter, setFilter] = useState<{ type?: 'income' | 'expense' }>({})

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  useEffect(() => {
    if (currentUser) {
      loadData()
    }
  }, [currentUser, filter])

  const loadData = async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const [transData, catData] = await Promise.all([
        transactionsApi.getAll(currentUser.id, filter),
        categoriesApi.getAll(currentUser.id),
      ])
      setTransactions(transData.transactions)
      setCategories(catData)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingTransaction(null)
    setFormData({
      amount: '',
      type: 'expense',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    })
    setShowModal(true)
  }

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      amount: transaction.amount.toString(),
      type: transaction.type,
      categoryId: transaction.categoryId,
      date: transaction.date,
      notes: transaction.notes,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    try {
      if (editingTransaction) {
        await transactionsApi.update(currentUser.id, editingTransaction.id, {
          amount: parseFloat(formData.amount),
          type: formData.type,
          categoryId: formData.categoryId,
          date: formData.date,
          notes: formData.notes,
        })
      } else {
        await transactionsApi.create(currentUser.id, {
          amount: parseFloat(formData.amount),
          type: formData.type,
          categoryId: formData.categoryId,
          date: formData.date,
          notes: formData.notes,
        })
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      console.error('Failed to save transaction:', err)
    }
  }

  const handleDelete = async (transactionId: string) => {
    if (!currentUser || !confirm('Are you sure you want to delete this transaction?')) return

    try {
      await transactionsApi.delete(currentUser.id, transactionId)
      loadData()
    } catch (err) {
      console.error('Failed to delete transaction:', err)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const filteredCategories = categories.filter(c => c.type === formData.type)

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="p-4 pb-24 lg:p-8 lg:pb-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Transactions
          </h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            Manage your income and expenses
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-3 font-medium text-white shadow-lg shadow-primary-500/30 transition-all hover:shadow-xl active:scale-[0.98]"
        >
          <span>+</span> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {(['all', 'income', 'expense'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f === 'all' ? {} : { type: f })}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              (f === 'all' && !filter.type) || filter.type === f
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

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className={`rounded-xl p-3 sm:p-4 ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
          <p className={`text-xs font-medium sm:text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
            Income
          </p>
          <p className={`text-lg font-bold sm:text-xl ${isDark ? 'text-green-400' : 'text-green-700'}`}>
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className={`rounded-xl p-3 sm:p-4 ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
          <p className={`text-xs font-medium sm:text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
            Expenses
          </p>
          <p className={`text-lg font-bold sm:text-xl ${isDark ? 'text-red-400' : 'text-red-700'}`}>
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div className={`rounded-xl p-3 sm:p-4 ${isDark ? 'bg-slate-700' : 'bg-white border border-slate-200'}`}>
          <p className={`text-xs font-medium sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Net
          </p>
          <p className={`text-lg font-bold sm:text-xl ${
            totalIncome - totalExpenses >= 0
              ? isDark ? 'text-green-400' : 'text-green-700'
              : isDark ? 'text-red-400' : 'text-red-700'
          }`}>
            {formatCurrency(totalIncome - totalExpenses)}
          </p>
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : transactions.length > 0 ? (
        <div className={`rounded-2xl border shadow-sm ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
          {/* Mobile List View */}
          <div className="divide-y lg:hidden ${isDark ? 'divide-slate-700' : 'divide-slate-100'}">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`flex items-center justify-between p-4 ${isDark ? 'divide-slate-700' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
                    isDark ? 'bg-slate-700' : 'bg-slate-50'
                  }`}>
                    {transaction.category?.icon || '📋'}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {transaction.category?.name || 'Unknown'}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className={`font-semibold ${
                    transaction.type === 'income'
                      ? isDark ? 'text-green-400' : 'text-green-600'
                      : isDark ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <button
                    onClick={() => openEditModal(transaction)}
                    className={`rounded-lg p-2 ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'}`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Category</th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Date</th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Notes</th>
                  <th className={`px-6 py-4 text-right text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Amount</th>
                  <th className={`px-6 py-4 text-right text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className={isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{transaction.category?.icon || '📋'}</span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {transaction.category?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className={`max-w-xs truncate px-6 py-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {transaction.notes || '-'}
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${
                      transaction.type === 'income'
                        ? isDark ? 'text-green-400' : 'text-green-600'
                        : isDark ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(transaction)}
                          className={`rounded-lg p-2 transition-colors ${
                            isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                          }`}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className={`rounded-lg p-2 transition-colors ${
                            isDark ? 'text-slate-400 hover:bg-red-500/20 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-600'
                          }`}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={`rounded-2xl border py-16 text-center shadow-sm ${
          isDark ? 'border-slate-700 bg-slate-800 text-slate-400' : 'border-slate-200 bg-white text-slate-500'
        }`}>
          No transactions yet. Add your first one!
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
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
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

                {/* Amount */}
                <div>
                  <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className={`w-full rounded-xl border px-4 py-3.5 transition-colors ${
                      isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-200 bg-white text-slate-900'
                    }`}
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className={`w-full rounded-xl border px-4 py-3.5 transition-colors ${
                      isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-200 bg-white text-slate-900'
                    }`}
                    required
                  >
                    <option value="">Select a category</option>
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full rounded-xl border px-4 py-3.5 transition-colors ${
                      isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-200 bg-white text-slate-900'
                    }`}
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Notes (optional)</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className={`w-full rounded-xl border px-4 py-3.5 transition-colors ${
                      isDark ? 'border-slate-600 bg-slate-700 text-white placeholder:text-slate-500' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
                    }`}
                    placeholder="Add a note..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
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
                    {editingTransaction ? 'Update' : 'Add'}
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
