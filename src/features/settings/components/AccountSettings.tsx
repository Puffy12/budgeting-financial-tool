import { motion } from 'framer-motion'
import { KeyRound, Shield, X } from 'lucide-react'
import type { SettingsPanelProps } from '../settingsPanelProps'

export function AccountSettings(props: SettingsPanelProps) {
  const {
    isDark, message, setMessage, editingName, name, setName, saving, handleUpdateName, currentUser, setEditingName,
    changingPin, currentPinValue, newPinValue, confirmPinValue, setCurrentPinValue, setNewPinValue, setConfirmPinValue,
    pinError, setPinError, savingPin, handleChangePin, resetPinForm, setChangingPin, theme, setTheme, themeOptions,
  } = props
  return (
    <>
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
          className={`card-hover panel p-6`}>
          <h2 className={`mb-5 text-lg font-semibold tracking-tight text-[var(--text)]`}>Profile</h2>
          <div className="space-y-4">
            <div>
              <label className={`mb-2 block text-sm font-medium text-[var(--muted)]`}>Name</label>
              {editingName ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className={`flex-1 rounded-xl border px-4 py-3 transition-all duration-200 border-[var(--line)] bg-[var(--surface)] text-[var(--text)] focus:border-primary-500`} />
                  <div className="flex gap-2">
                    <button onClick={handleUpdateName} disabled={saving}
                      className="btn-premium flex-1 rounded-xl bg-primary-500 px-4 py-3 font-medium text-white transition-all hover:bg-primary-600 active:scale-[0.98] disabled:opacity-50 sm:flex-none">
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => { setEditingName(false); setName(currentUser?.name || '') }}
                      className={`flex-1 rounded-xl border px-4 py-3 font-medium transition-all active:scale-[0.98] sm:flex-none border-[var(--line)] text-[var(--muted)] hover:bg-[var(--bg)]`}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`flex items-center justify-between rounded-xl border px-4 py-3 border-[var(--line)] bg-[var(--surface)]`}>
                  <span className="text-[var(--text)]">{currentUser?.name}</span>
                  <button onClick={() => setEditingName(true)} className="text-sm font-medium text-primary-500 transition-colors hover:text-primary-600">Edit</button>
                </div>
              )}
            </div>
            <div>
              <label className={`mb-2 block text-sm font-medium text-[var(--muted)]`}>Created</label>
              <div className={`rounded-xl border px-4 py-3 border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]`}>
                {currentUser?.createdAt && new Date(currentUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.3 }}
          className={`card-hover panel p-6`}>
          <div className="mb-5 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg)]`}>
              <Shield className={`h-5 w-5 text-[var(--muted)]`} strokeWidth={1.75} />
            </div>
            <h2 className={`text-lg font-semibold tracking-tight text-[var(--text)]`}>Security</h2>
          </div>
          {changingPin ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="current-pin" className={`mb-2 block text-sm font-medium text-[var(--muted)]`}>Current PIN</label>
                <input id="current-pin" type="password" inputMode="numeric" maxLength={4} pattern="\d{4}" value={currentPinValue}
                  onChange={(e) => { setCurrentPinValue(e.target.value.replace(/\D/g, '')); setPinError(null) }}
                  aria-describedby={pinError?.field === 'currentPin' ? 'current-pin-error' : undefined}
                  className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 border-[var(--line)] bg-[var(--surface)] text-[var(--text)] focus:border-primary-500 ${pinError?.field === 'currentPin' ? isDark ? 'border-red-500/50' : 'border-red-300' : ''}`}
                  placeholder="Enter current PIN" />
                {pinError?.field === 'currentPin' && (
                  <p id="current-pin-error" role="alert" className={`mt-1.5 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{pinError.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="new-pin" className={`mb-2 block text-sm font-medium text-[var(--muted)]`}>New PIN</label>
                <input id="new-pin" type="password" inputMode="numeric" maxLength={4} pattern="\d{4}" value={newPinValue}
                  onChange={(e) => { setNewPinValue(e.target.value.replace(/\D/g, '')); setPinError(null) }}
                  aria-describedby={pinError?.field === 'newPin' ? 'new-pin-error' : undefined}
                  className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 border-[var(--line)] bg-[var(--surface)] text-[var(--text)] focus:border-primary-500 ${pinError?.field === 'newPin' ? isDark ? 'border-red-500/50' : 'border-red-300' : ''}`}
                  placeholder="Enter new 4-digit PIN" />
                {pinError?.field === 'newPin' && (
                  <p id="new-pin-error" role="alert" className={`mt-1.5 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{pinError.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="confirm-pin" className={`mb-2 block text-sm font-medium text-[var(--muted)]`}>Confirm New PIN</label>
                <input id="confirm-pin" type="password" inputMode="numeric" maxLength={4} pattern="\d{4}" value={confirmPinValue}
                  onChange={(e) => { setConfirmPinValue(e.target.value.replace(/\D/g, '')); setPinError(null) }}
                  aria-describedby={pinError?.field === 'confirmPin' ? 'confirm-pin-error' : undefined}
                  className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 border-[var(--line)] bg-[var(--surface)] text-[var(--text)] focus:border-primary-500 ${pinError?.field === 'confirmPin' ? isDark ? 'border-red-500/50' : 'border-red-300' : ''}`}
                  placeholder="Re-enter new PIN" />
                {pinError?.field === 'confirmPin' && (
                  <p id="confirm-pin-error" role="alert" className={`mt-1.5 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{pinError.message}</p>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleChangePin} disabled={savingPin}
                  className="btn-premium rounded-xl bg-primary-500 px-4 py-3 font-medium text-white transition-all hover:bg-primary-600 active:scale-[0.98] disabled:opacity-50">
                  {savingPin ? 'Saving...' : 'Update PIN'}
                </button>
                <button onClick={resetPinForm}
                  className={`rounded-xl border px-4 py-3 font-medium transition-all active:scale-[0.98] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--bg)]`}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setChangingPin(true)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 font-medium transition-all duration-200 active:scale-[0.98] ${isDark ? 'border-[var(--line)] text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]' : 'border-[var(--line)] text-[var(--muted)] hover:bg-[var(--bg)]'}`}>
              <KeyRound className="h-4 w-4" strokeWidth={1.75} />
              Change PIN
            </button>
          )}
        </motion.div>

        {/* Theme Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}
          className={`card-hover panel p-6`}>
          <h2 className={`mb-5 text-lg font-semibold tracking-tight text-[var(--text)]`}>Appearance</h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {themeOptions.map((t) => {
              const Icon = t.icon
              return (
                <button key={t.value} onClick={() => setTheme(t.value)}
                  className={`flex flex-col items-center gap-2 sm:gap-3 rounded-xl border-2 p-3 sm:p-4 transition-all duration-200 active:scale-95 ${
                    theme === t.value
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-[var(--line)] hover:border-[var(--line)]'
                  }`}>
                  <Icon className={`h-6 w-6 ${theme === t.value ? 'text-primary-500' : 'text-[var(--muted)]'}`} strokeWidth={1.75} />
                  <span className={`text-xs sm:text-sm font-medium ${theme === t.value ? 'text-primary-500' : 'text-[var(--muted)]'}`}>
                    {t.label}
                  </span>
                </button>
              )
            })}
          </div>
        </motion.div>
      </div>
    </>
  )
}
