import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { useTheme } from '../context/ThemeContext'

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
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        : 'bg-gradient-to-br from-slate-50 via-white to-primary-50'
    }`}>
      {/* Theme Toggle - Top Right */}
      <button
        onClick={toggleTheme}
        className={`fixed right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
          isDark
            ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600'
            : 'bg-white text-slate-600 shadow-md hover:bg-slate-50'
        }`}
        aria-label="Toggle theme"
      >
        {isDark ? (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-4xl text-white shadow-2xl shadow-primary-500/40"
          >
            $
          </motion.div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Budget Tracker
          </h1>
          <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Simple financial management
          </p>
        </div>

        {/* User Selection */}
        <div className={`rounded-2xl p-6 shadow-xl ${
          isDark ? 'bg-slate-800 shadow-slate-900/50' : 'bg-white shadow-slate-200/50'
        }`}>
          <h2 className={`mb-4 text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Select User
          </h2>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
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
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSelectUser(user)}
                      className={`flex w-full items-center gap-4 rounded-xl border p-4 transition-all active:scale-[0.98] ${
                        isDark
                          ? 'border-slate-700 bg-slate-700/50 hover:border-primary-500/50 hover:bg-slate-700'
                          : 'border-slate-200 bg-white hover:border-primary-300 hover:bg-primary-50 hover:shadow-md'
                      }`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-500 text-xl font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {user.name}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Created {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <svg className={`h-5 w-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                    No users yet. Create one to get started!
                  </p>
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-4 transition-all active:scale-[0.98] ${
                    isDark
                      ? 'border-slate-600 text-slate-400 hover:border-primary-500 hover:bg-primary-500/10 hover:text-primary-400'
                      : 'border-slate-300 text-slate-600 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  <span className="text-xl">+</span>
                  Create New User
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className={`mt-6 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
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
                isDark ? 'bg-slate-800' : 'bg-white'
              }`}
            >
              {/* Handle bar for mobile */}
              <div className="absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full bg-slate-300 sm:hidden" />

              <h3 className={`mb-4 pt-2 text-xl font-semibold sm:pt-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Create New User
              </h3>
              <form onSubmit={handleCreateUser}>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Enter your name"
                  className={`w-full rounded-xl border px-4 py-4 text-base transition-colors ${
                    isDark
                      ? 'border-slate-600 bg-slate-700 text-white placeholder:text-slate-500'
                      : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
                  }`}
                  autoFocus
                />
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className={`flex-1 rounded-xl border py-3.5 font-medium transition-all active:scale-[0.98] ${
                      isDark
                        ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newUserName.trim()}
                    className="flex-1 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-3.5 font-medium text-white shadow-lg shadow-primary-500/30 transition-all hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
