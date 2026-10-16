import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { LogIn, Moon, Sun, UserPlus } from 'lucide-react'
import { BrandMark } from '../../components/BrandMark'
import { useTheme } from '../../context/ThemeContext'
import { LoginForm } from './components/LoginForm'
import { QuickSignIn } from './components/QuickSignIn'
import { SetPinForm } from './components/SetPinForm'
import { SignupForm } from './components/SignupForm'
import { useHomeSession } from './hooks/useHomeSession'

type Tab = 'login' | 'signup'

export default function HomePage() {
  const session = useHomeSession()
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const reduceMotion = useReducedMotion()

  if (session.loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center bg-[var(--bg)]`}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center px-4 py-8 safe-area-top safe-area-bottom bg-[var(--bg)]`}>
      <button
        onClick={toggleTheme}
        className={`fixed right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
          isDark
            ? 'bg-[var(--surface)] text-amber-400 hover:bg-[var(--bg)]'
            : 'bg-[var(--surface)] text-[var(--muted)] shadow-lg shadow-slate-200/50 hover:bg-[var(--bg)]'
        }`}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="h-5 w-5" strokeWidth={1.75} /> : <Moon className="h-5 w-5" strokeWidth={1.75} />}
      </button>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-5">
            <BrandMark size={72} />
          </div>
          <h1 className="text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--text)]">
            Budget Tracker
          </h1>
          <p className={`mt-2 text-[var(--muted)]`}>
            Simple financial management
          </p>
        </div>

        <QuickSignIn
          knownUsers={session.knownUsers}
          authenticatedUsers={session.authenticatedUsers}
          flow={session.flow}
          isDark={isDark}
          handleQuickSwitch={session.handleQuickSwitch}
          removeKnownUser={session.removeKnownUser}
        />

        <div className="panel overflow-hidden">
          <AnimatePresence mode="wait">
            {session.flow === 'set-pin' && session.setPinState ? (
              <SetPinForm
                setPinState={session.setPinState}
                isDark={isDark}
                submitting={session.submitting}
                errorMsg={session.errorMsg}
                setPinValue={session.setPinValue}
                confirmSetPin={session.confirmSetPin}
                setSetPinValue={session.setSetPinValue}
                setConfirmSetPin={session.setConfirmSetPin}
                resetForm={session.resetForm}
                handleSetPin={session.handleSetPin}
              />
            ) : (
              <AuthTabs session={session} isDark={isDark} />
            )}
          </AnimatePresence>
        </div>

        <p className={`mt-6 text-center text-sm text-[var(--muted)]`}>
          Track expenses, manage budgets, achieve goals
        </p>
      </motion.div>
    </div>
  )
}

function AuthTabs({
  session,
  isDark,
}: {
  session: ReturnType<typeof useHomeSession>
  isDark: boolean
}) {
  return (
    <motion.div
      key="main"
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={`flex border-b border-[var(--line)]`}>
        {([
          { id: 'login' as Tab, label: 'Sign In', icon: LogIn },
          { id: 'signup' as Tab, label: 'Create Account', icon: UserPlus },
        ]).map((item) => (
          <button
            key={item.id}
            onClick={() => session.switchTab(item.id)}
            className={`relative flex flex-1 items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
              session.tab === item.id
                ? 'text-[var(--text)]'
                : isDark ? 'text-[var(--muted)] hover:text-[var(--muted)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <item.icon className="h-4 w-4" strokeWidth={1.75} />
            {item.label}
            {session.tab === item.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
      <div className="p-6">
        <AnimatePresence mode="wait">
          {session.tab === 'login' ? (
            <LoginForm
              username={session.username}
              setUsername={session.setUsername}
              pin={session.pin}
              setPin_={session.setPin_}
              submitting={session.submitting}
              errorMsg={session.errorMsg}
              usernameRef={session.usernameRef}
              handleLogin={session.handleLogin}
              isDark={isDark}
            />
          ) : (
            <SignupForm
              username={session.username}
              setUsername={session.setUsername}
              pin={session.pin}
              setPin_={session.setPin_}
              confirmPin={session.confirmPin}
              setConfirmPin={session.setConfirmPin}
              submitting={session.submitting}
              errorMsg={session.errorMsg}
              handleSignup={session.handleSignup}
              isDark={isDark}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
