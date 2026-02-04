import { Outlet, NavLink, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { useTheme } from '../context/ThemeContext'
import { useEffect, useState } from 'react'
import QuickAddModal from './QuickAddModal'
import {
  LayoutDashboard,
  Receipt,
  RefreshCw,
  TrendingUp,
  Tags,
  Settings,
  Sun,
  Moon,
  User,
  LogOut,
  Plus,
  Menu,
  X,
  Wallet,
} from 'lucide-react'

// Navigation items use relative paths - they'll be relative to /app/:userId
const navItems = [
  { path: '', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: 'transactions', label: 'Transactions', icon: Receipt },
  { path: 'recurring', label: 'Recurring', icon: RefreshCw },
  { path: 'breakdown', label: 'Breakdown', icon: TrendingUp },
  { path: 'categories', label: 'Categories', icon: Tags },
  { path: 'settings', label: 'Settings', icon: Settings },
]

function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
        resolvedTheme === 'dark'
          ? 'bg-[#242428] text-amber-400 hover:bg-[#2e2e34]'
          : 'bg-[#f5f5dc]/60 text-slate-600 hover:bg-[#ede9d5]'
      } ${className}`}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: resolvedTheme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </motion.div>
    </button>
  )
}

export default function Layout() {
  const { currentUser, setCurrentUser, users, loading } = useUser()
  const { resolvedTheme } = useTheme()
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Load user from URL param on mount or when userId changes
  useEffect(() => {
    if (loading) return // Wait for users to load
    
    if (!userId) {
      navigate('/')
      return
    }

    // If we have a userId in URL but no currentUser, or different user, load from users list
    if (!currentUser || currentUser.id !== userId) {
      const user = users.find(u => u.id === userId)
      if (user) {
        setCurrentUser(user)
      } else {
        // User not found, redirect to home
        navigate('/')
      }
    }
  }, [userId, users, loading, currentUser, setCurrentUser, navigate])

  const handleSwitchUser = () => {
    setCurrentUser(null)
    navigate('/')
  }

  // Show loading while fetching users or user data
  if (loading || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0b]' : 'bg-[#faf9f6]'}`}>
      {/* Desktop Sidebar */}
      <aside className={`fixed left-0 top-0 hidden h-full w-64 border-r lg:block ${
        isDark ? 'border-[#1a1a1e] bg-[#121214]' : 'border-[#ede9d5] bg-white'
      }`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={`flex items-center gap-3 border-b px-6 py-5 ${
            isDark ? 'border-[#1a1a1e]' : 'border-[#ede9d5]'
          }`}>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/25">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className={`font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Budget</h1>
              <p className={`text-xs ${isDark ? 'text-[#52525e]' : 'text-slate-400'}`}>Financial Tracker</p>
            </div>
          </div>

          {/* User Info */}
          <div className={`border-b px-6 py-4 ${isDark ? 'border-[#1a1a1e]' : 'border-[#ede9d5]'}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-widest ${isDark ? 'text-[#3d3d45]' : 'text-slate-400'}`}>
              Current User
            </p>
            <p className={`mt-1 truncate font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {currentUser.name}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const fullPath = item.path ? `/app/${userId}/${item.path}` : `/app/${userId}`
              return (
                <NavLink
                  key={item.path}
                  to={fullPath}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? isDark
                          ? 'bg-primary-500/10 text-primary-400'
                          : 'bg-primary-500/10 text-primary-600'
                        : isDark
                        ? 'text-[#52525e] hover:bg-[#1a1a1e] hover:text-white'
                        : 'text-slate-500 hover:bg-[#f5f5dc]/60 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          {/* Bottom Section */}
          <div className={`border-t p-4 space-y-3 ${isDark ? 'border-[#1a1a1e]' : 'border-[#ede9d5]'}`}>
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${isDark ? 'text-[#52525e]' : 'text-slate-500'}`}>
                Dark Mode
              </span>
              <ThemeToggle />
            </div>

            {/* Switch User */}
            <button
              onClick={handleSwitchUser}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isDark
                  ? 'text-[#52525e] hover:bg-[#1a1a1e] hover:text-white'
                  : 'text-slate-500 hover:bg-[#f5f5dc]/60 hover:text-slate-900'
              }`}
            >
              <User className="h-5 w-5" strokeWidth={1.75} />
              Switch User
            </button>

            {/* Logout */}
            <button
              onClick={handleSwitchUser}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isDark
                  ? 'text-red-400/70 hover:bg-red-500/10 hover:text-red-400'
                  : 'text-red-500/70 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <LogOut className="h-5 w-5" strokeWidth={1.75} />
              Logout
            </button>

            {/* Quick Add Button */}
            <button
              onClick={() => setShowQuickAdd(true)}
              className="btn-premium flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-3 font-medium text-white shadow-lg shadow-primary-500/25"
            >
              <Plus className="h-5 w-5" strokeWidth={2} />
              Quick Add
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className={`fixed left-0 right-0 top-0 z-40 border-b lg:hidden safe-area-top ${
        isDark ? 'glass-dark border-[#1a1a1e]' : 'glass-light border-[#ede9d5]'
      }`}>
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileNavOpen(true)}
            className={`rounded-xl p-2.5 transition-colors ${
              isDark ? 'text-[#52525e] hover:bg-[#1a1a1e] hover:text-white' : 'text-slate-500 hover:bg-[#f5f5dc]/60 hover:text-slate-900'
            }`}
          >
            <Menu className="h-6 w-6" strokeWidth={1.75} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/25">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className={`font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Budget</span>
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
                isDark ? 'bg-[#121214]' : 'bg-white'
              }`}
            >
              <div className="flex h-full flex-col safe-area-top">
                {/* Header */}
                <div className={`flex items-center justify-between border-b px-4 py-4 ${
                  isDark ? 'border-[#1a1a1e]' : 'border-[#ede9d5]'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/25">
                      <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <span className={`font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Budget</span>
                  </div>
                  <button
                    onClick={() => setMobileNavOpen(false)}
                    className={`rounded-xl p-2.5 transition-colors ${
                      isDark ? 'text-[#52525e] hover:bg-[#1a1a1e] hover:text-white' : 'text-slate-400 hover:bg-[#f5f5dc]/60 hover:text-slate-900'
                    }`}
                  >
                    <X className="h-5 w-5" strokeWidth={1.75} />
                  </button>
                </div>

                {/* User Info */}
                <div className={`border-b px-4 py-4 ${isDark ? 'border-[#1a1a1e]' : 'border-[#ede9d5]'}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-500 text-lg font-bold text-white shadow-lg shadow-primary-500/25">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentUser.name}</p>
                      <p className={`text-xs ${isDark ? 'text-[#52525e]' : 'text-slate-400'}`}>Personal Budget</p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const fullPath = item.path ? `/app/${userId}/${item.path}` : `/app/${userId}`
                    return (
                      <NavLink
                        key={item.path}
                        to={fullPath}
                        end={item.end}
                        onClick={() => setMobileNavOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium transition-all active:scale-[0.98] ${
                            isActive
                              ? isDark
                                ? 'bg-primary-500/10 text-primary-400'
                                : 'bg-primary-500/10 text-primary-600'
                              : isDark
                              ? 'text-[#52525e] hover:bg-[#1a1a1e] hover:text-white'
                              : 'text-slate-500 hover:bg-[#f5f5dc]/60 hover:text-slate-900'
                          }`
                        }
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                        {item.label}
                      </NavLink>
                    )
                  })}
                </nav>

                {/* Bottom Actions */}
                <div className={`border-t p-4 space-y-3 safe-area-bottom ${isDark ? 'border-[#1a1a1e]' : 'border-[#ede9d5]'}`}>
                  {/* Switch User */}
                  <button
                    onClick={() => {
                      setMobileNavOpen(false)
                      handleSwitchUser()
                    }}
                    className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium transition-all active:scale-[0.98] ${
                      isDark
                        ? 'text-[#52525e] hover:bg-[#1a1a1e] hover:text-white'
                        : 'text-slate-500 hover:bg-[#f5f5dc]/60 hover:text-slate-900'
                    }`}
                  >
                    <User className="h-5 w-5" strokeWidth={1.75} />
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
                        ? 'text-red-400/70 hover:bg-red-500/10 hover:text-red-400'
                        : 'text-red-500/70 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    <LogOut className="h-5 w-5" strokeWidth={1.75} />
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
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/40 lg:hidden safe-area-bottom"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        <Plus className="h-6 w-6" strokeWidth={2} />
      </motion.button>

      {/* Quick Add Modal */}
      <QuickAddModal 
        open={showQuickAdd} 
        onClose={() => setShowQuickAdd(false)} 
        onSuccess={() => {
          // Dispatch event to notify pages that a transaction was created
          window.dispatchEvent(new CustomEvent('transaction-changed'))
        }}
      />
    </div>
  )
}
