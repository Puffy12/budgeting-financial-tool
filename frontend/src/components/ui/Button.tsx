/**
 * Button Component
 * Versatile button with multiple variants and sizes
 */

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'link'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary:
        'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:from-primary-600 hover:to-primary-700 disabled:from-primary-300 disabled:to-primary-400 disabled:shadow-none',
      secondary:
        'bg-slate-100 dark:bg-[#1a1a1e] text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-[#242428] disabled:opacity-50',
      danger:
        'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300',
      ghost:
        'text-slate-600 dark:text-[#52525e] hover:bg-slate-100 dark:hover:bg-[#1a1a1e] hover:text-slate-900 dark:hover:text-white',
      outline:
        'border border-[#ede9d5] dark:border-[#1a1a1e] text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#1a1a1e] disabled:opacity-50',
      link:
        'text-primary-500 hover:text-primary-600 underline-offset-4 hover:underline p-0 h-auto',
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
      md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
      lg: 'px-6 py-3 text-base rounded-xl gap-2',
      icon: 'p-2.5 rounded-xl',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-[#0a0a0b] disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export default Button
