import type { MonthlyData } from '../../types'

export const pieColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1']

export function buildBreakdownCharts(monthlyData: MonthlyData[], isDark: boolean) {
  const chartColors = {
    income: '#10b981',
    expense: '#ef4444',
    grid: isDark ? 'rgba(142, 235, 255, 0.16)' : 'rgba(0,0,0,0.06)',
    text: isDark ? '#e7f3fb' : '#4e5966',
  }
  const barChartData = {
    labels: monthlyData.map((month) => `${month.month}`),
    datasets: [
      { label: 'Income', data: monthlyData.map((month) => month.income), backgroundColor: chartColors.income, borderRadius: 8 },
      { label: 'Expenses', data: monthlyData.map((month) => month.expenses), backgroundColor: chartColors.expense, borderRadius: 8 },
    ],
  }
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { color: chartColors.text, usePointStyle: true, pointStyle: 'circle', padding: 20, font: { size: 12, weight: 500 as const } } },
      tooltip: { backgroundColor: isDark ? '#151b22' : '#f8f9fb', titleColor: isDark ? '#e8eef4' : '#12171d', bodyColor: isDark ? '#a8b4c0' : '#4e5966', borderColor: isDark ? '#4a5c6e' : '#8fa0b0', borderWidth: 1, padding: 12, cornerRadius: 12 },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: chartColors.grid }, border: { display: false }, ticks: { color: chartColors.text, callback: (value: number | string) => '$' + value, font: { size: 11 } } },
      x: { grid: { display: false }, border: { display: false }, ticks: { color: chartColors.text, font: { size: 11 } } },
    },
  }
  const categoryTotals: Record<string, number> = {}
  monthlyData.forEach((month) => {
    Object.entries(month.categoryBreakdown || {}).forEach(([name, values]) => {
      categoryTotals[name] = (categoryTotals[name] || 0) + values.expenses
    })
  })
  const sortedCategories = Object.entries(categoryTotals).filter(([, amount]) => amount > 0).sort((a, b) => b[1] - a[1])
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  const legendPosition: 'bottom' | 'right' = isMobile ? 'bottom' : 'right'
  const doughnutData = {
    labels: sortedCategories.map(([name]) => name),
    datasets: [{ data: sortedCategories.map(([, amount]) => amount), backgroundColor: pieColors.slice(0, sortedCategories.length), borderWidth: 0, hoverOffset: 4 }],
  }
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { position: legendPosition, labels: { color: chartColors.text, boxWidth: 10, padding: isMobile ? 8 : 10, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } } },
      tooltip: { backgroundColor: isDark ? '#151b22' : '#f8f9fb', titleColor: isDark ? '#e8eef4' : '#12171d', bodyColor: isDark ? '#a8b4c0' : '#4e5966', borderColor: isDark ? '#4a5c6e' : '#8fa0b0', borderWidth: 1, padding: 12, cornerRadius: 12 },
    },
  }
  return { barChartData, barChartOptions, doughnutData, doughnutOptions, sortedCategories }
}
