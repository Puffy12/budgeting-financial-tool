import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { useEffect, useState } from 'react'
import QuickAddModal from './QuickAddModal'

const navItems = [
  { path: '/app', label: 'Dashboard', icon: '📊', end: true },
  { path: '/app/transactions', label: 'Transactions', icon: '💳' },
  { path: '/app/recurring', label: 'Recurring', icon: '🔄' },
  { path: '/app/breakdown', label: 'Breakdown', icon: '📈' },
  { path: '/app/categories', label: 'Categories', icon: '🏷️' },
  { path: '/app/settings', label: 'Settings', icon: '⚙️' },
]

export default function Layout() {
  const { currentUser } = useUser()
  const navigate = useNavigate()
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      navigate('/')
    }
  }, [currentUser, navigate])

  if (!currentUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-xl text-white shadow-lg shadow-primary-500/30">
              $
            </div>
            <div>
              <h1 className="font-semibold text-slate-900">Budget</h1>
              <p className="text-xs text-slate-500">Financial Tracker</p>
            </div>
          </div>

          {/* User Info */}
          <div className="border-b border-slate-200 px-6 py-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Current User</p>
            <p className="mt-1 truncate font-medium text-slate-900">{currentUser.name}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Quick Add Button */}
          <div className="border-t border-slate-200 p-4">
            <button
              onClick={() => setShowQuickAdd(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-3 font-medium text-white shadow-lg shadow-primary-500/30 transition-all hover:shadow-xl hover:shadow-primary-500/40 active:scale-[0.98]"
            >
              <span className="text-xl">+</span>
              Quick Add
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-lg lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 text-sm font-bold text-white">
              $
            </div>
            <span className="font-semibold text-slate-900">Budget</span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 h-full w-72 bg-white shadow-xl lg:hidden"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-xl text-white">
                      $
                    </div>
                    <span className="font-semibold text-slate-900">Budget</span>
                  </div>
                  <button
                    onClick={() => setMobileNavOpen(false)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="border-b border-slate-200 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">User</p>
                  <p className="mt-1 truncate font-medium text-slate-900">{currentUser.name}</p>
                </div>

                <nav className="flex-1 space-y-1 px-3 py-4">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={() => setMobileNavOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`
                      }
                    >
                      <span className="text-lg">{item.icon}</span>
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="min-h-screen pt-16 lg:pt-0">
          <Outlet />
        </div>
      </main>

      {/* Mobile Quick Add FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setShowQuickAdd(true)}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-2xl text-white shadow-lg shadow-primary-500/40 lg:hidden"
      >
        +
      </motion.button>

      {/* Quick Add Modal */}
      <QuickAddModal open={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
    </div>
  )
}
