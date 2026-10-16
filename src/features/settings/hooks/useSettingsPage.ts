import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'
import { useUser } from '../../../context/UserContext'
import { usersApi } from '../../dashboard/api'
import { exportApi } from '../api'

export function useSettingsPage() {
  const { currentUser, setCurrentUser, deleteUser, changePin } = useUser()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const navigate = useNavigate()
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(currentUser?.name || '')
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [changingPin, setChangingPin] = useState(false)
  const [currentPinValue, setCurrentPinValue] = useState('')
  const [newPinValue, setNewPinValue] = useState('')
  const [confirmPinValue, setConfirmPinValue] = useState('')
  const [pinError, setPinError] = useState<{ field: 'currentPin' | 'newPin' | 'confirmPin'; message: string } | null>(null)
  const [savingPin, setSavingPin] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpdateName = async () => {
    if (!currentUser || !name.trim()) return
    setSaving(true)
    try {
      const updated = await usersApi.update(currentUser.id, name.trim())
      setCurrentUser(updated)
      setEditingName(false)
      setMessage({ type: 'success', text: 'Name updated successfully!' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to update name' })
    } finally {
      setSaving(false)
    }
  }

  const resetPinForm = () => {
    setChangingPin(false)
    setCurrentPinValue('')
    setNewPinValue('')
    setConfirmPinValue('')
    setPinError(null)
  }

  const handleChangePin = async () => {
    setPinError(null)
    if (!/^\d{4}$/.test(currentPinValue)) return setPinError({ field: 'currentPin', message: 'PIN must be exactly 4 digits' })
    if (!/^\d{4}$/.test(newPinValue)) return setPinError({ field: 'newPin', message: 'PIN must be exactly 4 digits' })
    if (currentPinValue === newPinValue) return setPinError({ field: 'newPin', message: 'New PIN must be different from current PIN' })
    if (newPinValue !== confirmPinValue) return setPinError({ field: 'confirmPin', message: 'PINs do not match' })
    setSavingPin(true)
    try {
      await changePin(currentPinValue, newPinValue)
      resetPinForm()
      setMessage({ type: 'success', text: 'PIN changed successfully!' })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to change PIN'
      if (errorMsg.toLowerCase().includes('current pin') || errorMsg.toLowerCase().includes('incorrect')) {
        setPinError({ field: 'currentPin', message: errorMsg })
      } else {
        setPinError({ field: 'newPin', message: errorMsg })
      }
    } finally {
      setSavingPin(false)
    }
  }

  const downloadJson = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }

  const handleExportAll = async () => {
    if (!currentUser) return
    setExporting(true)
    try {
      const data = await exportApi.exportAll(currentUser.id)
      downloadJson(data, `budget-export-${currentUser.name}-${new Date().toISOString().split('T')[0]}.json`)
      setMessage({ type: 'success', text: 'Data exported successfully!' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to export data' })
    } finally {
      setExporting(false)
    }
  }

  const handleExportMonth = async () => {
    if (!currentUser) return
    setExporting(true)
    const now = new Date()
    try {
      const data = await exportApi.exportMonth(currentUser.id, now.getFullYear(), now.getMonth() + 1)
      downloadJson(data, `budget-${currentUser.name}-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.json`)
      setMessage({ type: 'success', text: 'Monthly data exported!' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to export' })
    } finally {
      setExporting(false)
    }
  }

  const handleExportYear = async () => {
    if (!currentUser) return
    setExporting(true)
    const now = new Date()
    try {
      const data = await exportApi.exportYear(currentUser.id, now.getFullYear())
      downloadJson(data, `budget-${currentUser.name}-${now.getFullYear()}.json`)
      setMessage({ type: 'success', text: 'Yearly data exported!' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to export' })
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser || !event.target.files?.length) return
    setImporting(true)
    try {
      const file = event.target.files[0]
      const data = JSON.parse(await file.text())
      const result = await exportApi.import(currentUser.id, data, importMode)
      setMessage({ type: 'success', text: `Imported ${result.imported.categories} categories, ${result.imported.transactions} transactions, ${result.imported.recurring} recurring` })
    } catch {
      setMessage({ type: 'error', text: 'Failed to import. Check file format.' })
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteUser = async () => {
    if (!currentUser) return
    if (!confirm(`Delete "${currentUser.name}" and ALL data? This cannot be undone.`)) return
    try {
      await deleteUser(currentUser.id)
      navigate('/')
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete user' })
    }
  }

  return {
    currentUser, theme, setTheme, resolvedTheme, editingName, setEditingName, name, setName, saving, exporting,
    importing, importMode, setImportMode, message, setMessage, changingPin, setChangingPin, currentPinValue,
    setCurrentPinValue, newPinValue, setNewPinValue, confirmPinValue, setConfirmPinValue, pinError, setPinError,
    savingPin, fileInputRef, handleUpdateName, resetPinForm, handleChangePin, handleExportAll, handleExportMonth,
    handleExportYear, handleImport, handleDeleteUser,
    handleSwitchUser: () => { setCurrentUser(null); navigate('/') },
    themeOptions: [
      { value: 'light' as const, label: 'Light', icon: Sun },
      { value: 'dark' as const, label: 'Dark', icon: Moon },
      { value: 'system' as const, label: 'System', icon: Monitor },
    ],
  }
}
