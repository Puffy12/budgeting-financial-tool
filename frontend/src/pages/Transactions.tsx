import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { useTheme } from '../context/ThemeContext'
import { transactionsApi, categoriesApi } from '../api'
import type { Transaction, Category } from '../types'
import { getIconById } from '../utils/categoryIcons'
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  Folder,
} from 'lucide-react'

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
  const [expandedId, setExpandedId] = useState<string | null>(null)

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

  // Listen for transaction changes from QuickAdd modal
  useEffect(() => {
    const handleTransactionChange = () => {
      if (currentUser) {
        loadData()
      }
    }
    window.addEventListener('transaction-changed', handleTransactionChange)
    return () => window.removeEventListener('transaction-changed', handleTransactionChange)
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
    setExpandedId(null)
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
      // Notify other pages (like Dashboard) about the change
      window.dispatchEvent(new CustomEvent('transaction-changed'))
    } catch (err) {
      console.error('Failed to save transaction:', err)
    }
  }

  const handleDelete = async (transactionId: string) => {
    if (!currentUser || !confirm('Are you sure you want to delete this transaction?')) return

    try {
      await transactionsApi.delete(currentUser.id, transactionId)
      setExpandedId(null)
      loadData()
      // Notify other pages (like Dashboard) about the change
      window.dispatchEvent(new CustomEvent('transaction-changed'))
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

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const filteredCategories = categories.filter(c => c.type === formData.type)

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  // Helper to render category icon
  const renderCategoryIcon = (iconId: string | undefined, className: string = '') => {
    if (!iconId) return <Folder className={className} strokeWidth={1.75} />
    const IconComponent = getIconById(iconId)
    return <IconComponent className={className} strokeWidth={1.75} />
  }

  return (
    <div className="p-4 pb-24 lg:p-8 lg:pb-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Transactions
          </h1>
          <p className={`mt-1 ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>
            Manage your income and expenses
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-premium inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-3 font-medium text-white shadow-lg shadow-primary-500/25"
        >
          <Plus className="h-5 w-5" strokeWidth={2} />
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {(['all', 'income', 'expense'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f === 'all' ? {} : { type: f })}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              (f === 'all' && !filter.type) || filter.type === f
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : isDark
                ? 'bg-[#1a1a1e] text-[#52525e] hover:bg-[#242428] hover:text-white'
                : 'bg-white text-slate-500 hover:bg-[#f5f5dc] hover:text-slate-900 border border-[#ede9d5]'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className={`rounded-xl p-3 sm:p-4 accent-income ${isDark ? 'bg-emerald-500/8' : 'bg-emerald-50/80'}`}>
          <p className={`text-xs font-medium uppercase tracking-wider sm:text-[11px] ${isDark ? 'text-emerald-400/70' : 'text-emerald-600/70'}`}>
            Income
          </p>
          <p className={`mt-1 text-base font-bold tabular-nums sm:text-xl ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className={`rounded-xl p-3 sm:p-4 accent-expense ${isDark ? 'bg-red-500/8' : 'bg-red-50/80'}`}>
          <p className={`text-xs font-medium uppercase tracking-wider sm:text-[11px] ${isDark ? 'text-red-400/70' : 'text-red-600/70'}`}>
            Expenses
          </p>
          <p className={`mt-1 text-base font-bold tabular-nums sm:text-xl ${isDark ? 'text-red-400' : 'text-red-700'}`}>
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div className={`col-span-2 sm:col-span-1 rounded-xl p-3 sm:p-4 ${isDark ? 'bg-[#1a1a1e]' : 'bg-white border border-[#ede9d5]'}`}>
          <p className={`text-xs font-medium uppercase tracking-wider sm:text-[11px] ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>
            Net
          </p>
          <p className={`mt-1 text-base font-bold tabular-nums sm:text-xl ${
            totalIncome - totalExpenses >= 0
              ? isDark ? 'text-emerald-400' : 'text-emerald-700'
              : isDark ? 'text-red-400' : 'text-red-700'
          }`}>
            {formatCurrency(totalIncome - totalExpenses)}
          </p>
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : transactions.length > 0 ? (
        <div className={`rounded-2xl border ${isDark ? 'border-[#1a1a1e] bg-[#121214]' : 'border-[#ede9d5] bg-white'}`}>
          {/* Mobile List View */}
          <div className={`divide-y lg:hidden ${isDark ? 'divide-[#1a1a1e]' : 'divide-[#ede9d5]'}`}>
            {transactions.map((transaction) => (
              <div key={transaction.id}>
                {/* Main Row - Tappable */}
                <button
                  onClick={() => toggleExpand(transaction.id)}
                  className={`flex w-full items-center justify-between p-4 text-left transition-colors ${
                    expandedId === transaction.id
                      ? isDark ? 'bg-[#1a1a1e]/50' : 'bg-[#faf9f6]'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      isDark ? 'bg-[#1a1a1e]' : 'bg-[#f5f5dc]/60'
                    }`}>
                      {renderCategoryIcon(transaction.category?.icon, `h-5 w-5 ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`)}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {transaction.category?.name || 'Unknown'}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
                        {new Date(transaction.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold tabular-nums ${
                      transaction.type === 'income'
                        ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                        : isDark ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform duration-200 ${
                        expandedId === transaction.id ? 'rotate-180' : ''
                      } ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}
                      strokeWidth={1.75}
                    />
                  </div>
                </button>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === transaction.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className={`border-t px-4 pb-4 pt-3 ${isDark ? 'border-[#1a1a1e] bg-[#0d0d0e]' : 'border-[#ede9d5] bg-[#faf9f6]'}`}>
                        {/* Details Grid */}
                        <div className="mb-4 space-y-2">
                          <div className="flex justify-between">
                            <span className={`text-sm ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>Date</span>
                            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {new Date(transaction.date + 'T12:00:00').toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`text-sm ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>Type</span>
                            <span className={`text-sm font-medium capitalize ${
                              transaction.type === 'income' 
                                ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                : isDark ? 'text-red-400' : 'text-red-600'
                            }`}>
                              {transaction.type}
                            </span>
                          </div>
                          {transaction.notes && (
                            <div className="flex justify-between gap-4">
                              <span className={`shrink-0 text-sm ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>Notes</span>
                              <span className={`text-right text-sm ${isDark ? 'text-[#52525e]' : 'text-slate-600'}`}>
                                {transaction.notes}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(transaction)}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-medium transition-all active:scale-[0.98] ${
                              isDark 
                                ? 'bg-[#1a1a1e] text-white hover:bg-[#242428]' 
                                : 'bg-white text-slate-700 hover:bg-[#f5f5dc] border border-[#ede9d5]'
                            }`}
                          >
                            <Pencil className="h-4 w-4" strokeWidth={1.75} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-medium transition-all active:scale-[0.98] ${
                              isDark 
                                ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25' 
                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                            }`}
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-[#1a1a1e]' : 'border-[#ede9d5]'}`}>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>Category</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>Date</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>Notes</th>
                  <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>Amount</th>
                  <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-[#1a1a1e]' : 'divide-[#ede9d5]'}`}>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className={`transition-colors ${isDark ? 'hover:bg-[#1a1a1e]/50' : 'hover:bg-[#faf9f6]'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          isDark ? 'bg-[#1a1a1e]' : 'bg-[#f5f5dc]/60'
                        }`}>
                          {renderCategoryIcon(transaction.category?.icon, `h-4 w-4 ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`)}
                        </div>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {transaction.category?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>
                      {new Date(transaction.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className={`max-w-xs truncate px-6 py-4 ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
                      {transaction.notes || '-'}
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold tabular-nums ${
                      transaction.type === 'income'
                        ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                        : isDark ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(transaction)}
                          className={`rounded-lg p-2 transition-all duration-200 ${
                            isDark ? 'text-[#3d3d45] hover:bg-[#1a1a1e] hover:text-white' : 'text-slate-400 hover:bg-[#f5f5dc] hover:text-slate-700'
                          }`}
                        >
                          <Pencil className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className={`rounded-lg p-2 transition-all duration-200 ${
                            isDark ? 'text-[#3d3d45] hover:bg-red-500/15 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-600'
                          }`}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
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
        <div className={`flex flex-col items-center justify-center gap-3 rounded-2xl border py-16 ${
          isDark ? 'border-[#1a1a1e] bg-[#121214] text-[#3d3d45]' : 'border-[#ede9d5] bg-white text-slate-400'
        }`}>
          <Folder className="h-10 w-10" strokeWidth={1.5} />
          <span className="text-sm">No transactions yet. Add your first one!</span>
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
                isDark ? 'bg-[#121214]' : 'bg-white'
              }`}
            >
              <div className={`absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full sm:hidden ${isDark ? 'bg-[#242428]' : 'bg-slate-200'}`} />
              
              <h2 className={`mb-6 pt-2 text-xl font-semibold tracking-tight sm:pt-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Type Toggle */}
                <div className={`flex gap-1 rounded-xl p-1 ${isDark ? 'bg-[#1a1a1e]' : 'bg-[#f5f5dc]/60'}`}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense', categoryId: '' })}
                    className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all duration-200 ${
                      formData.type === 'expense'
                        ? isDark ? 'bg-[#242428] text-red-400 shadow-sm' : 'bg-white text-red-600 shadow-sm'
                        : isDark ? 'text-[#52525e]' : 'text-slate-500'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income', categoryId: '' })}
                    className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all duration-200 ${
                      formData.type === 'income'
                        ? isDark ? 'bg-[#242428] text-emerald-400 shadow-sm' : 'bg-white text-emerald-600 shadow-sm'
                        : isDark ? 'text-[#52525e]' : 'text-slate-500'
                    }`}
                  >
                    Income
                  </button>
                </div>

                {/* Amount */}
                <div>
                  <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-[#52525e]' : 'text-slate-600'}`}>Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className={`w-full rounded-xl border px-4 py-3.5 transition-all duration-200 ${
                      isDark ? 'border-[#242428] bg-[#1a1a1e] text-white focus:border-primary-500' : 'border-[#ede9d5] bg-[#faf9f6] text-slate-900 focus:border-primary-500'
                    }`}
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-[#52525e]' : 'text-slate-600'}`}>Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className={`w-full rounded-xl border px-4 py-3.5 transition-all duration-200 ${
                      isDark ? 'border-[#242428] bg-[#1a1a1e] text-white focus:border-primary-500' : 'border-[#ede9d5] bg-[#faf9f6] text-slate-900 focus:border-primary-500'
                    }`}
                    required
                  >
                    <option value="">Select a category</option>
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-[#52525e]' : 'text-slate-600'}`}>Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full rounded-xl border px-4 py-3.5 transition-all duration-200 ${
                      isDark ? 'border-[#242428] bg-[#1a1a1e] text-white focus:border-primary-500' : 'border-[#ede9d5] bg-[#faf9f6] text-slate-900 focus:border-primary-500'
                    }`}
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-[#52525e]' : 'text-slate-600'}`}>Notes (optional)</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className={`w-full rounded-xl border px-4 py-3.5 transition-all duration-200 ${
                      isDark ? 'border-[#242428] bg-[#1a1a1e] text-white placeholder:text-[#3d3d45] focus:border-primary-500' : 'border-[#ede9d5] bg-[#faf9f6] text-slate-900 placeholder:text-slate-400 focus:border-primary-500'
                    }`}
                    placeholder="Add a note..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`flex-1 rounded-xl border py-3.5 font-medium transition-all duration-200 active:scale-[0.98] ${
                      isDark ? 'border-[#242428] text-[#52525e] hover:bg-[#1a1a1e] hover:text-white' : 'border-[#ede9d5] text-slate-500 hover:bg-[#f5f5dc]'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-premium flex-1 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-3.5 font-medium text-white shadow-lg shadow-primary-500/25"
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
