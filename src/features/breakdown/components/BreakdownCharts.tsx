import type { ChartData, ChartOptions } from 'chart.js'
import { motion } from 'framer-motion'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Folder } from 'lucide-react'

interface Props {
  barChartData: ChartData<'bar'>
  barChartOptions: ChartOptions<'bar'>
  doughnutData: ChartData<'doughnut'>
  doughnutOptions: ChartOptions<'doughnut'>
  sortedCategories: [string, number][]
}

export function BreakdownCharts(props: Props) {
  const { barChartData, barChartOptions, doughnutData, doughnutOptions, sortedCategories } = props
  return (
    <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}
              className={`card-hover panel p-5 sm:p-6`}>
              <h2 className={`mb-5 text-base font-semibold tracking-tight sm:text-lg text-[var(--text)]`}>Income vs Expenses</h2>
              <div className="h-56 sm:h-64"><Bar data={barChartData} options={barChartOptions} /></div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }}
              className={`card-hover panel p-5 sm:p-6`}>
              <h2 className={`mb-5 text-base font-semibold tracking-tight sm:text-lg text-[var(--text)]`}>Expense Categories</h2>
              <div className="h-56 sm:h-64">
                {sortedCategories.length > 0 ? (
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                ) : (
                  <div className={`flex h-full flex-col items-center justify-center gap-3 text-[var(--muted)]`}>
                    <Folder className="h-10 w-10" strokeWidth={1.5} />
                    <span className="text-sm">No expense data</span>
                  </div>
                )}
              </div>
            </motion.div>
    </div>
  )
}
