import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { useTheme } from '../context/ThemeContext'
import { usersApi, exportApi } from '../api'
import {
  Sun,
  Moon,
  Monitor,
  Upload,
  Download,
  UserCog,
  Trash2,
  X,
} from 'lucide-react'

export default function Settings() {
  const { currentUser, setCurrentUser, deleteUser } = useUser()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const navigate = useNavigate()
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(currentUser?.name || '')
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
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

  const downloadJson = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser || !e.target.files?.length) return
    setImporting(true)
    try {
      const file = e.target.files[0]
      const text = await file.text()
      const data = JSON.parse(text)
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

  const handleSwitchUser = () => {
    setCurrentUser(null)
    navigate('/')
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const

  return (
    <div className="p-4 pb-24 lg:p-8 lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Settings</h1>
        <p className={`mt-1 ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>Manage your account and data</p>
      </div>

      {/* Message */}
      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`mb-6 flex items-center justify-between rounded-xl p-4 ${message.type === 'success' ? isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700' : isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-700'}`}>
          <span className="text-sm">{message.text}</span>
          <button onClick={() => setMessage(null)} className="rounded-lg p-1 transition-colors hover:bg-black/10">
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Profile Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className={`card-hover rounded-2xl border p-6 ${isDark ? 'border-[#1a1a1e] bg-[#121214]' : 'border-[#ede9d5] bg-white'}`}>
          <h2 className={`mb-5 text-lg font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Profile</h2>
          <div className="space-y-4">
            <div>
              <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-[#52525e]' : 'text-slate-600'}`}>Name</label>
              {editingName ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className={`flex-1 rounded-xl border px-4 py-3 transition-all duration-200 ${isDark ? 'border-[#242428] bg-[#1a1a1e] text-white focus:border-primary-500' : 'border-[#ede9d5] bg-[#faf9f6] text-slate-900 focus:border-primary-500'}`} />
                  <div className="flex gap-2">
                    <button onClick={handleUpdateName} disabled={saving}
                      className="btn-premium flex-1 rounded-xl bg-primary-500 px-4 py-3 font-medium text-white transition-all hover:bg-primary-600 active:scale-[0.98] disabled:opacity-50 sm:flex-none">
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => { setEditingName(false); setName(currentUser?.name || '') }}
                      className={`flex-1 rounded-xl border px-4 py-3 font-medium transition-all active:scale-[0.98] sm:flex-none ${isDark ? 'border-[#242428] text-[#52525e] hover:bg-[#1a1a1e]' : 'border-[#ede9d5] text-slate-500 hover:bg-[#f5f5dc]'}`}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${isDark ? 'border-[#242428] bg-[#1a1a1e]' : 'border-[#ede9d5] bg-[#faf9f6]'}`}>
                  <span className={isDark ? 'text-white' : 'text-slate-900'}>{currentUser?.name}</span>
                  <button onClick={() => setEditingName(true)} className="text-sm font-medium text-primary-500 transition-colors hover:text-primary-600">Edit</button>
                </div>
              )}
            </div>
            <div>
              <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-[#52525e]' : 'text-slate-600'}`}>Created</label>
              <div className={`rounded-xl border px-4 py-3 ${isDark ? 'border-[#242428] bg-[#1a1a1e] text-[#52525e]' : 'border-[#ede9d5] bg-[#faf9f6] text-slate-500'}`}>
                {currentUser?.createdAt && new Date(currentUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Theme Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.3 }}
          className={`card-hover rounded-2xl border p-6 ${isDark ? 'border-[#1a1a1e] bg-[#121214]' : 'border-[#ede9d5] bg-white'}`}>
          <h2 className={`mb-5 text-lg font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Appearance</h2>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((t) => {
              const Icon = t.icon
              return (
                <button key={t.value} onClick={() => setTheme(t.value)}
                  className={`flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 active:scale-95 ${
                    theme === t.value
                      ? 'border-primary-500 bg-primary-500/10'
                      : isDark ? 'border-[#1a1a1e] hover:border-[#242428]' : 'border-[#ede9d5] hover:border-[#d4d0bc]'
                  }`}>
                  <Icon className={`h-6 w-6 ${theme === t.value ? 'text-primary-500' : isDark ? 'text-[#52525e]' : 'text-slate-400'}`} strokeWidth={1.75} />
                  <span className={`text-sm font-medium ${theme === t.value ? 'text-primary-500' : isDark ? 'text-[#52525e]' : 'text-slate-600'}`}>
                    {t.label}
                  </span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Export Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}
          className={`card-hover rounded-2xl border p-6 ${isDark ? 'border-[#1a1a1e] bg-[#121214]' : 'border-[#ede9d5] bg-white'}`}>
          <div className="mb-5 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? 'bg-[#1a1a1e]' : 'bg-[#f5f5dc]/60'}`}>
              <Download className={`h-5 w-5 ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Export Data</h2>
              <p className={`text-sm ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>Download your data as JSON</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleExportAll} disabled={exporting}
              className={`rounded-xl border px-4 py-2.5 font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 ${isDark ? 'border-[#242428] text-[#52525e] hover:bg-[#1a1a1e] hover:text-white' : 'border-[#ede9d5] text-slate-600 hover:bg-[#f5f5dc]'}`}>
              All Data
            </button>
            <button onClick={handleExportMonth} disabled={exporting}
              className={`rounded-xl border px-4 py-2.5 font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 ${isDark ? 'border-[#242428] text-[#52525e] hover:bg-[#1a1a1e] hover:text-white' : 'border-[#ede9d5] text-slate-600 hover:bg-[#f5f5dc]'}`}>
              This Month
            </button>
            <button onClick={handleExportYear} disabled={exporting}
              className={`rounded-xl border px-4 py-2.5 font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 ${isDark ? 'border-[#242428] text-[#52525e] hover:bg-[#1a1a1e] hover:text-white' : 'border-[#ede9d5] text-slate-600 hover:bg-[#f5f5dc]'}`}>
              This Year
            </button>
          </div>
        </motion.div>

        {/* Import Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3 }}
          className={`card-hover rounded-2xl border p-6 ${isDark ? 'border-[#1a1a1e] bg-[#121214]' : 'border-[#ede9d5] bg-white'}`}>
          <div className="mb-5 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? 'bg-[#1a1a1e]' : 'bg-[#f5f5dc]/60'}`}>
              <Upload className={`h-5 w-5 ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Import Data</h2>
              <p className={`text-sm ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>Import from a JSON file</p>
            </div>
          </div>
          <div className="mb-4 flex gap-4">
            {(['merge', 'replace'] as const).map((m) => (
              <label key={m} className="flex cursor-pointer items-center gap-2">
                <input type="radio" name="importMode" value={m} checked={importMode === m} onChange={() => setImportMode(m)} 
                  className="h-4 w-4 border-2 text-primary-500 focus:ring-primary-500" />
                <span className={`text-sm ${isDark ? 'text-[#52525e]' : 'text-slate-600'}`}>{m === 'merge' ? 'Merge' : 'Replace'}</span>
              </label>
            ))}
          </div>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" id="import-file" />
          <label htmlFor="import-file"
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed px-6 py-4 transition-all duration-200 active:scale-[0.98] ${
              isDark ? 'border-[#242428] text-[#52525e] hover:border-primary-500 hover:bg-primary-500/10 hover:text-primary-400' : 'border-[#d4d0bc] text-slate-500 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600'
            }`}>
            <Upload className="h-5 w-5" strokeWidth={1.75} />
            {importing ? 'Importing...' : 'Choose File'}
          </label>
        </motion.div>

        {/* Account Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}
          className={`card-hover rounded-2xl border p-6 ${isDark ? 'border-[#1a1a1e] bg-[#121214]' : 'border-[#ede9d5] bg-white'}`}>
          <h2 className={`mb-5 text-lg font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Account Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleSwitchUser}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-medium transition-all duration-200 active:scale-[0.98] ${isDark ? 'border-[#242428] text-[#52525e] hover:bg-[#1a1a1e] hover:text-white' : 'border-[#ede9d5] text-slate-600 hover:bg-[#f5f5dc]'}`}>
              <UserCog className="h-4 w-4" strokeWidth={1.75} />
              Switch User
            </button>
            <button onClick={handleDeleteUser}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-medium transition-all duration-200 active:scale-[0.98] ${isDark ? 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'}`}>
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              Delete Account
            </button>
          </div>
          <p className={`mt-3 text-xs ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
            Deleting your account permanently removes all data.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
