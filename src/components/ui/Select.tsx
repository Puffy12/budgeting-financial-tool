import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface MenuOption {
  value: string
  label: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  options: MenuOption[]
  ariaLabel: string
  placeholder?: string
  className?: string
}

export function MenuSelect({ value, onChange, options, ariaLabel, placeholder = 'Select', className = '' }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const current = options.find((option) => option.value === value)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-left text-base text-[var(--text)]"
      >
        <span className={current ? '' : 'text-[var(--muted)]'}>{current?.label ?? placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--brand)] ${open ? 'rotate-180' : ''}`} strokeWidth={1.75} />
      </button>
      {open && (
        <ul id={listId} role="listbox" aria-label={ariaLabel} className="panel absolute z-40 mt-2 max-h-64 w-full overflow-auto p-1.5">
          {options.map((option) => {
            const selected = option.value === value
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-base ${selected ? 'bg-[var(--brand)] text-[var(--bg)]' : 'text-[var(--text)] hover:bg-[var(--bg)]'}`}
                >
                  {option.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export { MenuSelect as Select }
export default MenuSelect
