import { Plus } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { renderCategoryIcon } from '../../components/CategoryGlyph'
import { RecurringFormModal } from './components/RecurringFormModal'
import { RecurringList } from './components/RecurringList'
import { useRecurringPage } from './hooks/useRecurringPage'

export default function RecurringPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const page = useRecurringPage()
  const net = page.totalMonthlyIncome - page.totalMonthlyExpenses

  return (
    <div className="p-4 pb-24 lg:p-8 lg:pb-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight text-[var(--text)]`}>Recurring</h1>
          <p className={`mt-1 text-[var(--muted)]`}>Manage recurring income and expenses</p>
        </div>
        <button onClick={page.openCreateModal} className="btn-premium inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-3 font-medium text-white shadow-lg shadow-primary-500/25">
          <Plus className="h-5 w-5" strokeWidth={2} />
          Add Recurring
        </button>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MoneyTile label="Expenses/mo" value={page.formatCurrency(page.totalMonthlyExpenses)} tone="expense" isDark={isDark} />
        <MoneyTile label="Income/mo" value={page.formatCurrency(page.totalMonthlyIncome)} tone="income" isDark={isDark} />
        <div className="panel col-span-2 p-3 sm:col-span-1 sm:p-4">
          <p className={`text-xs font-medium uppercase tracking-wider sm:text-[11px] text-[var(--muted)]`}>Net/mo</p>
          <p className={`mt-1 text-base font-bold money tabular-nums sm:text-xl ${net >= 0 ? isDark ? 'text-emerald-400' : 'text-emerald-700' : isDark ? 'text-red-400' : 'text-red-700'}`}>{page.formatCurrency(net)}</p>
        </div>
      </div>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {(['all', 'active', 'inactive'] as const).map((item) => (
          <button key={item} onClick={() => page.setFilter(item)} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
            page.filter === item ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
              : isDark ? 'bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]' : 'bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)] border border-[var(--line)]'
          }`}>{item.charAt(0).toUpperCase() + item.slice(1)}</button>
        ))}
      </div>
      <RecurringList
        isDark={isDark}
        loading={page.loading}
        filteredRecurring={page.filteredRecurring}
        formatCurrency={page.formatCurrency}
        renderCategoryIcon={renderCategoryIcon}
        handleToggleActive={page.handleToggleActive}
        handleProcess={page.handleProcess}
        openEditModal={page.openEditModal}
        handleDelete={page.handleDelete}
      />
      <RecurringFormModal
        showModal={page.showModal}
        isDark={isDark}
        editingRecurring={page.editingRecurring}
        formData={page.formData}
        setFormData={page.setFormData}
        setShowModal={page.setShowModal}
        handleSubmit={page.handleSubmit}
        filteredCategories={page.filteredCategories}
      />
    </div>
  )
}

function MoneyTile({ label, value, tone, isDark }: { label: string; value: string; tone: 'income' | 'expense'; isDark: boolean }) {
  const income = tone === 'income'
  return (
    <div className={`rounded-xl p-3 sm:p-4 ${income ? 'accent-income' : 'accent-expense'} ${income ? isDark ? 'bg-emerald-500/8' : 'bg-emerald-50/80' : isDark ? 'bg-red-500/8' : 'bg-red-50/80'}`}>
      <p className={`text-xs font-medium uppercase tracking-wider sm:text-[11px] ${income ? isDark ? 'text-emerald-400/70' : 'text-emerald-600/70' : isDark ? 'text-red-400/70' : 'text-red-600/70'}`}>{label}</p>
      <p className={`mt-1 text-base font-bold money tabular-nums sm:text-xl ${income ? isDark ? 'text-emerald-400' : 'text-emerald-700' : isDark ? 'text-red-400' : 'text-red-700'}`}>{value}</p>
    </div>
  )
}
