import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, Menu, User, X } from 'lucide-react'
import { BrandMark } from '../BrandMark'
import { ThemeToggle } from './ThemeToggle'
import { navItems } from './navItems'

interface Props {
  isDark: boolean
  userId: string
  currentUserName: string
  mobileNavOpen: boolean
  setMobileNavOpen: (open: boolean) => void
  onSwitchUser: () => void
  onLogout: () => void
}

export function MobileNav(props: Props) {
  const { isDark, userId, currentUserName, mobileNavOpen, setMobileNavOpen, onSwitchUser, onLogout } = props
  const currentUser = { name: currentUserName }
  const handleSwitchUser = onSwitchUser
  const handleLogout = onLogout
  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-[var(--line)] bg-[var(--surface)]/90 backdrop-blur-xl lg:hidden safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
            className={`rounded-xl p-2.5 transition-colors text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]`}
          >
            <Menu className="h-6 w-6" strokeWidth={1.75} />
          </button>
          <div className="flex items-center gap-2">
            <BrandMark size={32} />
            <span className={`font-semibold tracking-tight text-[var(--text)]`}>Budget</span>
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
              className={`fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] shadow-2xl lg:hidden safe-area-left bg-[var(--surface)]`}
            >
              <div className="flex h-full flex-col safe-area-top">
                {/* Header */}
                <div className={`flex items-center justify-between border-b px-4 py-4 border-[var(--line)]`}>
                  <div className="flex items-center gap-3">
                    <BrandMark size={44} />
                    <span className={`font-semibold tracking-tight text-[var(--text)]`}>Budget</span>
                  </div>
                  <button
                    onClick={() => setMobileNavOpen(false)}
                    aria-label="Close navigation"
                    className={`rounded-xl p-2.5 transition-colors text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]`}
                  >
                    <X className="h-5 w-5" strokeWidth={1.75} />
                  </button>
                </div>

                {/* User Info */}
                <div className={`border-b px-4 py-4 border-[var(--line)]`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand)] text-lg font-bold text-[var(--bg)] shadow-[0_10px_22px_-8px_rgba(62,210,255,0.8)]">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-[var(--text)]">{currentUser.name}</p>
                      <p className="text-sm text-[var(--text)]">Personal Budget</p>
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
                              : 'text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]'
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
                <div className={`border-t p-4 space-y-3 safe-area-bottom border-[var(--line)]`}>
                  {/* Switch User */}
                  <button
                    onClick={() => {
                      setMobileNavOpen(false)
                      handleSwitchUser()
                    }}
                    className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium transition-all active:scale-[0.98] text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]`}
                  >
                    <User className="h-5 w-5" strokeWidth={1.75} />
                    Switch User
                  </button>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      setMobileNavOpen(false)
                      handleLogout()
                    }}
                    className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium transition-all active:scale-[0.98] ${
                      isDark
                        ? 'text-red-300 hover:bg-red-500/10 hover:text-red-200'
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
    </>
  )
}
