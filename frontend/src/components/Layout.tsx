import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { useTheme } from '../context/ThemeContext'
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

function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
        resolvedTheme === 'dark'
          ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      } ${className}`}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: resolvedTheme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {resolvedTheme === 'dark' ? (
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
      </motion.div>
    </button>
  )
}

export default function Layout() {
  const { currentUser, setCurrentUser } = useUser()
  const { resolvedTheme } = useTheme()
  const navigate = useNavigate()
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      navigate('/')
    }
  }, [currentUser, navigate])

  const handleSwitchUser = () => {
    setCurrentUser(null)
    navigate('/')
  }

  if (!currentUser) {
    return null
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Desktop Sidebar */}
      <aside className={`fixed left-0 top-0 hidden h-full w-64 border-r lg:block ${
        isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={`flex items-center gap-3 border-b px-6 py-5 ${
            isDark ? 'border-slate-700' : 'border-slate-200'
          }`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-xl text-white shadow-lg shadow-primary-500/30">
              $
            </div>
            <div>
              <h1 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Budget</h1>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Financial Tracker</p>
            </div>
          </div>

          {/* User Info */}
          <div className={`border-b px-6 py-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Current User
            </p>
            <p className={`mt-1 truncate font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {currentUser.name}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-500/10 text-primary-500'
                      : isDark
                      ? 'text-slate-400 hover:bg-slate-700 hover:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className={`border-t p-4 space-y-3 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Dark Mode
              </span>
              <ThemeToggle />
            </div>

            {/* Switch User */}
            <button
              onClick={handleSwitchUser}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isDark
                  ? 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Switch User
            </button>

            {/* Logout */}
            <button
              onClick={handleSwitchUser}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isDark
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>

            {/* Quick Add Button */}
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
      <header className={`fixed left-0 right-0 top-0 z-40 border-b backdrop-blur-lg lg:hidden safe-area-top ${
        isDark ? 'border-slate-700 bg-slate-800/90' : 'border-slate-200 bg-white/90'
      }`}>
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileNavOpen(true)}
            className={`rounded-xl p-2.5 transition-colors ${
              isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 text-sm font-bold text-white">
              $
            </div>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Budget</span>
          </div>
          <ThemeToggle />
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
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] shadow-2xl lg:hidden safe-area-left ${
                isDark ? 'bg-slate-800' : 'bg-white'
              }`}
            >
              <div className="flex h-full flex-col safe-area-top">
                {/* Header */}
                <div className={`flex items-center justify-between border-b px-4 py-4 ${
                  isDark ? 'border-slate-700' : 'border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-xl text-white">
                      $
                    </div>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Budget</span>
                  </div>
                  <button
                    onClick={() => setMobileNavOpen(false)}
                    className={`rounded-xl p-2.5 transition-colors ${
                      isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* User Info */}
                <div className={`border-b px-4 py-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-500 text-lg font-bold text-white">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentUser.name}</p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Personal Budget</p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={() => setMobileNavOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium transition-all active:scale-[0.98] ${
                          isActive
                            ? 'bg-primary-500/10 text-primary-500'
                            : isDark
                            ? 'text-slate-300 hover:bg-slate-700'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`
                      }
                    >
                      <span className="text-xl">{item.icon}</span>
                      {item.label}
                    </NavLink>
                  ))}
                </nav>

                {/* Bottom Actions */}
                <div className={`border-t p-4 space-y-3 safe-area-bottom ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  {/* Switch User */}
                  <button
                    onClick={() => {
                      setMobileNavOpen(false)
                      handleSwitchUser()
                    }}
                    className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium transition-all active:scale-[0.98] ${
                      isDark
                        ? 'text-slate-300 hover:bg-slate-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Switch User
                  </button>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      setMobileNavOpen(false)
                      handleSwitchUser()
                    }}
                    className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium transition-all active:scale-[0.98] ${
                      isDark
                        ? 'text-red-400 hover:bg-red-500/10'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="min-h-screen pt-[60px] lg:pt-0 safe-area-bottom">
          <Outlet />
        </div>
      </main>

      {/* Mobile Quick Add FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowQuickAdd(true)}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-2xl text-white shadow-lg shadow-primary-500/40 lg:hidden safe-area-bottom"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        +
      </motion.button>

      {/* Quick Add Modal */}
      <QuickAddModal open={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
    </div>
  )
}
