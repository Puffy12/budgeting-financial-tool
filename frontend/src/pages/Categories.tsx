import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { useTheme } from '../context/ThemeContext'
import { categoriesApi } from '../api'
import type { Category } from '../types'

const EMOJI_OPTIONS = [
  '🛒', '🏠', '💡', '🚗', '🎬', '🍽️', '🏥', '🛍️', '📱', '🛡️', '📚', '💅', '📋',
  '💰', '💻', '📈', '🎁', '💵', '✨', '🎮', '🏋️', '✈️', '🎵', '📸', '🐶', '🌿',
  '☕', '🍕', '🎂', '💊', '🔧', '👕', '💎', '🎨', '📝', '🏦', '💳', '🎯'
]

export default function Categories() {
  const { currentUser } = useUser()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [error, setError] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    icon: '📋',
  })

  useEffect(() => {
    if (currentUser) {
      loadCategories()
    }
  }, [currentUser])

  const loadCategories = async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const data = await categoriesApi.getAll(currentUser.id)
      setCategories(data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingCategory(null)
    setFormData({ name: '', type: 'expense', icon: '📋' })
    setError('')
    setShowModal(true)
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setFormData({ name: category.name, type: category.type, icon: category.icon })
    setError('')
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    setError('')
    try {
      if (editingCategory) {
        await categoriesApi.update(currentUser.id, editingCategory.id, formData)
      } else {
        await categoriesApi.create(currentUser.id, formData)
      }
      setShowModal(false)
      loadCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category')
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!currentUser || !confirm('Are you sure you want to delete this category?')) return

    try {
      await categoriesApi.delete(currentUser.id, categoryId)
      loadCategories()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete category')
    }
  }

  const filteredCategories = categories.filter(c => {
    if (filter === 'all') return true
    return c.type === filter
  })

  const expenseCategories = filteredCategories.filter(c => c.type === 'expense')
  const incomeCategories = filteredCategories.filter(c => c.type === 'income')

  return (
    <div className="p-4 pb-24 lg:p-8 lg:pb-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Categories</h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Organize your transactions</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-3 font-medium text-white shadow-lg shadow-primary-500/30 transition-all hover:shadow-xl active:scale-[0.98]"
        >
          <span>+</span> Add Category
        </button>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {(['all', 'expense', 'income'] as const).map((f) => (
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

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Expense Categories */}
          {(filter === 'all' || filter === 'expense') && expenseCategories.length > 0 && (
            <div>
              <h2 className={`mb-4 flex items-center gap-2 text-base font-semibold sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                  💸
                </span>
                Expense Categories
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {expenseCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex items-center justify-between rounded-xl border p-4 ${
                      isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${
                        isDark ? 'bg-red-500/20' : 'bg-red-50'
                      }`}>
                        {category.icon}
                      </span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{category.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(category)}
                        className={`rounded-lg p-2 transition-colors ${
                          isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className={`rounded-lg p-2 transition-colors ${
                          isDark ? 'text-slate-400 hover:bg-red-500/20 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
              <h2 className={`mb-4 flex items-center gap-2 text-base font-semibold sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                  💰
                </span>
                Income Categories
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {incomeCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex items-center justify-between rounded-xl border p-4 ${
                      isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${
                        isDark ? 'bg-green-500/20' : 'bg-green-50'
                      }`}>
                        {category.icon}
                      </span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{category.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(category)}
                        className={`rounded-lg p-2 transition-colors ${
                          isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className={`rounded-lg p-2 transition-colors ${
                          isDark ? 'text-slate-400 hover:bg-red-500/20 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {filteredCategories.length === 0 && (
            <div className={`rounded-2xl border py-16 text-center ${
              isDark ? 'border-slate-700 bg-slate-800 text-slate-400' : 'border-slate-200 bg-white text-slate-500'
            }`}>
              No categories found. Add one to get started!
            </div>
          )}
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
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Type Toggle */}
                <div className={`flex gap-2 rounded-xl p-1 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
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
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all ${
                      formData.type === 'income'
                        ? isDark ? 'bg-slate-600 text-green-400 shadow-sm' : 'bg-white text-green-600 shadow-sm'
                        : isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    Income
                  </button>
                </div>

                {/* Name */}
                <div>
                  <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full rounded-xl border px-4 py-3.5 transition-colors ${
                      isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-200 bg-white text-slate-900'
                    }`}
                    placeholder="Category name"
                    required
                  />
                </div>

                {/* Icon Picker */}
                <div>
                  <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Icon</label>
                  <div className={`grid grid-cols-8 gap-2 rounded-xl border p-3 ${
                    isDark ? 'border-slate-600 bg-slate-700' : 'border-slate-200 bg-slate-50'
                  }`}>
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: emoji })}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-all active:scale-90 ${
                          formData.icon === emoji
                            ? 'bg-primary-500 shadow-lg'
                            : isDark ? 'bg-slate-600 hover:bg-slate-500' : 'bg-white hover:bg-slate-100'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

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
                    {editingCategory ? 'Update' : 'Add'}
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
