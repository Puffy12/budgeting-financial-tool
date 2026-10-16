import { useEffect, useState } from 'react'
import { Navigate, Outlet, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useUser } from '../../context/UserContext'
import { useTheme } from '../../context/ThemeContext'
import QuickAddModal from '../quick-add/QuickAddModal'
import { DesktopSidebar } from './DesktopSidebar'
import { MobileNav } from './MobileNav'

export default function Layout() {
  const { currentUser, setCurrentUser, authenticatedUsers, loading, logout } = useUser()
  const { resolvedTheme } = useTheme()
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!userId) {
      navigate('/')
      return
    }
    if (!currentUser || currentUser.id !== userId) {
      const found = authenticatedUsers.find((entry) => entry.user.id === userId)
      if (found) setCurrentUser(found.user)
      else navigate('/')
    }
  }, [userId, authenticatedUsers, loading, currentUser, setCurrentUser, navigate])

  const signedIn = userId
    ? authenticatedUsers.find((entry) => entry.user.id === userId)
    : undefined

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (!signedIn || !userId) {
    return <Navigate to="/" replace />
  }

  if (!currentUser || currentUser.id !== userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  const isDark = resolvedTheme === 'dark'
  const switchUser = () => {
    setCurrentUser(null)
    navigate('/')
  }
  const signOut = () => {
    logout()
    navigate('/')
  }

  return (
    <div className={`min-h-screen bg-[var(--bg)]`}>
      <DesktopSidebar
        isDark={isDark}
        userId={userId}
        currentUserName={currentUser.name}
        onSwitchUser={switchUser}
        onLogout={signOut}
        onQuickAdd={() => setShowQuickAdd(true)}
      />
      <MobileNav
        isDark={isDark}
        userId={userId}
        currentUserName={currentUser.name}
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
        onSwitchUser={switchUser}
        onLogout={signOut}
      />
      <main className="lg:pl-64">
        <div className="min-h-screen pt-[60px] lg:pt-0 safe-area-bottom">
          <Outlet />
        </div>
      </main>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowQuickAdd(true)}
        className="fixed z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/40 lg:hidden"
        style={{
          bottom: 'max(24px, calc(env(safe-area-inset-bottom, 0px) + 16px))',
          right: 'max(24px, env(safe-area-inset-right, 0px))',
        }}
      >
        <Plus className="h-6 w-6" strokeWidth={2} />
      </motion.button>
      <QuickAddModal
        open={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onSuccess={() => window.dispatchEvent(new CustomEvent('transaction-changed'))}
      />
    </div>
  )
}
