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
import {
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowRight,
  Folder,
} from 'lucide-react'
import { getIconById } from '../utils/categoryIcons'

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

  // Listen for transaction changes from QuickAdd modal or other sources
  useEffect(() => {
    const handleTransactionChange = () => {
      if (currentUser) {
        loadData()
      }
    }
    window.addEventListener('transaction-changed', handleTransactionChange)
    return () => window.removeEventListener('transaction-changed', handleTransactionChange)
  }, [currentUser])

  const loadData = async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      // Get the current month/year in the user's local timezone
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
    grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    text: isDark ? '#52525e' : '#94a3b8',
  }

  const lineChartData = {
    labels: comparison.map(c => c.label),
    datasets: [
      {
        label: 'Income',
        data: comparison.map(c => c.income),
        borderColor: chartColors.income,
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: chartColors.income,
        pointBorderColor: isDark ? '#121214' : '#ffffff',
        pointBorderWidth: 2,
      },
      {
        label: 'Expenses',
        data: comparison.map(c => c.expenses),
        borderColor: chartColors.expense,
        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: chartColors.expense,
        pointBorderColor: isDark ? '#121214' : '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { 
          color: chartColors.text,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { size: 12, weight: 500 as const },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1a1a1e' : '#ffffff',
        titleColor: isDark ? '#ffffff' : '#0f172a',
        bodyColor: isDark ? '#94a3b8' : '#64748b',
        borderColor: isDark ? '#242428' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
        usePointStyle: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: chartColors.grid },
        border: { display: false },
        ticks: {
          color: chartColors.text,
          callback: (value: number | string) => '$' + value,
          font: { size: 11 },
        },
      },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: chartColors.text, font: { size: 11 } },
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
        hoverOffset: 4,
      },
    ],
  }

  // Detect mobile for chart legend position
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  const legendPosition: 'bottom' | 'right' = isMobile ? 'bottom' : 'right'

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: legendPosition,
        labels: { 
          color: chartColors.text, 
          boxWidth: 10, 
          padding: isMobile ? 8 : 12,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1a1a1e' : '#ffffff',
        titleColor: isDark ? '#ffffff' : '#0f172a',
        bodyColor: isDark ? '#94a3b8' : '#64748b',
        borderColor: isDark ? '#242428' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
      },
    },
  }

  // Helper to render category icon
  const renderCategoryIcon = (iconId: string | undefined, className: string = '') => {
    if (!iconId) return <Folder className={className} strokeWidth={1.75} />
    const IconComponent = getIconById(iconId)
    return <IconComponent className={className} strokeWidth={1.75} />
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-4 pb-24 lg:p-8 lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-2xl font-bold tracking-tight lg:text-3xl ${isDark ? 'text-white' : 'text-slate-900'}`}
        >
          Dashboard
        </motion.h1>
        <p className={`mt-1 ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>
          Welcome back, {currentUser?.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Income"
          value={formatCurrency(summary?.currentMonth.income || 0)}
          icon={Wallet}
          color="green"
          delay={0}
        />
        <StatCard
          title="Expenses"
          value={formatCurrency(summary?.currentMonth.expenses || 0)}
          icon={CreditCard}
          color="red"
          delay={0.1}
        />
        <StatCard
          title="Balance"
          value={formatCurrency(summary?.currentMonth.difference || 0)}
          icon={summary?.currentMonth.difference && summary.currentMonth.difference >= 0 ? TrendingUp : TrendingDown}
          color={summary?.currentMonth.difference && summary.currentMonth.difference >= 0 ? 'green' : 'red'}
          delay={0.2}
        />
        <StatCard
          title="Recurring"
          value={formatCurrency(summary?.recurring.monthlyExpenses || 0)}
          subtitle={`${summary?.recurring.count || 0} items`}
          icon={RefreshCw}
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
          transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`card-hover rounded-2xl border p-5 sm:p-6 ${
            isDark ? 'border-[#1a1a1e] bg-[#121214]' : 'border-[#ede9d5] bg-white'
          }`}
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className={`text-base font-semibold tracking-tight sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Income vs Expenses
            </h2>
            <select
              value={comparisonMonths}
              onChange={(e) => setComparisonMonths(Number(e.target.value))}
              className={`rounded-xl border px-3 py-2 text-sm transition-all ${
                isDark
                  ? 'border-[#242428] bg-[#1a1a1e] text-white focus:border-primary-500'
                  : 'border-[#ede9d5] bg-[#faf9f6] text-slate-700 focus:border-primary-500'
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
          transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`card-hover rounded-2xl border p-5 sm:p-6 ${
            isDark ? 'border-[#1a1a1e] bg-[#121214]' : 'border-[#ede9d5] bg-white'
          }`}
        >
          <h2 className={`mb-5 text-base font-semibold tracking-tight sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Expense Categories
          </h2>
          <div className="h-56 sm:h-64">
            {Object.keys(expensesByCategory).length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className={`flex h-full flex-col items-center justify-center gap-3 ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
                <Folder className="h-10 w-10" strokeWidth={1.5} />
                <span className="text-sm">No expense data yet</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`card-hover rounded-2xl border ${
          isDark ? 'border-[#1a1a1e] bg-[#121214]' : 'border-[#ede9d5] bg-white'
        }`}
      >
        <div className={`flex items-center justify-between border-b px-5 py-4 sm:px-6 ${
          isDark ? 'border-[#1a1a1e]' : 'border-[#ede9d5]'
        }`}>
          <h2 className={`text-base font-semibold tracking-tight sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Recent Transactions
          </h2>
          <Link
            to="transactions"
            className="flex items-center gap-1.5 text-sm font-medium text-primary-500 transition-colors hover:text-primary-600"
          >
            View All
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className={`divide-y ${isDark ? 'divide-[#1a1a1e]' : 'divide-[#ede9d5]'}`}>
            {recentTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05, duration: 0.3 }}
                className={`flex items-center justify-between px-5 py-4 transition-colors sm:px-6 ${
                  isDark ? 'hover:bg-[#1a1a1e]/50' : 'hover:bg-[#faf9f6]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    isDark ? 'bg-[#1a1a1e]' : 'bg-[#f5f5dc]/60'
                  }`}>
                    {renderCategoryIcon(transaction.category?.icon, `h-5 w-5 ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`)}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {transaction.category?.name || 'Unknown'}
                    </p>
                    <p className={`text-xs truncate ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
                      {new Date(transaction.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {transaction.notes && ` · ${transaction.notes}`}
                    </p>
                  </div>
                </div>
                <p className={`font-semibold tabular-nums whitespace-nowrap ${
                  transaction.type === 'income'
                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                    : isDark ? 'text-red-400' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={`flex flex-col items-center justify-center gap-3 py-16 ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
            <Folder className="h-10 w-10" strokeWidth={1.5} />
            <span className="text-sm">No transactions yet. Use Quick Add to create one!</span>
          </div>
        )}
      </motion.div>
    </div>
  )
}
