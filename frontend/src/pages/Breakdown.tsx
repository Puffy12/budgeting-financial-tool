import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useUser } from '../context/UserContext'
import { usersApi, categoriesApi } from '../api'
import type { MonthlyData, Category } from '../types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

type ViewMode = 'monthly' | 'yearly'

export default function Breakdown() {
  const { currentUser } = useUser()
  const [viewMode, setViewMode] = useState<ViewMode>('monthly')
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedMonths, setSelectedMonths] = useState(6)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      loadData()
    }
  }, [currentUser, viewMode, selectedMonths, selectedYear])

  const loadData = async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const [monthlyStats, catData] = await Promise.all([
        usersApi.getMonthlyStats(currentUser.id, viewMode === 'monthly' ? selectedMonths : 12),
        categoriesApi.getAll(currentUser.id),
      ])
      setMonthlyData(monthlyStats)
      setCategories(catData)
    } catch (err) {
      console.error('Failed to load breakdown data:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  // Bar chart data
  const barChartData = {
    labels: monthlyData.map(m => `${m.month} ${m.year}`),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map(m => m.income),
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
      {
        label: 'Expenses',
        data: monthlyData.map(m => m.expenses),
        backgroundColor: '#ef4444',
        borderRadius: 6,
      },
    ],
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number | string) => '$' + value,
        },
      },
    },
  }

  // Calculate category totals for pie chart
  const categoryTotals: Record<string, number> = {}
  monthlyData.forEach(m => {
    Object.entries(m.categoryBreakdown || {}).forEach(([catName, values]) => {
      if (!categoryTotals[catName]) categoryTotals[catName] = 0
      categoryTotals[catName] += values.expenses
    })
  })

  // Sort and get top categories
  const sortedCategories = Object.entries(categoryTotals)
    .filter(([, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1])

  const pieColors = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ]

  const doughnutData = {
    labels: sortedCategories.map(([name]) => name),
    datasets: [
      {
        data: sortedCategories.map(([, amount]) => amount),
        backgroundColor: pieColors.slice(0, sortedCategories.length),
        borderWidth: 0,
      },
    ],
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  }

  // Totals
  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0)
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0)
  const totalDifference = totalIncome - totalExpenses
  const avgIncome = monthlyData.length > 0 ? totalIncome / monthlyData.length : 0
  const avgExpenses = monthlyData.length > 0 ? totalExpenses / monthlyData.length : 0

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Breakdown</h1>
        <p className="text-slate-500">Detailed analysis of your finances</p>
      </div>

      {/* View Mode & Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setViewMode('monthly')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              viewMode === 'monthly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setViewMode('yearly')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              viewMode === 'yearly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Yearly
          </button>
        </div>

        {viewMode === 'monthly' && (
          <select
            value={selectedMonths}
            onChange={(e) => setSelectedMonths(Number(e.target.value))}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 focus:border-primary-500 focus:outline-none"
          >
            <option value={1}>1 Month</option>
            <option value={2}>2 Months</option>
            <option value={3}>3 Months</option>
            <option value={6}>6 Months</option>
            <option value={12}>12 Months</option>
          </select>
        )}

        {viewMode === 'yearly' && (
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 focus:border-primary-500 focus:outline-none"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-green-200 bg-green-50 p-4"
            >
              <p className="text-sm font-medium text-green-600">Total Income</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(totalIncome)}</p>
              <p className="mt-1 text-xs text-green-600">Avg: {formatCurrency(avgIncome)}/mo</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <p className="text-sm font-medium text-red-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</p>
              <p className="mt-1 text-xs text-red-600">Avg: {formatCurrency(avgExpenses)}/mo</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <p className="text-sm font-medium text-slate-600">Net Savings</p>
              <p className={`text-2xl font-bold ${totalDifference >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(totalDifference)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Savings rate: {totalIncome > 0 ? ((totalDifference / totalIncome) * 100).toFixed(1) : 0}%
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <p className="text-sm font-medium text-slate-600">Transactions</p>
              <p className="text-2xl font-bold text-slate-700">
                {monthlyData.reduce((sum, m) => sum + m.transactionCount, 0)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Avg: {Math.round(monthlyData.reduce((sum, m) => sum + m.transactionCount, 0) / Math.max(monthlyData.length, 1))}/mo
              </p>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            {/* Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Income vs Expenses</h2>
              <div className="h-72">
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </motion.div>

            {/* Doughnut Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Expense Categories</h2>
              <div className="h-72">
                {sortedCategories.length > 0 ? (
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    No expense data
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Monthly Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Monthly Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Month</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Income</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Expenses</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Net</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((month) => (
                    <tr key={month.fullDate} className="border-b border-slate-100 last:border-0">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {month.month} {month.year}
                      </td>
                      <td className="px-6 py-4 text-right text-green-600">
                        {formatCurrency(month.income)}
                      </td>
                      <td className="px-6 py-4 text-right text-red-600">
                        {formatCurrency(month.expenses)}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${
                        month.difference >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(month.difference)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600">
                        {month.transactionCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">Total</td>
                    <td className="px-6 py-4 text-right font-semibold text-green-600">
                      {formatCurrency(totalIncome)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-red-600">
                      {formatCurrency(totalExpenses)}
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${
                      totalDifference >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(totalDifference)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-600">
                      {monthlyData.reduce((sum, m) => sum + m.transactionCount, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>

          {/* Category Breakdown Table */}
          {sortedCategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Category Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Category</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Total</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">% of Expenses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCategories.map(([name, amount], index) => {
                      const category = categories.find(c => c.name === name)
                      const percentage = totalExpenses > 0 ? (amount / totalExpenses * 100).toFixed(1) : 0
                      return (
                        <tr key={name} className="border-b border-slate-100 last:border-0">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: pieColors[index % pieColors.length] }}
                              />
                              <span className="text-xl">{category?.icon || '📋'}</span>
                              <span className="font-medium text-slate-900">{name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-slate-900">
                            {formatCurrency(amount)}
                          </td>
                          <td className="px-6 py-4 text-right text-slate-600">
                            {percentage}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
