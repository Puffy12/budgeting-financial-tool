import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'green' | 'red' | 'blue' | 'slate'
  delay?: number
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'slate',
  delay = 0,
}: StatCardProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const colorClasses = {
    green: {
      bg: isDark ? 'bg-emerald-500/8' : 'bg-emerald-50/80',
      text: isDark ? 'text-emerald-400' : 'text-emerald-600',
      icon: isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-600',
      border: isDark ? 'border-emerald-500/10' : 'border-emerald-100',
      accent: 'accent-income',
    },
    red: {
      bg: isDark ? 'bg-red-500/8' : 'bg-red-50/80',
      text: isDark ? 'text-red-400' : 'text-red-600',
      icon: isDark ? 'bg-red-500/15 text-red-400' : 'bg-red-100 text-red-600',
      border: isDark ? 'border-red-500/10' : 'border-red-100',
      accent: 'accent-expense',
    },
    blue: {
      bg: isDark ? 'bg-blue-500/8' : 'bg-blue-50/80',
      text: isDark ? 'text-blue-400' : 'text-blue-600',
      icon: isDark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-100 text-blue-600',
      border: isDark ? 'border-blue-500/10' : 'border-blue-100',
      accent: 'accent-primary',
    },
    slate: {
      bg: 'bg-[var(--surface)]',
      text: 'text-[var(--text)]',
      icon: isDark ? 'bg-[var(--surface)] text-[var(--muted)]' : 'bg-[var(--bg)] text-[var(--muted)]',
      border: 'border-[var(--line)]',
      accent: '',
    },
  }

  const colors = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`card-hover panel relative p-4 sm:p-5 ${colors.accent}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium uppercase tracking-wider sm:text-[11px] text-[var(--muted)]`}>
            {title}
          </p>
          <p className={`money mt-2 text-2xl font-bold tracking-tight truncate sm:text-3xl ${colors.text}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`mt-1 text-xs text-[var(--muted)]`}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={`mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium ${
              trend.isPositive
                ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                : isDark ? 'text-red-400' : 'text-red-600'
            }`}>
              <span className={`flex h-4 w-4 items-center justify-center rounded-full ${
                trend.isPositive
                  ? isDark ? 'bg-emerald-500/15' : 'bg-emerald-100'
                  : isDark ? 'bg-red-500/15' : 'bg-red-100'
              }`}>
                {trend.isPositive ? '↑' : '↓'}
              </span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-[var(--muted)]">vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${colors.icon}`}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.75} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
