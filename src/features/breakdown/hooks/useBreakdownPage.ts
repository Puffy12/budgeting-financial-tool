import { useEffect, useState } from 'react'
import { useUser } from '../../../context/UserContext'
import type { Category, MonthlyData } from '../../../types'
import { categoriesApi } from '../../categories/api'
import { usersApi } from '../../dashboard/api'

export function useBreakdownPage() {
  const { currentUser } = useUser()
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly')
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedMonths, setSelectedMonths] = useState(6)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return
    let cancelled = false
    setLoading(true)
    const now = new Date()
    const months = viewMode === 'yearly' ? 12 : selectedMonths
    const month = viewMode === 'yearly' ? 11 : now.getMonth()
    const year = viewMode === 'yearly' ? selectedYear : now.getFullYear()
    Promise.all([
      usersApi.getMonthlyStats(currentUser.id, months, { month, year }),
      categoriesApi.getAll(currentUser.id),
    ]).then(([monthlyStats, catData]) => {
      if (cancelled) return
      setMonthlyData(monthlyStats)
      setCategories(catData)
    }).catch((err) => {
      console.error('Failed to load breakdown data:', err)
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [currentUser, viewMode, selectedMonths, selectedYear])

  return { viewMode, setViewMode, monthlyData, categories, selectedMonths, setSelectedMonths, selectedYear, setSelectedYear, loading }
}
