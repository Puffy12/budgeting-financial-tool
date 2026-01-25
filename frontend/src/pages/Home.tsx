import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../context/UserContext'

export default function Home() {
  const { users, loading, error, setCurrentUser, createUser } = useUser()
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary-50 px-4">
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
          <h1 className="text-3xl font-bold text-slate-900">Budget Tracker</h1>
          <p className="mt-2 text-slate-500">Simple financial management</p>
        </div>

        {/* User Selection */}
        <div className="rounded-2xl bg-white p-6 shadow-xl shadow-slate-200/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Select User</h2>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
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
                      className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary-300 hover:bg-primary-50 hover:shadow-md"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-500 text-xl font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-500">
                          Created {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-slate-500">No users yet. Create one to get started!</p>
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-4 text-slate-600 transition-all hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600"
                >
                  <span className="text-xl">+</span>
                  Create New User
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-400">
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
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4"
            >
              <div className="rounded-2xl bg-white p-6 shadow-2xl">
                <h3 className="mb-4 text-xl font-semibold text-slate-900">Create New User</h3>
                <form onSubmit={handleCreateUser}>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    autoFocus
                  />
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 rounded-xl border border-slate-200 py-3 font-medium text-slate-600 transition-all hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating || !newUserName.trim()}
                      className="flex-1 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-3 font-medium text-white shadow-lg shadow-primary-500/30 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {creating ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
