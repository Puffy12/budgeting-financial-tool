import { useTheme } from '../../context/ThemeContext'
import { AccountSettings } from './components/AccountSettings'
import { DataSettings } from './components/DataSettings'
import { useSettingsPage } from './hooks/useSettingsPage'

export default function SettingsPage() {
  const page = useSettingsPage()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className="p-4 pb-24 lg:p-8 lg:pb-8">
      <div className="mb-8">
        <h1 className={`text-2xl font-bold tracking-tight text-[var(--text)]`}>Settings</h1>
        <p className={`mt-1 text-[var(--muted)]`}>Manage your account and data</p>
      </div>
      <AccountSettings {...page} isDark={isDark} />
      <DataSettings {...page} isDark={isDark} />
    </div>
  )
}
