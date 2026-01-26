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
import { useTheme } from '../context/ThemeContext'
import { usersApi, categoriesApi } from '../api'
import type { MonthlyData, Category } from '../types'
import { getIconById } from '../utils/categoryIcons'
import { Folder } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

type ViewMode = 'monthly' | 'yearly'

export default function Breakdown() {
  const { currentUser } = useUser()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
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
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
  }

  const chartColors = {
    income: '#10b981',
    expense: '#ef4444',
    grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    text: isDark ? '#52525e' : '#94a3b8',
  }

  const barChartData = {
    labels: monthlyData.map(m => `${m.month}`),
    datasets: [
      { label: 'Income', data: monthlyData.map(m => m.income), backgroundColor: chartColors.income, borderRadius: 8 },
      { label: 'Expenses', data: monthlyData.map(m => m.expenses), backgroundColor: chartColors.expense, borderRadius: 8 },
    ],
  }

  const barChartOptions = {
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
        } 
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
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { color: chartColors.grid }, 
        border: { display: false },
        ticks: { color: chartColors.text, callback: (value: number | string) => '$' + value, font: { size: 11 } } 
      },
      x: { 
        grid: { display: false }, 
        border: { display: false },
        ticks: { color: chartColors.text, font: { size: 11 } } 
      },
    },
  }

  const categoryTotals: Record<string, number> = {}
  monthlyData.forEach(m => {
    Object.entries(m.categoryBreakdown || {}).forEach(([catName, values]) => {
      if (!categoryTotals[catName]) categoryTotals[catName] = 0
      categoryTotals[catName] += values.expenses
    })
  })

  const sortedCategories = Object.entries(categoryTotals).filter(([, amount]) => amount > 0).sort((a, b) => b[1] - a[1])
  const pieColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1']

  const doughnutData = {
    labels: sortedCategories.map(([name]) => name),
    datasets: [{ data: sortedCategories.map(([, amount]) => amount), backgroundColor: pieColors.slice(0, sortedCategories.length), borderWidth: 0, hoverOffset: 4 }],
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: { 
      legend: { 
        position: 'right' as const, 
        labels: { 
          color: chartColors.text, 
          boxWidth: 10, 
          padding: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11 },
        } 
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

  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0)
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0)
  const totalDifference = totalIncome - totalExpenses
  const avgIncome = monthlyData.length > 0 ? totalIncome / monthlyData.length : 0
  const avgExpenses = monthlyData.length > 0 ? totalExpenses / monthlyData.length : 0
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  // Helper to render category icon
  const renderCategoryIcon = (iconId: string | undefined, className: string = '') => {
    if (!iconId) return <Folder className={className} strokeWidth={1.75} />
    const IconComponent = getIconById(iconId)
    return <IconComponent className={className} strokeWidth={1.75} />
  }

  return (
    <div className="p-4 pb-24 lg:p-8 lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Breakdown</h1>
        <p className={`mt-1 ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>Detailed financial analysis</p>
      </div>

      {/* View Mode & Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className={`flex gap-1 rounded-xl p-1 ${isDark ? 'bg-[#1a1a1e]' : 'bg-[#f5f5dc]/60'}`}>
          <button
            onClick={() => setViewMode('monthly')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              viewMode === 'monthly'
                ? isDark ? 'bg-[#242428] text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                : isDark ? 'text-[#52525e]' : 'text-slate-500'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setViewMode('yearly')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              viewMode === 'yearly'
                ? isDark ? 'bg-[#242428] text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                : isDark ? 'text-[#52525e]' : 'text-slate-500'
            }`}
          >
            Yearly
          </button>
        </div>

        {viewMode === 'monthly' && (
          <select
            value={selectedMonths}
            onChange={(e) => setSelectedMonths(Number(e.target.value))}
            className={`rounded-xl border px-4 py-2.5 text-sm transition-all duration-200 ${
              isDark ? 'border-[#242428] bg-[#1a1a1e] text-white focus:border-primary-500' : 'border-[#ede9d5] bg-white text-slate-700 focus:border-primary-500'
            }`}
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
            className={`rounded-xl border px-4 py-2.5 text-sm transition-all duration-200 ${
              isDark ? 'border-[#242428] bg-[#1a1a1e] text-white focus:border-primary-500' : 'border-[#ede9d5] bg-white text-slate-700 focus:border-primary-500'
            }`}
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className={`rounded-xl p-4 accent-income ${isDark ? 'bg-emerald-500/8' : 'bg-emerald-50/80'}`}>
              <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-emerald-400/70' : 'text-emerald-600/70'}`}>Total Income</p>
              <p className={`mt-1 text-xl font-bold tabular-nums ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{formatCurrency(totalIncome)}</p>
              <p className={`mt-1 text-[10px] ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/50'}`}>Avg: {formatCurrency(avgIncome)}/mo</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}
              className={`rounded-xl p-4 accent-expense ${isDark ? 'bg-red-500/8' : 'bg-red-50/80'}`}>
              <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-red-400/70' : 'text-red-600/70'}`}>Total Expenses</p>
              <p className={`mt-1 text-xl font-bold tabular-nums ${isDark ? 'text-red-400' : 'text-red-700'}`}>{formatCurrency(totalExpenses)}</p>
              <p className={`mt-1 text-[10px] ${isDark ? 'text-red-500/50' : 'text-red-600/50'}`}>Avg: {formatCurrency(avgExpenses)}/mo</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}
              className={`rounded-xl p-4 ${isDark ? 'bg-[#1a1a1e]' : 'bg-white border border-[#ede9d5]'}`}>
              <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>Net Savings</p>
              <p className={`mt-1 text-xl font-bold tabular-nums ${totalDifference >= 0 ? isDark ? 'text-emerald-400' : 'text-emerald-700' : isDark ? 'text-red-400' : 'text-red-700'}`}>{formatCurrency(totalDifference)}</p>
              <p className={`mt-1 text-[10px] ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>Rate: {totalIncome > 0 ? ((totalDifference / totalIncome) * 100).toFixed(0) : 0}%</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }}
              className={`rounded-xl p-4 ${isDark ? 'bg-[#1a1a1e]' : 'bg-white border border-[#ede9d5]'}`}>
              <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>Transactions</p>
              <p className={`mt-1 text-xl font-bold tabular-nums ${isDark ? 'text-white' : 'text-slate-700'}`}>{monthlyData.reduce((sum, m) => sum + m.transactionCount, 0)}</p>
              <p className={`mt-1 text-[10px] ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>Avg: {Math.round(monthlyData.reduce((sum, m) => sum + m.transactionCount, 0) / Math.max(monthlyData.length, 1))}/mo</p>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}
              className={`card-hover rounded-2xl border p-5 sm:p-6 ${isDark ? 'border-[#1a1a1e] bg-[#121214]' : 'border-[#ede9d5] bg-white'}`}>
              <h2 className={`mb-5 text-base font-semibold tracking-tight sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Income vs Expenses</h2>
              <div className="h-56 sm:h-64"><Bar data={barChartData} options={barChartOptions} /></div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }}
              className={`card-hover rounded-2xl border p-5 sm:p-6 ${isDark ? 'border-[#1a1a1e] bg-[#121214]' : 'border-[#ede9d5] bg-white'}`}>
              <h2 className={`mb-5 text-base font-semibold tracking-tight sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Expense Categories</h2>
              <div className="h-56 sm:h-64">
                {sortedCategories.length > 0 ? (
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                ) : (
                  <div className={`flex h-full flex-col items-center justify-center gap-3 ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
                    <Folder className="h-10 w-10" strokeWidth={1.5} />
                    <span className="text-sm">No expense data</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Monthly Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.3 }}
            className={`card-hover rounded-2xl border ${isDark ? 'border-[#1a1a1e] bg-[#121214]' : 'border-[#ede9d5] bg-white'}`}>
            <div className={`border-b px-5 py-4 sm:px-6 ${isDark ? 'border-[#1a1a1e]' : 'border-[#ede9d5]'}`}>
              <h2 className={`text-base font-semibold tracking-tight sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Monthly Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-[#1a1a1e]' : 'border-[#ede9d5]'}`}>
                    <th className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider sm:px-6 ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>Month</th>
                    <th className={`px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider sm:px-6 ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>Income</th>
                    <th className={`px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider sm:px-6 ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>Expenses</th>
                    <th className={`px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider sm:px-6 ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>Net</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-[#1a1a1e]' : 'divide-[#ede9d5]'}`}>
                  {monthlyData.map((month) => (
                    <tr key={month.fullDate} className={`transition-colors ${isDark ? 'hover:bg-[#1a1a1e]/50' : 'hover:bg-[#faf9f6]'}`}>
                      <td className={`px-5 py-3.5 font-medium sm:px-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{month.month} {month.year}</td>
                      <td className={`px-5 py-3.5 text-right tabular-nums sm:px-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{formatCurrency(month.income)}</td>
                      <td className={`px-5 py-3.5 text-right tabular-nums sm:px-6 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{formatCurrency(month.expenses)}</td>
                      <td className={`px-5 py-3.5 text-right font-medium tabular-nums sm:px-6 ${month.difference >= 0 ? isDark ? 'text-emerald-400' : 'text-emerald-600' : isDark ? 'text-red-400' : 'text-red-600'}`}>
                        {formatCurrency(month.difference)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className={isDark ? 'bg-[#1a1a1e]/30' : 'bg-[#faf9f6]'}>
                    <td className={`px-5 py-3.5 font-semibold sm:px-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Total</td>
                    <td className={`px-5 py-3.5 text-right font-semibold tabular-nums sm:px-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{formatCurrency(totalIncome)}</td>
                    <td className={`px-5 py-3.5 text-right font-semibold tabular-nums sm:px-6 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{formatCurrency(totalExpenses)}</td>
                    <td className={`px-5 py-3.5 text-right font-semibold tabular-nums sm:px-6 ${totalDifference >= 0 ? isDark ? 'text-emerald-400' : 'text-emerald-600' : isDark ? 'text-red-400' : 'text-red-600'}`}>
                      {formatCurrency(totalDifference)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>

          {/* Category Breakdown */}
          {sortedCategories.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.3 }}
              className={`mt-6 card-hover rounded-2xl border ${isDark ? 'border-[#1a1a1e] bg-[#121214]' : 'border-[#ede9d5] bg-white'}`}>
              <div className={`border-b px-5 py-4 sm:px-6 ${isDark ? 'border-[#1a1a1e]' : 'border-[#ede9d5]'}`}>
                <h2 className={`text-base font-semibold tracking-tight sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Category Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-[#1a1a1e]' : 'border-[#ede9d5]'}`}>
                      <th className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider sm:px-6 ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>Category</th>
                      <th className={`px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider sm:px-6 ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>Total</th>
                      <th className={`px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider sm:px-6 ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>%</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#1a1a1e]' : 'divide-[#ede9d5]'}`}>
                    {sortedCategories.map(([name, amount], idx) => {
                      const category = categories.find(c => c.name === name)
                      return (
                        <tr key={name} className={`transition-colors ${isDark ? 'hover:bg-[#1a1a1e]/50' : 'hover:bg-[#faf9f6]'}`}>
                          <td className="px-5 py-3.5 sm:px-6">
                            <div className="flex items-center gap-3">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pieColors[idx % pieColors.length] }} />
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? 'bg-[#1a1a1e]' : 'bg-[#f5f5dc]/60'}`}>
                                {renderCategoryIcon(category?.icon, `h-4 w-4 ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`)}
                              </div>
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{name}</span>
                            </div>
                          </td>
                          <td className={`px-5 py-3.5 text-right tabular-nums sm:px-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(amount)}</td>
                          <td className={`px-5 py-3.5 text-right tabular-nums sm:px-6 ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>
                            {totalExpenses > 0 ? (amount / totalExpenses * 100).toFixed(1) : 0}%
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
