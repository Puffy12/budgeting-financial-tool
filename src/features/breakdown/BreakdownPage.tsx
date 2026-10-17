import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { useNavigate, useParams } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { renderCategoryIcon } from '../../components/CategoryGlyph'
import { buildBreakdownCharts, pieColors } from './breakdownCharts'
import { BreakdownCharts } from './components/BreakdownCharts'
import { CategoryBreakdownTable, MonthlyBreakdownTable } from './components/BreakdownTables'
import { MenuSelect } from '../../components/ui/Select'
import { categorySpendPath, monthBreakdownPath, rangeFromMonths } from './breakdownLinks'
import { useBreakdownPage } from './hooks/useBreakdownPage'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', minimumFractionDigits: 0,
}).format(amount)

export default function BreakdownPage() {
  const { userId = '' } = useParams()
  const navigate = useNavigate()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const page = useBreakdownPage()
  const charts = buildBreakdownCharts(page.monthlyData, isDark)
  const totalIncome = page.monthlyData.reduce((sum, month) => sum + month.income, 0)
  const totalExpenses = page.monthlyData.reduce((sum, month) => sum + month.expenses, 0)
  const totalDifference = totalIncome - totalExpenses
  const avgIncome = page.monthlyData.length > 0 ? totalIncome / page.monthlyData.length : 0
  const avgExpenses = page.monthlyData.length > 0 ? totalExpenses / page.monthlyData.length : 0
  const years = Array.from({ length: 5 }, (_, index) => new Date().getFullYear() - index)
  const txCount = page.monthlyData.reduce((sum, month) => sum + month.transactionCount, 0)

  return (
    <div className="p-4 pb-24 lg:p-8 lg:pb-8">
      <div className="mb-8">
        <h1 className={`text-2xl font-bold tracking-tight text-[var(--text)]`}>Breakdown</h1>
        <p className={`mt-1 text-[var(--muted)]`}>Detailed financial analysis</p>
      </div>
      <BreakdownFilters page={page} years={years} />
      {page.loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Summary label="Total Income" value={formatCurrency(totalIncome)} note={`Avg: ${formatCurrency(avgIncome)}/mo`} tone="income" isDark={isDark} />
            <Summary label="Total Expenses" value={formatCurrency(totalExpenses)} note={`Avg: ${formatCurrency(avgExpenses)}/mo`} tone="expense" isDark={isDark} />
            <Summary label="Net Savings" value={formatCurrency(totalDifference)} note={`Rate: ${totalIncome > 0 ? ((totalDifference / totalIncome) * 100).toFixed(0) : 0}%`} tone={totalDifference >= 0 ? 'income' : 'expense'} isDark={isDark} plain />
            <Summary label="Transactions" value={String(txCount)} note={`Avg: ${Math.round(txCount / Math.max(page.monthlyData.length, 1))}/mo`} tone="plain" isDark={isDark} plain />
          </div>
          <BreakdownCharts barChartData={charts.barChartData} barChartOptions={charts.barChartOptions} doughnutData={charts.doughnutData} doughnutOptions={charts.doughnutOptions} sortedCategories={charts.sortedCategories} onMonth={(index) => { const month = page.monthlyData[index]; if (month) navigate(monthBreakdownPath(userId, month.fullDate)) }} onCategory={(name) => { const category = page.categories.find((item) => item.name === name); const range = rangeFromMonths(page.monthlyData); if (category) navigate(categorySpendPath(userId, category.id, range.from, range.to)) }} />
          <MonthlyBreakdownTable isDark={isDark} userId={userId} range={rangeFromMonths(page.monthlyData)} monthlyData={page.monthlyData} totalIncome={totalIncome} totalExpenses={totalExpenses} totalDifference={totalDifference} formatCurrency={formatCurrency} sortedCategories={charts.sortedCategories} categories={page.categories} pieColors={pieColors} renderCategoryIcon={renderCategoryIcon} />
          <CategoryBreakdownTable isDark={isDark} userId={userId} range={rangeFromMonths(page.monthlyData)} monthlyData={page.monthlyData} totalIncome={totalIncome} totalExpenses={totalExpenses} totalDifference={totalDifference} formatCurrency={formatCurrency} sortedCategories={charts.sortedCategories} categories={page.categories} pieColors={pieColors} renderCategoryIcon={renderCategoryIcon} />
        </>
      )}
    </div>
  )
}

const monthOptions = [
  { value: '1', label: '1 Month' },
  { value: '2', label: '2 Months' },
  { value: '3', label: '3 Months' },
  { value: '6', label: '6 Months' },
  { value: '12', label: '12 Months' },
]

function BreakdownFilters({ page, years }: { page: ReturnType<typeof useBreakdownPage>; years: number[] }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="flex gap-1 rounded-xl bg-[var(--bg)] p-1">
        {(['monthly', 'yearly'] as const).map((mode) => (
          <button key={mode} onClick={() => page.setViewMode(mode)} className={`rounded-lg px-4 py-2 text-sm font-medium ${page.viewMode === mode ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text)]'}`}>
            {mode === 'monthly' ? 'Monthly' : 'Yearly'}
          </button>
        ))}
      </div>
      {page.viewMode === 'monthly' ? (
        <MenuSelect className="w-40" ariaLabel="Number of months" value={String(page.selectedMonths)} onChange={(value) => page.setSelectedMonths(Number(value))} options={monthOptions} />
      ) : (
        <MenuSelect className="w-32" ariaLabel="Year" value={String(page.selectedYear)} onChange={(value) => page.setSelectedYear(Number(value))} options={years.map((year) => ({ value: String(year), label: String(year) }))} />
      )}
    </div>
  )
}

function Summary({ label, value, note, tone, isDark, plain = false }: { label: string; value: string; note: string; tone: 'income' | 'expense' | 'plain'; isDark: boolean; plain?: boolean }) {
  const box = plain ? isDark ? 'bg-[var(--surface)]' : 'bg-[var(--surface)] border border-[var(--line)]' : tone === 'income' ? isDark ? 'bg-emerald-500/8 accent-income' : 'bg-emerald-50/80 accent-income' : isDark ? 'bg-red-500/8 accent-expense' : 'bg-red-50/80 accent-expense'
  const valueClass = plain ? 'text-[var(--text)]' : tone === 'income' ? isDark ? 'text-emerald-400' : 'text-emerald-700' : isDark ? 'text-red-400' : 'text-red-700'
  return (
    <div className={`rounded-xl p-4 ${box}`}>
      <p className={`text-xs font-medium uppercase tracking-wider ${plain ? 'text-[var(--muted)]' : tone === 'income' ? isDark ? 'text-emerald-400/70' : 'text-emerald-600/70' : isDark ? 'text-red-400/70' : 'text-red-600/70'}`}>{label}</p>
      <p className={`mt-1 text-xl font-bold money tabular-nums ${valueClass}`}>{value}</p>
      <p className={`mt-1 text-xs text-[var(--muted)]`}>{note}</p>
    </div>
  )
}
