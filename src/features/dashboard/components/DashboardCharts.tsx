import type { ChartData, ChartOptions } from 'chart.js'
import { motion } from 'framer-motion'
import { Doughnut, Line } from 'react-chartjs-2'
import { Folder } from 'lucide-react'
import { MenuSelect } from '../../../components/ui/Select'

interface Props {
  comparisonMonths: number
  setComparisonMonths: (months: number) => void
  lineChartData: ChartData<'line'>
  lineChartOptions: ChartOptions<'line'>
  doughnutData: ChartData<'doughnut'>
  doughnutOptions: ChartOptions<'doughnut'>
  expensesByCategory: Record<string, number>
}

export function DashboardCharts(props: Props) {
  const { comparisonMonths, setComparisonMonths, lineChartData, lineChartOptions, doughnutData, doughnutOptions, expensesByCategory } = props
  return (
    <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`card-hover panel p-5 sm:p-6`}
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className={`text-base font-semibold tracking-tight sm:text-lg text-[var(--text)]`}>
              Income vs Expenses
            </h2>
            <MenuSelect
              className="w-36"
              ariaLabel="Number of months"
              value={String(comparisonMonths)}
              onChange={(value) => setComparisonMonths(Number(value))}
              options={[
                { value: '1', label: '1 Month' },
                { value: '2', label: '2 Months' },
                { value: '3', label: '3 Months' },
                { value: '6', label: '6 Months' },
                { value: '12', label: '1 Year' },
              ]}
            />
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
          className={`card-hover panel p-5 sm:p-6`}
        >
          <h2 className={`mb-5 text-base font-semibold tracking-tight sm:text-lg text-[var(--text)]`}>
            Expense Categories
          </h2>
          <div className="h-56 sm:h-64">
            {Object.keys(expensesByCategory).length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className={`flex h-full flex-col items-center justify-center gap-3 text-[var(--muted)]`}>
                <Folder className="h-10 w-10" strokeWidth={1.5} />
                <span className="text-sm">No expense data yet</span>
              </div>
            )}
          </div>
        </motion.div>
    </div>
  )
}
