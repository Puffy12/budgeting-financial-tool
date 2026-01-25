import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { usersApi, exportApi } from '../api'

export default function Settings() {
  const { currentUser, setCurrentUser, deleteUser } = useUser()
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
    } catch (err) {
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
    } catch (err) {
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
      setMessage({ type: 'success', text: 'Monthly data exported successfully!' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to export monthly data' })
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
      setMessage({ type: 'success', text: 'Yearly data exported successfully!' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to export yearly data' })
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
      setMessage({ 
        type: 'success', 
        text: `Imported ${result.imported.categories} categories, ${result.imported.transactions} transactions, ${result.imported.recurring} recurring items` 
      })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to import data. Please check the file format.' })
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteUser = async () => {
    if (!currentUser) return
    
    const confirmed = confirm(
      `Are you sure you want to delete the user "${currentUser.name}" and ALL associated data? This action cannot be undone.`
    )
    
    if (!confirmed) return
    
    try {
      await deleteUser(currentUser.id)
      navigate('/')
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete user' })
    }
  }

  const handleSwitchUser = () => {
    setCurrentUser(null)
    navigate('/')
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your account and data</p>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 rounded-xl p-4 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
          <button
            onClick={() => setMessage(null)}
            className="ml-4 font-medium underline"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Profile</h2>
          
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
              {editingName ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                  <button
                    onClick={handleUpdateName}
                    disabled={saving}
                    className="rounded-xl bg-primary-500 px-4 py-3 font-medium text-white transition-all hover:bg-primary-600 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false)
                      setName(currentUser?.name || '')
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-600 transition-all hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-slate-900">{currentUser?.name}</span>
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Created At */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Created</label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600">
                {currentUser?.createdAt && new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Export Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Export Data</h2>
          <p className="mb-4 text-sm text-slate-500">
            Download your data as JSON files for backup or transfer.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportAll}
              disabled={exporting}
              className="rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50"
            >
              {exporting ? 'Exporting...' : 'Export All Data'}
            </button>
            <button
              onClick={handleExportMonth}
              disabled={exporting}
              className="rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50"
            >
              Export Current Month
            </button>
            <button
              onClick={handleExportYear}
              disabled={exporting}
              className="rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50"
            >
              Export Current Year
            </button>
          </div>
        </motion.div>

        {/* Import Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Import Data</h2>
          <p className="mb-4 text-sm text-slate-500">
            Import data from a previously exported JSON file.
          </p>
          
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Import Mode</label>
            <div className="flex gap-3">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="h-4 w-4 text-primary-500"
                />
                <span className="text-sm text-slate-700">Merge (add to existing data)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="h-4 w-4 text-primary-500"
                />
                <span className="text-sm text-slate-700">Replace (clear existing data)</span>
              </label>
            </div>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-6 py-4 text-slate-600 transition-all hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {importing ? 'Importing...' : 'Choose JSON File'}
            </label>
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Account Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSwitchUser}
              className="rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 transition-all hover:bg-slate-50"
            >
              Switch User
            </button>
            <button
              onClick={handleDeleteUser}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 font-medium text-red-600 transition-all hover:bg-red-100"
            >
              Delete Account
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Deleting your account will permanently remove all your data including transactions, categories, and recurring items.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
