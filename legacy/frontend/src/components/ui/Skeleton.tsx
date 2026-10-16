/**
 * Skeleton Component
 * Loading placeholder animations
 */

import { cn } from '../../lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-slate-200 dark:bg-[#1a1a1e]',
        className
      )}
    />
  )
}

/**
 * SkeletonText - for text content
 */
interface SkeletonTextProps {
  lines?: number
  className?: string
}

export function SkeletonText({ lines = 1, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

/**
 * SkeletonCard - for card content
 */
interface SkeletonCardProps {
  hasImage?: boolean
  className?: string
}

export function SkeletonCard({ hasImage, className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[#ede9d5] dark:border-[#1a1a1e] p-4',
        className
      )}
    >
      {hasImage && <Skeleton className="h-32 w-full mb-4 rounded-xl" />}
      <Skeleton className="h-5 w-2/3 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  )
}

/**
 * SkeletonAvatar - for avatar placeholders
 */
interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function SkeletonAvatar({ size = 'md', className }: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  return (
    <Skeleton className={cn('rounded-full', sizeClasses[size], className)} />
  )
}

/**
 * SkeletonTable - for table content
 */
interface SkeletonTableProps {
  rows?: number
  columns?: number
  className?: string
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: SkeletonTableProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-[#ede9d5] dark:border-[#1a1a1e]">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn('h-4 flex-1', colIndex === 0 && 'w-1/3')}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * SkeletonStatCard - for dashboard stat cards
 */
export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[#ede9d5] dark:border-[#1a1a1e] p-6',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

export default Skeleton
