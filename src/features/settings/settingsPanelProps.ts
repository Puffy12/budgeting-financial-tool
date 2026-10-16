import { Sun } from 'lucide-react'

export interface SettingsPanelProps {
  isDark: boolean
  message: { type: 'success' | 'error'; text: string } | null
  setMessage: (message: { type: 'success' | 'error'; text: string } | null) => void
  editingName: boolean
  name: string
  setName: (name: string) => void
  saving: boolean
  handleUpdateName: () => void
  currentUser: { name: string; createdAt?: string } | null
  setEditingName: (editing: boolean) => void
  changingPin: boolean
  currentPinValue: string
  newPinValue: string
  confirmPinValue: string
  setCurrentPinValue: (value: string) => void
  setNewPinValue: (value: string) => void
  setConfirmPinValue: (value: string) => void
  pinError: { field: 'currentPin' | 'newPin' | 'confirmPin'; message: string } | null
  setPinError: (error: { field: 'currentPin' | 'newPin' | 'confirmPin'; message: string } | null) => void
  savingPin: boolean
  handleChangePin: () => void
  resetPinForm: () => void
  setChangingPin: (open: boolean) => void
  theme: string
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  themeOptions: readonly { value: 'light' | 'dark' | 'system'; label: string; icon: typeof Sun }[]
  exporting: boolean
  handleExportAll: () => void
  handleExportMonth: () => void
  handleExportYear: () => void
  importMode: 'merge' | 'replace'
  setImportMode: (mode: 'merge' | 'replace') => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handleImport: (event: React.ChangeEvent<HTMLInputElement>) => void
  importing: boolean
  handleSwitchUser: () => void
  handleDeleteUser: () => void
}
