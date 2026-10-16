import { useEffect, useState } from 'react'
import { useUser } from '../../../context/UserContext'
import type { Category, Frequency, RecurringTransaction } from '../../../types'
import { categoriesApi } from '../../categories/api'
import { recurringApi } from '../api'
import { monthlyTotal } from '../frequency'

export function useRecurringPage() {
  const { currentUser } = useUser()
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    categoryId: '',
    frequency: 'monthly' as Frequency,
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
  })

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

  useEffect(() => {
    if (currentUser) loadData()
  }, [currentUser])

  const openCreateModal = () => {
    setEditingRecurring(null)
    setFormData({
      name: '', amount: '', type: 'expense', categoryId: '', frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0], notes: '',
    })
    setShowModal(true)
  }

  const openEditModal = (rec: RecurringTransaction) => {
    setEditingRecurring(rec)
    setFormData({
      name: rec.name, amount: rec.amount.toString(), type: rec.type, categoryId: rec.categoryId,
      frequency: rec.frequency, startDate: rec.startDate, notes: rec.notes,
    })
    setShowModal(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!currentUser) return
    try {
      const payload = {
        name: formData.name, amount: parseFloat(formData.amount), type: formData.type,
        categoryId: formData.categoryId, frequency: formData.frequency, notes: formData.notes,
      }
      if (editingRecurring) await recurringApi.update(currentUser.id, editingRecurring.id, payload)
      else await recurringApi.create(currentUser.id, { ...payload, startDate: formData.startDate })
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

  const filteredRecurring = recurring.filter((item) => {
    if (filter === 'active') return item.isActive
    if (filter === 'inactive') return !item.isActive
    return true
  })
  const totalMonthlyExpenses = recurring.filter((item) => item.isActive && item.type === 'expense')
    .reduce((sum, item) => sum + monthlyTotal(item.amount, item.frequency), 0)
  const totalMonthlyIncome = recurring.filter((item) => item.isActive && item.type === 'income')
    .reduce((sum, item) => sum + monthlyTotal(item.amount, item.frequency), 0)

  return {
    loading, showModal, setShowModal, editingRecurring, filter, setFilter, formData, setFormData,
    openCreateModal, openEditModal, handleSubmit, handleToggleActive, handleDelete, handleProcess,
    filteredRecurring, totalMonthlyExpenses, totalMonthlyIncome,
    filteredCategories: categories.filter((category) => category.type === formData.type),
    formatCurrency: (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount),
  }
}
