import { useEffect, useState } from 'react'
import { useUser } from '../../../context/UserContext'
import type { Category } from '../../../types'
import { categoriesApi } from '../api'

export function useCategoriesPage() {
  const { currentUser } = useUser()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ name: '', type: 'expense' as 'income' | 'expense', icon: 'folder' })

  const loadCategories = async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      setCategories(await categoriesApi.getAll(currentUser.id))
    } catch (err) {
      console.error('Failed to load categories:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) loadCategories()
  }, [currentUser])

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!currentUser) return
    setError('')
    try {
      if (editingCategory) await categoriesApi.update(currentUser.id, editingCategory.id, formData)
      else await categoriesApi.create(currentUser.id, formData)
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

  const filteredCategories = categories.filter((category) => filter === 'all' || category.type === filter)
  return {
    loading, showModal, setShowModal, editingCategory, filter, setFilter, error, formData, setFormData,
    openCreateModal, openEditModal, handleSubmit, handleDelete, filteredCategories,
    expenseCategories: filteredCategories.filter((category) => category.type === 'expense'),
    incomeCategories: filteredCategories.filter((category) => category.type === 'income'),
  }
}
