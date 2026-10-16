import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Folder } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useUser } from '../../context/UserContext'
import { getIconById } from '../../lib/categoryIcons'
import type { Category, TransactionType } from '../../types'
import { categoriesApi } from '../../features/categories/api'
import { transactionsApi } from '../../features/transactions/api'
import { QuickAddAmount } from './QuickAddAmount'
import { QuickAddDetails } from './QuickAddDetails'

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
    if (open && currentUser) categoriesApi.getAll(currentUser.id).then(setCategories).catch(console.error)
  }, [open, currentUser])

  useEffect(() => {
    if (!open) return
    setAmount('')
    setCategoryId('')
    setDate(new Date().toISOString().split('T')[0])
    setNotes('')
    setError('')
    setShowMore(false)
    setShowCategories(true)
  }, [open])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!currentUser || !amount || !categoryId) return
    setLoading(true)
    setError('')
    try {
      await transactionsApi.create(currentUser.id, { amount: parseFloat(amount), type, categoryId, date, notes })
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction')
    } finally {
      setLoading(false)
    }
  }

  const handleNumPadPress = (value: string) => {
    if (value === 'backspace') setAmount((prev) => prev.slice(0, -1))
    else if (value === '.' && !amount.includes('.')) setAmount((prev) => prev + '.')
    else if (value !== '.') {
      const parts = amount.split('.')
      if (parts[1] && parts[1].length >= 2) return
      setAmount((prev) => prev + value)
    }
  }

  const renderCategoryIcon = (iconId: string | undefined, className = '') => {
    if (!iconId) return <Folder className={className} strokeWidth={1.75} />
    const IconComponent = getIconById(iconId)
    return <IconComponent className={className} strokeWidth={1.75} />
  }

  const fields = {
    isDark, type, setType, setCategoryId, setShowCategories, amount, setAmount, amountInputRef, handleNumPadPress,
    showCategories, selectedCategory: categories.find((category) => category.id === categoryId), renderCategoryIcon,
    filteredCategories: categories.filter((category) => category.type === type), categoryId,
    handleSelectCategory: (id: string) => { setCategoryId(id); setShowCategories(false) },
    showMore, setShowMore, date, setDate, notes, setNotes, error, loading, handleSubmit,
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className={`fixed inset-x-2 bottom-[max(8px,env(safe-area-inset-bottom))] z-50 max-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-16px)] overflow-hidden rounded-3xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[85vh] sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 bg-[var(--surface)]`}>
            <div className="max-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-16px)] overflow-y-auto pb-[env(safe-area-inset-bottom)] sm:max-h-[85vh] sm:pb-0">
              <div className="flex justify-center py-3 sm:hidden"><div className={`h-1 w-12 rounded-full ${isDark ? 'bg-[var(--surface)]' : 'bg-[var(--line)]'}`} /></div>
              <div className="flex items-center justify-between px-5 pb-3 sm:px-6 sm:pt-5">
                <button onClick={onClose} className={`-ml-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors text-[var(--muted)] active:bg-[var(--bg)]`}>Cancel</button>
                <h2 className={`text-base font-semibold tracking-tight text-[var(--text)]`}>Quick Add</h2>
                <button onClick={handleSubmit} disabled={loading || !amount || !categoryId} className={`-mr-2 rounded-xl px-3 py-2 text-sm font-semibold transition-opacity ${!amount || !categoryId ? 'opacity-40' : ''} ${type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>{loading ? '...' : 'Add'}</button>
              </div>
              <form onSubmit={handleSubmit}>
                <QuickAddAmount {...fields} />
                <QuickAddDetails {...fields} />
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
