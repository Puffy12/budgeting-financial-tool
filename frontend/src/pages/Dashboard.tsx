import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
    }).format(amount)
  }

  const lineChartData = {
    labels: comparison.map(c => c.label),
    datasets: [
      {
        label: 'Income',
        data: comparison.map(c => c.income),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: comparison.map(c => c.expenses),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const lineChartOptions = {
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

  // Calculate category breakdown for doughnut chart
  const expensesByCategory: Record<string, number> = {}
  recentTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const categoryName = t.category?.name || 'Other'
      expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + t.amount
    })

  const doughnutData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: [
          '#10b981',
          '#3b82f6',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899',
          '#06b6d4',
          '#84cc16',
        ],
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

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-slate-900 lg:text-3xl"
        >
          Dashboard
        </motion.h1>
        <p className="mt-1 text-slate-500">Welcome back, {currentUser?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Income"
          value={formatCurrency(summary?.currentMonth.income || 0)}
          icon="💰"
          color="green"
          delay={0}
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(summary?.currentMonth.expenses || 0)}
          icon="💸"
          color="red"
          delay={0.1}
        />
        <StatCard
          title="Net Balance"
          value={formatCurrency(summary?.currentMonth.difference || 0)}
          icon={summary?.currentMonth.difference && summary.currentMonth.difference >= 0 ? '📈' : '📉'}
          color={summary?.currentMonth.difference && summary.currentMonth.difference >= 0 ? 'green' : 'red'}
          delay={0.2}
        />
        <StatCard
          title="Recurring Monthly"
          value={formatCurrency(summary?.recurring.monthlyExpenses || 0)}
          subtitle={`${summary?.recurring.count || 0} active items`}
          icon="🔄"
          color="blue"
          delay={0.3}
        />
      </div>

      {/* Charts Row */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Income vs Expenses</h2>
            <select
              value={comparisonMonths}
              onChange={(e) => setComparisonMonths(Number(e.target.value))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 focus:border-primary-500 focus:outline-none"
            >
              <option value={1}>1 Month</option>
              <option value={2}>2 Months</option>
              <option value={3}>3 Months</option>
              <option value={6}>6 Months</option>
              <option value={12}>1 Year</option>
            </select>
          </div>
          <div className="h-64">
            <Line data={lineChartData} options={lineChartOptions} />
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
          <div className="h-64">
            {Object.keys(expensesByCategory).length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
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
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Transactions</h2>
          <a
            href="/app/transactions"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View All
          </a>
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xl shadow-sm">
                    {transaction.category?.icon || '📋'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {transaction.category?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(transaction.date).toLocaleDateString()}
                      {transaction.notes && ` · ${transaction.notes}`}
                    </p>
                  </div>
                </div>
                <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400">
            No transactions yet. Use Quick Add to create one!
          </div>
        )}
      </motion.div>
    </div>
  )
}
