/**
 * Avatar Component
 * User avatar with fallback initials
 */

import { cn } from '../../lib/utils'
import { getInitials } from '../../lib/utils'

interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  className,
}: AvatarProps) {
  const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  }

  const initials = name ? getInitials(name) : '?'

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={cn(
          'rounded-full object-cover',
          sizeClasses[size],
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-500 text-white font-semibold shadow-lg shadow-primary-500/25',
        sizeClasses[size],
        className
      )}
      title={name}
    >
      {initials}
    </div>
  )
}

/**
 * AvatarGroup - for displaying multiple avatars
 */
interface AvatarGroupProps {
  avatars: Array<{ src?: string; name: string }>
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = 'md',
  className,
}: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max)
  const remainingCount = avatars.length - max

  const overlapClasses = {
    xs: '-ml-2 first:ml-0',
    sm: '-ml-2.5 first:ml-0',
    md: '-ml-3 first:ml-0',
    lg: '-ml-4 first:ml-0',
  }

  return (
    <div className={cn('flex items-center', className)}>
      {visibleAvatars.map((avatar, index) => (
        <div
          key={index}
          className={cn(
            'ring-2 ring-white dark:ring-[#121214] rounded-full',
            overlapClasses[size]
          )}
        >
          <Avatar
            src={avatar.src}
            name={avatar.name}
            size={size}
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-slate-200 dark:bg-[#1a1a1e] text-slate-600 dark:text-white font-medium ring-2 ring-white dark:ring-[#121214]',
            overlapClasses[size],
            size === 'xs' && 'h-6 w-6 text-[10px]',
            size === 'sm' && 'h-8 w-8 text-xs',
            size === 'md' && 'h-10 w-10 text-sm',
            size === 'lg' && 'h-12 w-12 text-base'
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

export default Avatar
