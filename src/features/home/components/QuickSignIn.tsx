import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, X } from 'lucide-react'
import type { KnownUser } from '../../../context/authStorage'
import type { AuthenticatedUser } from '../../../types'

interface Props {
  knownUsers: KnownUser[]
  authenticatedUsers: AuthenticatedUser[]
  flow: 'main' | 'set-pin'
  isDark: boolean
  handleQuickSwitch: (userId: string, name: string) => void
  removeKnownUser: (userId: string) => void
}

export function QuickSignIn(props: Props) {
  const { knownUsers, authenticatedUsers, flow, isDark, handleQuickSwitch, removeKnownUser } = props
  return (
    <AnimatePresence>
          {knownUsers.length > 0 && flow === 'main' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="panel mb-4 p-5"
            >
              <p className={`mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]`}>
                Quick Sign In
              </p>
              <div className="space-y-2">
                {knownUsers.map((ku) => {
                  const isAuthed = authenticatedUsers.some(au => au.user.id === ku.id)
                  return (
                    <div key={ku.id} className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuickSwitch(ku.id, ku.name)}
                        className={`flex flex-1 items-center gap-3 rounded-xl border p-3 transition-all ${
                          isDark
                            ? 'border-[var(--line)] bg-[var(--surface)]/70 hover:border-primary-500/30 hover:bg-[var(--bg)]'
                            : 'border-[var(--line)] bg-[var(--surface)] hover:border-primary-200 hover:bg-primary-50/50'
                        }`}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-500 text-sm font-bold text-white shadow-lg shadow-primary-500/25">
                          {ku.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className={`text-sm font-medium truncate text-[var(--text)]`}>
                            {ku.name}
                          </p>
                          <p className={`text-xs ${isAuthed || ku.pin ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : ('text-[var(--muted)]')}`}>
                            {isAuthed || ku.pin ? 'Tap to sign in' : 'Enter PIN to sign in'}
                          </p>
                        </div>
                        <ChevronRight className={`h-4 w-4 text-[var(--muted)]`} strokeWidth={1.75} />
                      </motion.button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeKnownUser(ku.id); }}
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                          isDark ? 'text-[var(--muted)] hover:bg-[var(--bg)] hover:text-red-400' : 'text-[var(--muted)] hover:bg-red-50 hover:text-red-500'
                        }`}
                        title="Remove from quick sign in"
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
    </AnimatePresence>
  )
}
