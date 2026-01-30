/**
 * Confirm Dialog Component
 * Confirmation dialog for destructive actions
 */

import { AlertTriangle, Trash2 } from 'lucide-react'
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from './Modal'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const iconClasses = {
    danger: 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    warning: 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    default: 'bg-slate-100 dark:bg-[#1a1a1e] text-slate-600 dark:text-white',
  }

  const Icon = variant === 'danger' ? Trash2 : AlertTriangle

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <ModalBody className="pt-6">
        <div className="flex flex-col items-center text-center">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full mb-4 ${iconClasses[variant]}`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription className="mt-2">{description}</ModalDescription>
        </div>
      </ModalBody>
      <ModalFooter className="justify-center border-t-0 pt-0">
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default ConfirmDialog
