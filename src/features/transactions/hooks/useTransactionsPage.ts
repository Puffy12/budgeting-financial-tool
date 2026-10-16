import { useEffect, useState } from 'react'
import { useUser } from '../../../context/UserContext'
import { categoriesApi } from '../../categories/api'
import { transactionsApi } from '../api'
import type { Category, Transaction } from '../../../types'

export function useTransactionsPage() {
  const { currentUser } = useUser()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [filter, setFilter] = useState<{ type?: 'income' | 'expense' }>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

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

  useEffect(() => {
    if (currentUser) loadData()
  }, [currentUser, filter])

  useEffect(() => {
    const handleTransactionChange = () => {
      if (currentUser) loadData()
    }
    window.addEventListener('transaction-changed', handleTransactionChange)
    return () => window.removeEventListener('transaction-changed', handleTransactionChange)
  }, [currentUser, filter])

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!currentUser) return
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        categoryId: formData.categoryId,
        date: formData.date,
        notes: formData.notes,
      }
      if (editingTransaction) {
        await transactionsApi.update(currentUser.id, editingTransaction.id, payload)
      } else {
        await transactionsApi.create(currentUser.id, payload)
      }
      setShowModal(false)
      loadData()
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
      window.dispatchEvent(new CustomEvent('transaction-changed'))
    } catch (err) {
      console.error('Failed to delete transaction:', err)
    }
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)

  return {
    transactions, categories, loading, showModal, setShowModal, editingTransaction, filter, setFilter,
    expandedId, setExpandedId, formData, setFormData, openCreateModal, openEditModal, handleSubmit,
    handleDelete, formatCurrency,
    filteredCategories: categories.filter((category) => category.type === formData.type),
    totalIncome: transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0),
    totalExpenses: transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0),
  }
}
