import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { useUser } from '../context/UserContext'
import { useTheme } from '../context/ThemeContext'
import { usersApi, transactionsApi } from '../api'
import StatCard from '../components/StatCard'
import type { Summary, ComparisonData, Transaction } from '../types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function Dashboard() {
  const { currentUser } = useUser()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [summary, setSummary] = useState<Summary | null>(null)
  const [comparison, setComparison] = useState<ComparisonData[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [comparisonMonths, setComparisonMonths] = useState(6)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      loadData()
    }
  }, [currentUser, comparisonMonths])

  const loadData = async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const [summaryData, comparisonData, transactionsData] = await Promise.all([
        usersApi.getSummary(currentUser.id),
        usersApi.getComparison(currentUser.id, comparisonMonths),
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const chartColors = {
    income: '#10b981',
    expense: '#ef4444',
    grid: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    text: isDark ? '#94a3b8' : '#64748b',
  }

  const lineChartData = {
    labels: comparison.map(c => c.label),
    datasets: [
      {
        label: 'Income',
        data: comparison.map(c => c.income),
        borderColor: chartColors.income,
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Expenses',
        data: comparison.map(c => c.expenses),
        borderColor: chartColors.expense,
        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: chartColors.text },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: chartColors.grid },
        ticks: {
          color: chartColors.text,
          callback: (value: number | string) => '$' + value,
        },
      },
      x: {
        grid: { display: false },
        ticks: { color: chartColors.text },
      },
    },
  }

  // Calculate category breakdown for doughnut chart
  const expensesByCategory: Record<string, number> = {}
  recentTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const categoryName = t.category?.name || 'Other'
      expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + t.amount
    })

  const pieColors = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16',
  ]

  const doughnutData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: pieColors,
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
        labels: { color: chartColors.text, boxWidth: 12, padding: 12 },
      },
    },
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-4 pb-24 lg:p-8 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-2xl font-bold lg:text-3xl ${isDark ? 'text-white' : 'text-slate-900'}`}
        >
          Dashboard
        </motion.h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
          Welcome back, {currentUser?.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Income"
          value={formatCurrency(summary?.currentMonth.income || 0)}
          icon="💰"
          color="green"
          delay={0}
        />
        <StatCard
          title="Expenses"
          value={formatCurrency(summary?.currentMonth.expenses || 0)}
          icon="💸"
          color="red"
          delay={0.1}
        />
        <StatCard
          title="Balance"
          value={formatCurrency(summary?.currentMonth.difference || 0)}
          icon={summary?.currentMonth.difference && summary.currentMonth.difference >= 0 ? '📈' : '📉'}
          color={summary?.currentMonth.difference && summary.currentMonth.difference >= 0 ? 'green' : 'red'}
          delay={0.2}
        />
        <StatCard
          title="Recurring"
          value={formatCurrency(summary?.recurring.monthlyExpenses || 0)}
          subtitle={`${summary?.recurring.count || 0} items`}
          icon="🔄"
          color="blue"
          delay={0.3}
        />
      </div>

      {/* Charts Row */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2 lg:gap-6">
        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl border p-4 shadow-sm sm:p-6 ${
            isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className={`text-base font-semibold sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Income vs Expenses
            </h2>
            <select
              value={comparisonMonths}
              onChange={(e) => setComparisonMonths(Number(e.target.value))}
              className={`rounded-lg border px-3 py-2 text-sm ${
                isDark
                  ? 'border-slate-600 bg-slate-700 text-white'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              <option value={1}>1 Month</option>
              <option value={2}>2 Months</option>
              <option value={3}>3 Months</option>
              <option value={6}>6 Months</option>
              <option value={12}>1 Year</option>
            </select>
          </div>
          <div className="h-56 sm:h-64">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </motion.div>

        {/* Doughnut Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl border p-4 shadow-sm sm:p-6 ${
            isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
          }`}
        >
          <h2 className={`mb-4 text-base font-semibold sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Expense Categories
          </h2>
          <div className="h-56 sm:h-64">
            {Object.keys(expensesByCategory).length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className={`flex h-full items-center justify-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                No expense data yet
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`rounded-2xl border shadow-sm ${
          isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
        }`}
      >
        <div className={`flex items-center justify-between border-b px-4 py-4 sm:px-6 ${
          isDark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <h2 className={`text-base font-semibold sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Recent Transactions
          </h2>
          <Link
            to="/app/transactions"
            className="text-sm font-medium text-primary-500 hover:text-primary-600"
          >
            View All
          </Link>
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {recentTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className={`flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 ${
                  isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl shadow-sm sm:h-11 sm:w-11 ${
                    isDark ? 'bg-slate-700' : 'bg-white'
                  }`}>
                    {transaction.category?.icon || '📋'}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {transaction.category?.name || 'Unknown'}
                    </p>
                    <p className={`text-xs truncate sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {new Date(transaction.date).toLocaleDateString()}
                      {transaction.notes && ` · ${transaction.notes}`}
                    </p>
                  </div>
                </div>
                <p className={`font-semibold whitespace-nowrap ${
                  transaction.type === 'income'
                    ? isDark ? 'text-green-400' : 'text-green-600'
                    : isDark ? 'text-red-400' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={`py-12 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            No transactions yet. Use Quick Add to create one!
          </div>
        )}
      </motion.div>
    </div>
  )
}
