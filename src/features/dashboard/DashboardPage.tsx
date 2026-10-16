import { motion } from 'framer-motion'
import { ArcElement, CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js'
import { CreditCard, RefreshCw, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import StatCard from '../../components/StatCard'
import { renderCategoryIcon } from '../../components/CategoryGlyph'
import { buildDashboardCharts } from './dashboardCharts'
import { DashboardCharts } from './components/DashboardCharts'
import { RecentTransactions } from './components/RecentTransactions'
import { useDashboardData } from './hooks/useDashboardData'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler)

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0,
}).format(amount)

export default function DashboardPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const page = useDashboardData()
  const charts = buildDashboardCharts(page.comparison, page.recentTransactions, isDark)

  if (page.loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  const difference = page.summary?.currentMonth.difference
  return (
    <div className="p-4 pb-24 lg:p-8 lg:pb-8">
      <div className="mb-8">
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className={`text-2xl font-bold tracking-tight lg:text-3xl text-[var(--text)]`}>
          Dashboard
        </motion.h1>
        <p className={`mt-1 text-[var(--muted)]`}>Welcome back, {page.currentUser?.name}</p>
      </div>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard title="Income" value={formatCurrency(page.summary?.currentMonth.income || 0)} icon={Wallet} color="green" delay={0} />
        <StatCard title="Expenses" value={formatCurrency(page.summary?.currentMonth.expenses || 0)} icon={CreditCard} color="red" delay={0.1} />
        <StatCard title="Balance" value={formatCurrency(difference || 0)} icon={difference && difference >= 0 ? TrendingUp : TrendingDown} color={difference && difference >= 0 ? 'green' : 'red'} delay={0.2} />
        <StatCard title="Recurring" value={formatCurrency(page.summary?.recurring.monthlyExpenses || 0)} subtitle={`${page.summary?.recurring.count || 0} items`} icon={RefreshCw} color="blue" delay={0.3} />
      </div>
      <DashboardCharts
        comparisonMonths={page.comparisonMonths}
        setComparisonMonths={page.setComparisonMonths}
        lineChartData={charts.lineChartData}
        lineChartOptions={charts.lineChartOptions}
        doughnutData={charts.doughnutData}
        doughnutOptions={charts.doughnutOptions}
        expensesByCategory={charts.expensesByCategory}
      />
      <RecentTransactions
        isDark={isDark}
        recentTransactions={page.recentTransactions}
        formatCurrency={formatCurrency}
        renderCategoryIcon={renderCategoryIcon}
      />
    </div>
  )
}
