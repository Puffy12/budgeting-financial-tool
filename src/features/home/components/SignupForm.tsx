import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { PinInput } from './PinInput'

interface Props {
  username: string
  setUsername: (value: string) => void
  pin: string
  setPin_: (value: string) => void
  confirmPin: string
  setConfirmPin: (value: string) => void
  submitting: boolean
  errorMsg: string
  handleSignup: (event: React.FormEvent) => void
  isDark: boolean
}

export function SignupForm(props: Props) {
  const { username, setUsername, pin, setPin_, confirmPin, setConfirmPin, submitting, errorMsg, handleSignup, isDark } = props
  return (
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
                          <label className={`mb-2 block text-xs font-semibold uppercase tracking-widest text-[var(--muted)]`}>
                            Username
                          </label>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Choose a username"
                            disabled={submitting}
                            autoFocus
                            className={`w-full rounded-xl border-2 px-4 py-3.5 text-base transition-all duration-200 focus:outline-none border-[var(--line)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20`}
                          />
                        </div>

                        <div>
                          <label className={`mb-2 block text-xs font-semibold uppercase tracking-widest text-[var(--muted)]`}>
                            4-Digit PIN
                          </label>
                          <PinInput value={pin} onChange={setPin_} disabled={submitting} />
                        </div>

                        <div>
                          <label className={`mb-2 block text-xs font-semibold uppercase tracking-widest text-[var(--muted)]`}>
                            Confirm PIN
                          </label>
                          <PinInput value={confirmPin} onChange={setConfirmPin} disabled={submitting} />
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
  )
}
