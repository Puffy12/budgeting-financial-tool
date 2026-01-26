import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { useTheme } from '../context/ThemeContext'
import {
  Sun,
  Moon,
  ChevronRight,
  Plus,
  Wallet,
} from 'lucide-react'

export default function Home() {
  const { users, loading, error, setCurrentUser, createUser } = useUser()
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

  const handleSelectUser = (user: typeof users[0]) => {
    setCurrentUser(user)
    navigate('/app')
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserName.trim()) return

    setCreating(true)
    try {
      const user = await createUser(newUserName.trim())
      setCurrentUser(user)
      setShowCreateModal(false)
      setNewUserName('')
      navigate('/app')
    } catch (err) {
      console.error('Failed to create user:', err)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center px-4 py-8 safe-area-top safe-area-bottom ${
      isDark
        ? 'bg-gradient-to-br from-[#0a0a0b] via-[#121214] to-[#0a0a0b]'
        : 'bg-gradient-to-br from-[#faf9f6] via-white to-[#f5f5dc]/30'
    }`}>
      {/* Theme Toggle - Top Right */}
      <button
        onClick={toggleTheme}
        className={`fixed right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
          isDark
            ? 'bg-[#1a1a1e] text-amber-400 hover:bg-[#242428]'
            : 'bg-white text-slate-600 shadow-lg shadow-slate-200/50 hover:bg-[#faf9f6]'
        }`}
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="h-5 w-5" strokeWidth={1.75} />
        ) : (
          <Moon className="h-5 w-5" strokeWidth={1.75} />
        )}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center">
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

        {/* User Selection */}
        <div className={`rounded-2xl p-6 shadow-xl ${
          isDark ? 'bg-[#121214] shadow-black/20' : 'bg-white shadow-slate-200/50'
        }`}>
          <h2 className={`mb-5 text-lg font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Select User
          </h2>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-500/10 p-4 text-center text-sm text-red-500">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {users.length > 0 ? (
                <div className="space-y-2">
                  {users.map((user, index) => (
                    <motion.button
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      onClick={() => handleSelectUser(user)}
                      className={`card-hover flex w-full items-center gap-4 rounded-xl border p-4 transition-all active:scale-[0.98] ${
                        isDark
                          ? 'border-[#1a1a1e] bg-[#1a1a1e]/50 hover:border-primary-500/30 hover:bg-[#1a1a1e]'
                          : 'border-[#ede9d5] bg-white hover:border-primary-200 hover:bg-primary-50/50'
                      }`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-500 text-lg font-bold text-white shadow-lg shadow-primary-500/25">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {user.name}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
                          Created {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <ChevronRight className={`h-5 w-5 ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`} strokeWidth={1.75} />
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className={`py-12 text-center ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
                  <p>No users yet. Create one to get started!</p>
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-4 transition-all duration-200 active:scale-[0.98] ${
                    isDark
                      ? 'border-[#242428] text-[#52525e] hover:border-primary-500 hover:bg-primary-500/10 hover:text-primary-400'
                      : 'border-[#d4d0bc] text-slate-500 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  <Plus className="h-5 w-5" strokeWidth={2} />
                  Create New User
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className={`mt-6 text-center text-sm ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
          Track expenses, manage budgets, achieve goals
        </p>
      </motion.div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed inset-x-0 bottom-0 z-50 rounded-t-3xl p-6 safe-area-bottom sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-sm sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl ${
                isDark ? 'bg-[#121214]' : 'bg-white'
              }`}
            >
              {/* Handle bar for mobile */}
              <div className={`absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full sm:hidden ${isDark ? 'bg-[#242428]' : 'bg-slate-200'}`} />

              <h3 className={`mb-5 pt-2 text-xl font-semibold tracking-tight sm:pt-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Create New User
              </h3>
              <form onSubmit={handleCreateUser}>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Enter your name"
                  className={`w-full rounded-xl border px-4 py-4 text-base transition-all duration-200 ${
                    isDark
                      ? 'border-[#242428] bg-[#1a1a1e] text-white placeholder:text-[#3d3d45] focus:border-primary-500'
                      : 'border-[#ede9d5] bg-[#faf9f6] text-slate-900 placeholder:text-slate-400 focus:border-primary-500'
                  }`}
                  autoFocus
                />
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className={`flex-1 rounded-xl border py-3.5 font-medium transition-all duration-200 active:scale-[0.98] ${
                      isDark
                        ? 'border-[#242428] text-[#52525e] hover:bg-[#1a1a1e] hover:text-white'
                        : 'border-[#ede9d5] text-slate-500 hover:bg-[#f5f5dc]'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newUserName.trim()}
                    className="btn-premium flex-1 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-3.5 font-medium text-white shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
