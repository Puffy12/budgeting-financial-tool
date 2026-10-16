import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { useTheme } from '../context/ThemeContext'
import { categoriesApi } from '../api'
import type { Category } from '../types'
import { CATEGORY_ICONS, getIconById } from '../utils/categoryIcons'
import {
  Plus,
  Pencil,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  Folder,
} from 'lucide-react'

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
    icon: 'folder',
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
    setFormData({ name: '', type: 'expense', icon: 'folder' })
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

  // Helper to render category icon
  const renderCategoryIcon = (iconId: string, className: string = '') => {
    const IconComponent = getIconById(iconId)
    return <IconComponent className={className} strokeWidth={1.75} />
  }

  return (
    <div className="p-4 pb-24 lg:p-8 lg:pb-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Categories</h1>
          <p className={`mt-1 ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>Organize your transactions</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-premium inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-3 font-medium text-white shadow-lg shadow-primary-500/25"
        >
          <Plus className="h-5 w-5" strokeWidth={2} />
          Add Category
        </button>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {(['all', 'expense', 'income'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              filter === f
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

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Expense Categories */}
          {(filter === 'all' || filter === 'expense') && expenseCategories.length > 0 && (
            <div>
              <h2 className={`mb-4 flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>
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
                    className={`card-hover flex items-center justify-between rounded-xl border p-4 ${
                      isDark ? 'border-[#1a1a1e] bg-[#121214]' : 'border-[#ede9d5] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        isDark ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-600'
                      }`}>
                        {renderCategoryIcon(category.icon, 'h-5 w-5')}
                      </div>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{category.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(category)}
                        className={`rounded-lg p-2.5 transition-all duration-200 ${
                          isDark ? 'text-[#3d3d45] hover:bg-[#1a1a1e] hover:text-white' : 'text-slate-400 hover:bg-[#f5f5dc] hover:text-slate-700'
                        }`}
                      >
                        <Pencil className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className={`rounded-lg p-2.5 transition-all duration-200 ${
                          isDark ? 'text-[#3d3d45] hover:bg-red-500/15 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-600'
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
              <h2 className={`mb-4 flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>
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
                    className={`card-hover flex items-center justify-between rounded-xl border p-4 ${
                      isDark ? 'border-[#1a1a1e] bg-[#121214]' : 'border-[#ede9d5] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {renderCategoryIcon(category.icon, 'h-5 w-5')}
                      </div>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{category.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(category)}
                        className={`rounded-lg p-2.5 transition-all duration-200 ${
                          isDark ? 'text-[#3d3d45] hover:bg-[#1a1a1e] hover:text-white' : 'text-slate-400 hover:bg-[#f5f5dc] hover:text-slate-700'
                        }`}
                      >
                        <Pencil className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className={`rounded-lg p-2.5 transition-all duration-200 ${
                          isDark ? 'text-[#3d3d45] hover:bg-red-500/15 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-600'
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
            <div className={`flex flex-col items-center justify-center gap-3 rounded-2xl border py-16 ${
              isDark ? 'border-[#1a1a1e] bg-[#121214] text-[#3d3d45]' : 'border-[#ede9d5] bg-white text-slate-400'
            }`}>
              <Folder className="h-10 w-10" strokeWidth={1.5} />
              <span className="text-sm">No categories found. Add one to get started!</span>
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
                isDark ? 'bg-[#121214]' : 'bg-white'
              }`}
            >
              <div className={`absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full sm:hidden ${isDark ? 'bg-[#242428]' : 'bg-slate-200'}`} />
              
              <h2 className={`mb-6 pt-2 text-xl font-semibold tracking-tight sm:pt-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Type Toggle */}
                <div className={`flex gap-1 rounded-xl p-1 ${isDark ? 'bg-[#1a1a1e]' : 'bg-[#f5f5dc]/60'}`}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
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
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all duration-200 ${
                      formData.type === 'income'
                        ? isDark ? 'bg-[#242428] text-emerald-400 shadow-sm' : 'bg-white text-emerald-600 shadow-sm'
                        : isDark ? 'text-[#52525e]' : 'text-slate-500'
                    }`}
                  >
                    Income
                  </button>
                </div>

                {/* Name */}
                <div>
                  <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-[#52525e]' : 'text-slate-600'}`}>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full rounded-xl border px-4 py-3.5 transition-all duration-200 ${
                      isDark ? 'border-[#242428] bg-[#1a1a1e] text-white focus:border-primary-500' : 'border-[#ede9d5] bg-[#faf9f6] text-slate-900 focus:border-primary-500'
                    }`}
                    placeholder="Category name"
                    required
                  />
                </div>

                {/* Icon Picker */}
                <div>
                  <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-[#52525e]' : 'text-slate-600'}`}>Icon</label>
                  <div className={`grid grid-cols-6 gap-2 rounded-xl border p-3 sm:grid-cols-8 ${
                    isDark ? 'border-[#242428] bg-[#1a1a1e]' : 'border-[#ede9d5] bg-[#faf9f6]'
                  }`}>
                    {CATEGORY_ICONS.map((iconOption) => {
                      const IconComponent = iconOption.icon
                      return (
                        <button
                          key={iconOption.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: iconOption.id })}
                          className={`flex h-11 w-full items-center justify-center rounded-lg transition-all duration-200 active:scale-90 ${
                            formData.icon === iconOption.id
                              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                              : isDark ? 'bg-[#242428] text-[#52525e] hover:bg-[#2e2e34] hover:text-white' : 'bg-white text-slate-500 hover:bg-[#ede9d5] hover:text-slate-700'
                          }`}
                          title={iconOption.name}
                        >
                          <IconComponent className="h-5 w-5" strokeWidth={1.75} />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

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
