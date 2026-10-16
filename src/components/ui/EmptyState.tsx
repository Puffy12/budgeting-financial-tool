/**
 * EmptyState Component
 * Display when no data is available
 */

import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg)] bg-[var(--surface)] text-[var(--muted)]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[var(--text)] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[var(--muted)] max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export default EmptyState
