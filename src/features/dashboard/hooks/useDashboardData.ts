import { useEffect, useState } from 'react'
import { useUser } from '../../../context/UserContext'
import type { ComparisonData, Summary, Transaction } from '../../../types'
import { transactionsApi } from '../../transactions/api'
import { usersApi } from '../api'

export function useDashboardData() {
  const { currentUser } = useUser()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [comparison, setComparison] = useState<ComparisonData[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [comparisonMonths, setComparisonMonths] = useState(6)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const now = new Date()
      const localMonth = now.getMonth()
      const localYear = now.getFullYear()
      const [summaryData, comparisonData, transactionsData] = await Promise.all([
        usersApi.getSummary(currentUser.id, { month: localMonth, year: localYear }),
        usersApi.getComparison(currentUser.id, comparisonMonths, { month: localMonth, year: localYear }),
        transactionsApi.getAll(currentUser.id, { limit: 5 }),
      ])
      setSummary(summaryData)
      setComparison(comparisonData)
      setRecentTransactions(transactionsData.transactions)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) loadData()
  }, [currentUser, comparisonMonths])

  useEffect(() => {
    const handleTransactionChange = () => {
      if (currentUser) loadData()
    }
    window.addEventListener('transaction-changed', handleTransactionChange)
    return () => window.removeEventListener('transaction-changed', handleTransactionChange)
  }, [currentUser])

  return { currentUser, summary, comparison, recentTransactions, comparisonMonths, setComparisonMonths, loading }
}
