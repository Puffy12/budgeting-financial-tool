import { motion } from 'framer-motion'
import { AlertCircle, Lock, X } from 'lucide-react'
import { PinInput } from './PinInput'

interface SetPinState { userId: string; name: string }

interface Props {
  setPinState: SetPinState
  isDark: boolean
  submitting: boolean
  errorMsg: string
  setPinValue: string
  confirmSetPin: string
  setSetPinValue: (value: string) => void
  setConfirmSetPin: (value: string) => void
  resetForm: () => void
  handleSetPin: (event: React.FormEvent) => void
}

export function SetPinForm(props: Props) {
  const {
    setPinState, isDark, submitting, errorMsg, setPinValue, confirmSetPin,
    setSetPinValue, setConfirmSetPin, resetForm, handleSetPin,
  } = props
  return (
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
                  className={`mb-4 flex items-center gap-1 text-sm font-medium transition-colors text-[var(--muted)] hover:text-[var(--text)]`}
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
                  <h2 className={`text-xl font-bold tracking-tight text-[var(--text)]`}>
                    Set Your PIN
                  </h2>
                  <p className={`mt-1 text-sm text-[var(--muted)]`}>
                    Hi <span className="font-medium">{setPinState.name}</span>, please create a 4-digit PIN to secure your account.
                  </p>
                </div>

                <form onSubmit={handleSetPin} className="space-y-5">
                  <div>
                    <label className={`mb-2 block text-xs font-semibold uppercase tracking-widest text-[var(--muted)]`}>
                      New PIN
                    </label>
                    <PinInput value={setPinValue} onChange={setSetPinValue} disabled={submitting} autoFocus />
                  </div>

                  <div>
                    <label className={`mb-2 block text-xs font-semibold uppercase tracking-widest text-[var(--muted)]`}>
                      Confirm PIN
                    </label>
                    <PinInput value={confirmSetPin} onChange={setConfirmSetPin} disabled={submitting} />
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
  )
}
