import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { useTheme } from '../context/ThemeContext'
import {
  Sun,
  Moon,
  Wallet,
  LogIn,
  UserPlus,
  ChevronRight,
  X,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react'

type Tab = 'login' | 'signup'
type Flow = 'main' | 'set-pin'

interface SetPinState {
  userId: string
  name: string
}

/**
 * 4-digit PIN input component with individual digit boxes
 */
function PinInput({
  value,
  onChange,
  disabled = false,
  isDark,
  autoFocus = false,
}: {
  value: string
  onChange: (val: string) => void
  disabled?: boolean
  isDark: boolean
  autoFocus?: boolean
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [showPin, setShowPin] = useState(false)

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return
    const arr = value.split('')
    arr[index] = char
    const newVal = arr.join('').slice(0, 4)
    onChange(newVal)
    if (char && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
      const arr = value.split('')
      arr[index - 1] = ''
      onChange(arr.join(''))
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    onChange(pasted)
    const nextIndex = Math.min(pasted.length, 3)
    inputRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 justify-center">
        {[0, 1, 2, 3].map((i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el }}
            type={showPin ? 'text' : 'password'}
            inputMode="numeric"
            maxLength={1}
            value={value[i] || ''}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={`h-14 w-14 rounded-xl border-2 text-center text-2xl font-bold transition-all duration-200 focus:outline-none ${
              isDark
                ? 'border-[#242428] bg-[#1a1a1e] text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                : 'border-[#ede9d5] bg-[#faf9f6] text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        ))}
        <button
          type="button"
          onClick={() => setShowPin(!showPin)}
          className={`ml-1 flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
            isDark
              ? 'text-[#52525e] hover:bg-[#1a1a1e] hover:text-white'
              : 'text-slate-400 hover:bg-[#f5f5dc] hover:text-slate-600'
          }`}
          tabIndex={-1}
        >
          {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const { authenticatedUsers, loading, login, signup, setPin, switchUser } = useUser()
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>('login')
  const [flow, setFlow] = useState<Flow>('main')
  const [setPinState, setSetPinState] = useState<SetPinState | null>(null)

  // Form state
  const [username, setUsername] = useState('')
  const [pin, setPin_] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [setPinValue, setSetPinValue] = useState('')
  const [confirmSetPin, setConfirmSetPin] = useState('')

  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const usernameRef = useRef<HTMLInputElement>(null)

  // Redirect if already logged in with a current user
  useEffect(() => {
    if (!loading && authenticatedUsers.length > 0) {
      const lastUserId = localStorage.getItem('currentUserId')
      if (lastUserId) {
        const found = authenticatedUsers.find(au => au.user.id === lastUserId)
        if (found) {
          // Auto-navigate to last user
          // Don't auto-navigate, let user choose from quick switch
        }
      }
    }
  }, [loading, authenticatedUsers])

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || pin.length !== 4) return

    setErrorMsg('')
    setSubmitting(true)
    try {
      const result = await login(username.trim(), pin)

      if (result.needsPin && result.userId && result.name) {
        // User exists but has no PIN set
        setSetPinState({ userId: result.userId, name: result.name })
        setFlow('set-pin')
        setSetPinValue('')
        setConfirmSetPin('')
      } else if (result.user) {
        navigate(`/app/${result.user.id}`)
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }, [username, pin, login, navigate])

  const handleSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || pin.length !== 4 || confirmPin.length !== 4) return

    if (pin !== confirmPin) {
      setErrorMsg('PINs do not match')
      return
    }

    setErrorMsg('')
    setSubmitting(true)
    try {
      const user = await signup(username.trim(), pin)
      navigate(`/app/${user.id}`)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setSubmitting(false)
    }
  }, [username, pin, confirmPin, signup, navigate])

  const handleSetPin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!setPinState || setPinValue.length !== 4 || confirmSetPin.length !== 4) return

    if (setPinValue !== confirmSetPin) {
      setErrorMsg('PINs do not match')
      return
    }

    setErrorMsg('')
    setSubmitting(true)
    try {
      const user = await setPin(setPinState.userId, setPinValue)
      navigate(`/app/${user.id}`)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to set PIN')
    } finally {
      setSubmitting(false)
    }
  }, [setPinState, setPinValue, confirmSetPin, setPin, navigate])

  const handleQuickSwitch = (userId: string) => {
    switchUser(userId)
    navigate(`/app/${userId}`)
  }

  const resetForm = () => {
    setUsername('')
    setPin_('')
    setConfirmPin('')
    setErrorMsg('')
    setFlow('main')
    setSetPinState(null)
    setSetPinValue('')
    setConfirmSetPin('')
  }

  const switchTab = (newTab: Tab) => {
    resetForm()
    setTab(newTab)
  }

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${
        isDark
          ? 'bg-gradient-to-br from-[#0a0a0b] via-[#121214] to-[#0a0a0b]'
          : 'bg-gradient-to-br from-[#faf9f6] via-white to-[#f5f5dc]/30'
      }`}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center px-4 py-8 safe-area-top safe-area-bottom ${
      isDark
        ? 'bg-gradient-to-br from-[#0a0a0b] via-[#121214] to-[#0a0a0b]'
        : 'bg-gradient-to-br from-[#faf9f6] via-white to-[#f5f5dc]/30'
    }`}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
          isDark
            ? 'bg-[#1a1a1e] text-amber-400 hover:bg-[#242428]'
            : 'bg-white text-slate-600 shadow-lg shadow-slate-200/50 hover:bg-[#faf9f6]'
        }`}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="h-5 w-5" strokeWidth={1.75} /> : <Moon className="h-5 w-5" strokeWidth={1.75} />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1, stiffness: 200, damping: 20 }}
            className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-2xl shadow-primary-500/30"
          >
            <Wallet className="h-10 w-10 text-white" strokeWidth={1.5} />
          </motion.div>
          <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Budget Tracker
          </h1>
          <p className={`mt-2 ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>
            Simple financial management
          </p>
        </div>

        {/* Quick Switch - Previously logged in users */}
        <AnimatePresence>
          {authenticatedUsers.length > 0 && flow === 'main' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-4 rounded-2xl p-5 shadow-xl ${
                isDark ? 'bg-[#121214] shadow-black/20' : 'bg-white shadow-slate-200/50'
              }`}
            >
              <p className={`mb-3 text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
                Quick Switch
              </p>
              <div className="space-y-2">
                {authenticatedUsers.map((au) => (
                  <motion.button
                    key={au.user.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickSwitch(au.user.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 transition-all ${
                      isDark
                        ? 'border-[#1a1a1e] bg-[#1a1a1e]/50 hover:border-primary-500/30 hover:bg-[#1a1a1e]'
                        : 'border-[#ede9d5] bg-white hover:border-primary-200 hover:bg-primary-50/50'
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-500 text-sm font-bold text-white shadow-lg shadow-primary-500/25">
                      {au.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {au.user.name}
                      </p>
                    </div>
                    <ChevronRight className={`h-4 w-4 ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`} strokeWidth={1.75} />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Card */}
        <div className={`rounded-2xl shadow-xl overflow-hidden ${
          isDark ? 'bg-[#121214] shadow-black/20' : 'bg-white shadow-slate-200/50'
        }`}>
          <AnimatePresence mode="wait">
            {flow === 'set-pin' && setPinState ? (
              /* Set PIN Flow */
              <motion.div
                key="set-pin"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="p-6"
              >
                <button
                  onClick={resetForm}
                  className={`mb-4 flex items-center gap-1 text-sm font-medium transition-colors ${
                    isDark ? 'text-[#52525e] hover:text-white' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <X className="h-4 w-4" />
                  Back
                </button>

                <div className="mb-6 text-center">
                  <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${
                    isDark ? 'bg-amber-500/10' : 'bg-amber-50'
                  }`}>
                    <Lock className={`h-7 w-7 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} strokeWidth={1.5} />
                  </div>
                  <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Set Your PIN
                  </h2>
                  <p className={`mt-1 text-sm ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>
                    Hi <span className="font-medium">{setPinState.name}</span>, please create a 4-digit PIN to secure your account.
                  </p>
                </div>

                <form onSubmit={handleSetPin} className="space-y-5">
                  <div>
                    <label className={`mb-2 block text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
                      New PIN
                    </label>
                    <PinInput value={setPinValue} onChange={setSetPinValue} isDark={isDark} disabled={submitting} autoFocus />
                  </div>

                  <div>
                    <label className={`mb-2 block text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
                      Confirm PIN
                    </label>
                    <PinInput value={confirmSetPin} onChange={setConfirmSetPin} isDark={isDark} disabled={submitting} />
                  </div>

                  {errorMsg && (
                    <div className={`flex items-center gap-2 rounded-xl p-3 text-sm ${
                      isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
                    }`}>
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || setPinValue.length !== 4 || confirmSetPin.length !== 4}
                    className="w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-3.5 font-semibold text-white shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Setting PIN...
                      </span>
                    ) : (
                      'Set PIN & Continue'
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              /* Login / Signup Tabs */
              <motion.div
                key="main"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Tab Headers */}
                <div className={`flex border-b ${isDark ? 'border-[#1a1a1e]' : 'border-[#ede9d5]'}`}>
                  {([
                    { id: 'login' as Tab, label: 'Sign In', icon: LogIn },
                    { id: 'signup' as Tab, label: 'Create Account', icon: UserPlus },
                  ]).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => switchTab(t.id)}
                      className={`relative flex flex-1 items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
                        tab === t.id
                          ? isDark
                            ? 'text-white'
                            : 'text-slate-900'
                          : isDark
                          ? 'text-[#3d3d45] hover:text-[#52525e]'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <t.icon className="h-4 w-4" strokeWidth={1.75} />
                      {t.label}
                      {tab === t.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {tab === 'login' ? (
                      <motion.form
                        key="login-form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleLogin}
                        className="space-y-5"
                      >
                        <div>
                          <label className={`mb-2 block text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
                            Username
                          </label>
                          <input
                            ref={usernameRef}
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            disabled={submitting}
                            autoFocus
                            className={`w-full rounded-xl border-2 px-4 py-3.5 text-base transition-all duration-200 focus:outline-none ${
                              isDark
                                ? 'border-[#242428] bg-[#1a1a1e] text-white placeholder:text-[#3d3d45] focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                                : 'border-[#ede9d5] bg-[#faf9f6] text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`mb-2 block text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
                            4-Digit PIN
                          </label>
                          <PinInput value={pin} onChange={setPin_} isDark={isDark} disabled={submitting} />
                        </div>

                        {errorMsg && (
                          <div className={`flex items-center gap-2 rounded-xl p-3 text-sm ${
                            isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
                          }`}>
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {errorMsg}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={submitting || !username.trim() || pin.length !== 4}
                          className="w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-3.5 font-semibold text-white shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Signing in...
                            </span>
                          ) : (
                            'Sign In'
                          )}
                        </button>
                      </motion.form>
                    ) : (
                      <motion.form
                        key="signup-form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleSignup}
                        className="space-y-5"
                      >
                        <div>
                          <label className={`mb-2 block text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
                            Username
                          </label>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Choose a username"
                            disabled={submitting}
                            autoFocus
                            className={`w-full rounded-xl border-2 px-4 py-3.5 text-base transition-all duration-200 focus:outline-none ${
                              isDark
                                ? 'border-[#242428] bg-[#1a1a1e] text-white placeholder:text-[#3d3d45] focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                                : 'border-[#ede9d5] bg-[#faf9f6] text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`mb-2 block text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
                            4-Digit PIN
                          </label>
                          <PinInput value={pin} onChange={setPin_} isDark={isDark} disabled={submitting} />
                        </div>

                        <div>
                          <label className={`mb-2 block text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
                            Confirm PIN
                          </label>
                          <PinInput value={confirmPin} onChange={setConfirmPin} isDark={isDark} disabled={submitting} />
                        </div>

                        {errorMsg && (
                          <div className={`flex items-center gap-2 rounded-xl p-3 text-sm ${
                            isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
                          }`}>
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {errorMsg}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={submitting || !username.trim() || pin.length !== 4 || confirmPin.length !== 4}
                          className="w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-3.5 font-semibold text-white shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Creating account...
                            </span>
                          ) : (
                            'Create Account'
                          )}
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className={`mt-6 text-center text-sm ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
          Track expenses, manage budgets, achieve goals
        </p>
      </motion.div>
    </div>
  )
}
