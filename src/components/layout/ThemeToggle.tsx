import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
        resolvedTheme === 'dark'
          ? 'bg-[var(--surface)] text-amber-400 hover:bg-[var(--bg)]'
          : 'bg-[var(--bg)] text-[var(--muted)] hover:bg-[var(--bg)]'
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
