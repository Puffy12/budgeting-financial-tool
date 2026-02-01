/**
 * Modal Component
 * Accessible modal dialog with animations
 */

import { Fragment, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
}

export function Modal({
  open,
  onClose,
  children,
  className,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
}: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  }

  return (
    <AnimatePresence>
      {open && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={closeOnOverlayClick ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'relative w-full rounded-2xl bg-white dark:bg-[#121214] border border-[#ede9d5] dark:border-[#1a1a1e] shadow-2xl',
                sizeClasses[size],
                className
              )}
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1a1a1e] hover:text-slate-600 dark:hover:text-white transition-colors z-10"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              {children}
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>
  )
}

interface ModalHeaderProps {
  children: ReactNode
  className?: string
}

export function ModalHeader({ children, className }: ModalHeaderProps) {
  return (
    <div className={cn('px-6 pt-6 pb-4', className)}>
      {children}
    </div>
  )
}

interface ModalTitleProps {
  children: ReactNode
  className?: string
}

export function ModalTitle({ children, className }: ModalTitleProps) {
  return (
    <h2 className={cn('text-lg font-semibold text-slate-900 dark:text-white', className)}>
      {children}
    </h2>
  )
}

interface ModalDescriptionProps {
  children: ReactNode
  className?: string
}

export function ModalDescription({ children, className }: ModalDescriptionProps) {
  return (
    <p className={cn('mt-1 text-sm text-slate-500 dark:text-[#52525e]', className)}>
      {children}
    </p>
  )
}

interface ModalBodyProps {
  children: ReactNode
  className?: string
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  )
}

interface ModalFooterProps {
  children: ReactNode
  className?: string
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn('flex items-center justify-end gap-3 px-6 py-4 border-t border-[#ede9d5] dark:border-[#1a1a1e]', className)}>
      {children}
    </div>
  )
}

export default Modal
