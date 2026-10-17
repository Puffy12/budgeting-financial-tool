import type { ActiveElement, ChartData, ChartEvent, ChartOptions } from 'chart.js'
import { motion } from 'framer-motion'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Folder } from 'lucide-react'

interface Props {
  barChartData: ChartData<'bar'>
  barChartOptions: ChartOptions<'bar'>
  doughnutData: ChartData<'doughnut'>
  doughnutOptions: ChartOptions<'doughnut'>
  sortedCategories: [string, number][]
  onMonth: (index: number) => void
  onCategory: (name: string) => void
}

function pointCursor(event: ChartEvent, elements: ActiveElement[]) {
  const canvas = event.native?.target
  if (canvas instanceof HTMLCanvasElement) canvas.style.cursor = elements.length ? 'pointer' : 'default'
}

export function BreakdownCharts(props: Props) {
  const { barChartData, barChartOptions, doughnutData, doughnutOptions, sortedCategories, onMonth, onCategory } = props
  const barOptions: ChartOptions<'bar'> = {
    ...barChartOptions,
    onHover: pointCursor,
    onClick: (_event, elements) => {
      const index = elements[0]?.index
      if (index !== undefined) onMonth(index)
    },
  }
  const categoryOptions: ChartOptions<'doughnut'> = {
    ...doughnutOptions,
    onHover: pointCursor,
    onClick: (_event, elements) => {
      const index = elements[0]?.index
      if (index !== undefined) onCategory(sortedCategories[index][0])
    },
    plugins: {
      ...doughnutOptions.plugins,
      legend: {
        ...doughnutOptions.plugins?.legend,
        onClick: (_event, item) => {
          if (typeof item.index === 'number') onCategory(sortedCategories[item.index][0])
        },
      },
    },
  }
  return (
    <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}
              className={`card-hover panel p-5 sm:p-6`}>
              <h2 className={`mb-5 text-base font-semibold tracking-tight sm:text-lg text-[var(--text)]`}>Income vs Expenses</h2>
              <div className="h-56 sm:h-64"><Bar data={barChartData} options={barOptions} /></div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }}
              className={`card-hover panel p-5 sm:p-6`}>
              <h2 className={`mb-5 text-base font-semibold tracking-tight sm:text-lg text-[var(--text)]`}>Expense Categories</h2>
              <div className="h-56 sm:h-64">
                {sortedCategories.length > 0 ? (
                  <Doughnut data={doughnutData} options={categoryOptions} />
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
