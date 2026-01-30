/**
 * Badge Component
 * Status indicators and labels
 */

import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'income' | 'expense'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 dark:bg-[#1a1a1e] dark:text-white',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    income: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    expense: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  }

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  )
}

/**
 * Status Badge - specifically for active/inactive states
 */
interface StatusBadgeProps {
  active: boolean
  activeText?: string
  inactiveText?: string
  className?: string
}

export function StatusBadge({
  active,
  activeText = 'Active',
  inactiveText = 'Inactive',
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      variant={active ? 'success' : 'default'}
      className={cn('gap-1', className)}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          active ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-[#52525e]'
        )}
      />
      {active ? activeText : inactiveText}
    </Badge>
  )
}

export default Badge
