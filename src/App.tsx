import { Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import { ThemeProvider } from './context/ThemeContext'
import HomePage from './features/home/HomePage'
import DashboardPage from './features/dashboard/DashboardPage'
import TransactionsPage from './features/transactions/TransactionsPage'
import CategoriesPage from './features/categories/CategoriesPage'
import RecurringPage from './features/recurring/RecurringPage'
import BreakdownPage from './features/breakdown/BreakdownPage'
import SettingsPage from './features/settings/SettingsPage'
import Layout from './components/layout/Layout'

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/app/:userId" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="recurring" element={<RecurringPage />} />
            <Route path="breakdown" element={<BreakdownPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/app" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App
