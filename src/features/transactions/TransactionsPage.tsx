import { Folder, Plus } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { renderCategoryIcon } from '../../components/CategoryGlyph'
import { TransactionDesktopTable } from './components/TransactionDesktopTable'
import { TransactionFormModal } from './components/TransactionFormModal'
import { TransactionMobileList } from './components/TransactionMobileList'
import { useTransactionsPage } from './hooks/useTransactionsPage'

export default function TransactionsPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const page = useTransactionsPage()
  const net = page.totalIncome - page.totalExpenses

  return (
    <div className="p-4 pb-24 lg:p-8 lg:pb-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight text-[var(--text)]`}>
            Transactions
          </h1>
          <p className={`mt-1 text-[var(--muted)]`}>
            Manage your income and expenses
          </p>
        </div>
        <button
          onClick={page.openCreateModal}
          className="btn-premium inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-3 font-medium text-white shadow-lg shadow-primary-500/25"
        >
          <Plus className="h-5 w-5" strokeWidth={2} />
          Add Transaction
        </button>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {(['all', 'income', 'expense'] as const).map((item) => (
          <button
            key={item}
            onClick={() => page.setFilter(item === 'all' ? {} : { type: item })}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              (item === 'all' && !page.filter.type) || page.filter.type === item
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : isDark
                ? 'bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]'
                : 'bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)] border border-[var(--line)]'
            }`}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SummaryTile label="Income" value={page.formatCurrency(page.totalIncome)} tone="income" isDark={isDark} />
        <SummaryTile label="Expenses" value={page.formatCurrency(page.totalExpenses)} tone="expense" isDark={isDark} />
        <div className="panel col-span-2 p-3 sm:col-span-1 sm:p-4">
          <p className={`text-xs font-medium uppercase tracking-wider sm:text-[11px] text-[var(--muted)]`}>Net</p>
          <p className={`mt-1 text-base font-bold money tabular-nums sm:text-xl ${net >= 0 ? isDark ? 'text-emerald-400' : 'text-emerald-700' : isDark ? 'text-red-400' : 'text-red-700'}`}>
            {page.formatCurrency(net)}
          </p>
        </div>
      </div>

      {page.loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : page.transactions.length > 0 ? (
        <div className={`panel`}>
          <TransactionMobileList
            transactions={page.transactions}
            isDark={isDark}
            expandedId={page.expandedId}
            toggleExpand={(id) => page.setExpandedId(page.expandedId === id ? null : id)}
            openEditModal={page.openEditModal}
            handleDelete={page.handleDelete}
            formatCurrency={page.formatCurrency}
            renderCategoryIcon={renderCategoryIcon}
          />
          <TransactionDesktopTable
            transactions={page.transactions}
            isDark={isDark}
            openEditModal={page.openEditModal}
            handleDelete={page.handleDelete}
            formatCurrency={page.formatCurrency}
            renderCategoryIcon={renderCategoryIcon}
          />
        </div>
      ) : (
        <div className={`flex flex-col items-center justify-center gap-3 panel py-16 text-[var(--muted)]`}>
          <Folder className="h-10 w-10" strokeWidth={1.5} />
          <span className="text-sm">No transactions yet. Add your first one!</span>
        </div>
      )}

      <TransactionFormModal
        showModal={page.showModal}
        isDark={isDark}
        editingTransaction={page.editingTransaction}
        formData={page.formData}
        setFormData={page.setFormData}
        setShowModal={page.setShowModal}
        handleSubmit={page.handleSubmit}
        filteredCategories={page.filteredCategories}
      />
    </div>
  )
}

function SummaryTile({ label, value, tone, isDark }: { label: string; value: string; tone: 'income' | 'expense'; isDark: boolean }) {
  const income = tone === 'income'
  return (
    <div className={`rounded-xl p-3 sm:p-4 ${income ? 'accent-income' : 'accent-expense'} ${income ? isDark ? 'bg-emerald-500/8' : 'bg-emerald-50/80' : isDark ? 'bg-red-500/8' : 'bg-red-50/80'}`}>
      <p className={`text-xs font-medium uppercase tracking-wider sm:text-[11px] ${income ? isDark ? 'text-emerald-400/70' : 'text-emerald-600/70' : isDark ? 'text-red-400/70' : 'text-red-600/70'}`}>{label}</p>
      <p className={`mt-1 text-base font-bold money tabular-nums sm:text-xl ${income ? isDark ? 'text-emerald-400' : 'text-emerald-700' : isDark ? 'text-red-400' : 'text-red-700'}`}>{value}</p>
    </div>
  )
}
