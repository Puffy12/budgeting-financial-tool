import { Plus } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { getIconById } from '../../lib/categoryIcons'
import { CategoryColumns } from './components/CategoryColumns'
import { CategoryFormModal } from './components/CategoryFormModal'
import { useCategoriesPage } from './hooks/useCategoriesPage'

export default function CategoriesPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const page = useCategoriesPage()

  return (
    <div className="p-4 pb-24 lg:p-8 lg:pb-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight text-[var(--text)]`}>Categories</h1>
          <p className={`mt-1 text-[var(--muted)]`}>Organize your transactions</p>
        </div>
        <button onClick={page.openCreateModal} className="btn-premium inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-3 font-medium text-white shadow-lg shadow-primary-500/25">
          <Plus className="h-5 w-5" strokeWidth={2} />
          Add Category
        </button>
      </div>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {(['all', 'expense', 'income'] as const).map((item) => (
          <button key={item} onClick={() => page.setFilter(item)} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
            page.filter === item
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
              : isDark ? 'bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]' : 'bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)] border border-[var(--line)]'
          }`}>{item.charAt(0).toUpperCase() + item.slice(1)}</button>
        ))}
      </div>
      {page.loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <CategoryColumns
          isDark={isDark}
          filter={page.filter}
          expenseCategories={page.expenseCategories}
          incomeCategories={page.incomeCategories}
          filteredCategories={page.filteredCategories}
          renderCategoryIcon={(iconId, className = '') => {
            const IconComponent = getIconById(iconId)
            return <IconComponent className={className} strokeWidth={1.75} />
          }}
          openEditModal={page.openEditModal}
          handleDelete={page.handleDelete}
        />
      )}
      <CategoryFormModal
        showModal={page.showModal}
        isDark={isDark}
        editingCategory={page.editingCategory}
        formData={page.formData}
        setFormData={page.setFormData}
        setShowModal={page.setShowModal}
        handleSubmit={page.handleSubmit}
        error={page.error}
      />
    </div>
  )
}
