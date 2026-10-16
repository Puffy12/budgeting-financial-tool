import { NavLink } from 'react-router-dom'
import { LogOut, Plus, User } from 'lucide-react'
import { BrandMark } from '../BrandMark'
import { ThemeToggle } from './ThemeToggle'
import { navItems } from './navItems'

interface Props {
  isDark: boolean
  userId: string
  currentUserName: string
  onSwitchUser: () => void
  onLogout: () => void
  onQuickAdd: () => void
}

export function DesktopSidebar(props: Props) {
  const { isDark, userId, currentUserName, onSwitchUser, onLogout, onQuickAdd } = props
  const currentUser = { name: currentUserName }
  const handleSwitchUser = onSwitchUser
  const handleLogout = onLogout
  const setShowQuickAdd = (open: boolean) => { if (open) onQuickAdd() }
  return (
      <aside className={`fixed left-0 top-0 hidden h-full w-64 border-r lg:block border-[var(--line)] bg-[var(--surface)]`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={`flex items-center gap-3 border-b px-6 py-5 border-[var(--line)]`}>
            <BrandMark size={44} />
            <div>
              <h1 className={`font-semibold tracking-tight text-[var(--text)]`}>Budget</h1>
              <p className={`text-xs text-[var(--muted)]`}>Financial Tracker</p>
            </div>
          </div>

          {/* User Info */}
          <div className={`border-b px-6 py-4 border-[var(--line)]`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text)]">
              Current User
            </p>
            <p className="mt-1 truncate text-lg font-semibold text-[var(--text)]">
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

          {/* Bottom Section */}
          <div className={`border-t p-4 space-y-3 border-[var(--line)]`}>
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium text-[var(--muted)]`}>
                Dark Mode
              </span>
              <ThemeToggle />
            </div>

            {/* Switch User */}
            <button
              onClick={handleSwitchUser}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]`}
            >
              <User className="h-5 w-5" strokeWidth={1.75} />
              Switch User
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isDark
                  ? 'text-red-300 hover:bg-red-500/10 hover:text-red-200'
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
  )
}
