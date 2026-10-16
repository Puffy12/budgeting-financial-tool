import type { ComparisonData, Transaction } from '../../types'

export function buildDashboardCharts(comparison: ComparisonData[], recentTransactions: Transaction[], isDark: boolean) {
  const chartColors = {
    income: '#10b981',
    expense: '#ef4444',
    grid: isDark ? 'rgba(142, 235, 255, 0.16)' : 'rgba(0,0,0,0.06)',
    text: isDark ? '#e7f3fb' : '#4e5966',
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
        pointBorderColor: isDark ? '#151b22' : '#f8f9fb',
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
        pointBorderColor: isDark ? '#151b22' : '#f8f9fb',
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
        backgroundColor: isDark ? '#151b22' : '#f8f9fb',
        titleColor: isDark ? '#e8eef4' : '#12171d',
        bodyColor: isDark ? '#a8b4c0' : '#4e5966',
        borderColor: isDark ? '#4a5c6e' : '#8fa0b0',
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
        backgroundColor: isDark ? '#151b22' : '#f8f9fb',
        titleColor: isDark ? '#e8eef4' : '#12171d',
        bodyColor: isDark ? '#a8b4c0' : '#4e5966',
        borderColor: isDark ? '#4a5c6e' : '#8fa0b0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
      },
    },
  }
  return { lineChartData, lineChartOptions, doughnutData, doughnutOptions, expensesByCategory }
}
