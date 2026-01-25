import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: string
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
  icon,
  trend,
  color = 'slate',
  delay = 0,
}: StatCardProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const colorClasses = {
    green: {
      bg: isDark ? 'bg-green-500/10' : 'bg-green-50',
      text: isDark ? 'text-green-400' : 'text-green-600',
      icon: isDark ? 'bg-green-500/20' : 'bg-green-100',
    },
    red: {
      bg: isDark ? 'bg-red-500/10' : 'bg-red-50',
      text: isDark ? 'text-red-400' : 'text-red-600',
      icon: isDark ? 'bg-red-500/20' : 'bg-red-100',
    },
    blue: {
      bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50',
      text: isDark ? 'text-blue-400' : 'text-blue-600',
      icon: isDark ? 'bg-blue-500/20' : 'bg-blue-100',
    },
    slate: {
      bg: isDark ? 'bg-slate-700' : 'bg-slate-50',
      text: isDark ? 'text-slate-300' : 'text-slate-600',
      icon: isDark ? 'bg-slate-600' : 'bg-slate-100',
    },
  }

  const colors = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${
        isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {title}
          </p>
          <p className={`mt-1.5 text-xl font-bold truncate sm:mt-2 sm:text-2xl ${colors.text}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
              trend.isPositive
                ? isDark ? 'text-green-400' : 'text-green-600'
                : isDark ? 'text-red-400' : 'text-red-600'
            }`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${colors.icon}`}>
            <span className="text-xl sm:text-2xl">{icon}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
