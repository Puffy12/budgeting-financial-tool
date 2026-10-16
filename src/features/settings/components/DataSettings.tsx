import { motion } from 'framer-motion'
import { Download, Trash2, Upload, UserCog } from 'lucide-react'
import type { SettingsPanelProps } from '../settingsPanelProps'

export function DataSettings(props: SettingsPanelProps) {
  const {
    isDark, exporting, handleExportAll, handleExportMonth, handleExportYear, importMode, setImportMode, fileInputRef,
    handleImport, importing, handleSwitchUser, handleDeleteUser,
  } = props
  return (
    <div className="mt-6 space-y-6">
        {/* Export Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3 }}
          className={`card-hover panel p-6`}>
          <div className="mb-5 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg)]`}>
              <Download className={`h-5 w-5 text-[var(--muted)]`} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold tracking-tight text-[var(--text)]`}>Export Data</h2>
              <p className={`text-sm text-[var(--muted)]`}>Download your data as JSON</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <button onClick={handleExportAll} disabled={exporting}
              className={`rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 sm:px-4 sm:py-2.5 ${isDark ? 'border-[var(--line)] text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]' : 'border-[var(--line)] text-[var(--muted)] hover:bg-[var(--bg)]'}`}>
              All Data
            </button>
            <button onClick={handleExportMonth} disabled={exporting}
              className={`rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 sm:px-4 sm:py-2.5 ${isDark ? 'border-[var(--line)] text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]' : 'border-[var(--line)] text-[var(--muted)] hover:bg-[var(--bg)]'}`}>
              This Month
            </button>
            <button onClick={handleExportYear} disabled={exporting}
              className={`rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 sm:px-4 sm:py-2.5 ${isDark ? 'border-[var(--line)] text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]' : 'border-[var(--line)] text-[var(--muted)] hover:bg-[var(--bg)]'}`}>
              This Year
            </button>
          </div>
        </motion.div>

        {/* Import Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}
          className={`card-hover panel p-6`}>
          <div className="mb-5 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg)]`}>
              <Upload className={`h-5 w-5 text-[var(--muted)]`} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold tracking-tight text-[var(--text)]`}>Import Data</h2>
              <p className={`text-sm text-[var(--muted)]`}>Import from a JSON file</p>
            </div>
          </div>
          <div className="mb-4 flex gap-4">
            {(['merge', 'replace'] as const).map((m) => (
              <label key={m} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2">
                <input type="radio" name="importMode" value={m} checked={importMode === m} onChange={() => setImportMode(m)} 
                  className="h-5 w-5 border-2 text-primary-500 focus:ring-primary-500" />
                <span className={`text-sm text-[var(--muted)]`}>{m === 'merge' ? 'Merge' : 'Replace'}</span>
              </label>
            ))}
          </div>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" id="import-file" />
          <label htmlFor="import-file"
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed px-6 py-4 transition-all duration-200 active:scale-[0.98] ${
              isDark ? 'border-[var(--line)] text-[var(--muted)] hover:border-primary-500 hover:bg-primary-500/10 hover:text-primary-400' : 'border-[var(--line)] text-[var(--muted)] hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600'
            }`}>
            <Upload className="h-5 w-5" strokeWidth={1.75} />
            {importing ? 'Importing...' : 'Choose File'}
          </label>
        </motion.div>

        {/* Account Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.3 }}
          className={`card-hover panel p-6`}>
          <h2 className={`mb-5 text-lg font-semibold tracking-tight text-[var(--text)]`}>Account Actions</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button onClick={handleSwitchUser}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-medium transition-all duration-200 active:scale-[0.98] ${isDark ? 'border-[var(--line)] text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]' : 'border-[var(--line)] text-[var(--muted)] hover:bg-[var(--bg)]'}`}>
              <UserCog className="h-4 w-4" strokeWidth={1.75} />
              Switch User
            </button>
            <button onClick={handleDeleteUser}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-medium transition-all duration-200 active:scale-[0.98] ${isDark ? 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'}`}>
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              Delete Account
            </button>
          </div>
          <p className={`mt-3 text-xs text-[var(--muted)]`}>
            Deleting your account permanently removes all data.
          </p>
        </motion.div>
    </div>
  )
}
