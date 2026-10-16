import { useEffect, useRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function PinInput({
  value,
  onChange,
  disabled = false,
  autoFocus = false,
}: {
  value: string
  onChange: (val: string) => void
  disabled?: boolean
  autoFocus?: boolean
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [showPin, setShowPin] = useState(false)

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return
    const arr = value.split('')
    arr[index] = char
    const newVal = arr.join('').slice(0, 4)
    onChange(newVal)
    if (char && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
      const arr = value.split('')
      arr[index - 1] = ''
      onChange(arr.join(''))
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    onChange(pasted)
    const nextIndex = Math.min(pasted.length, 3)
    inputRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 sm:gap-3 justify-center">
        {[0, 1, 2, 3].map((i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el }}
            type={showPin ? 'text' : 'password'}
            inputMode="numeric"
            maxLength={1}
            value={value[i] || ''}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl border-2 text-center text-xl sm:text-2xl font-bold transition-all duration-200 focus:outline-none border-[var(--line)] bg-[var(--surface)] text-[var(--text)] focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        ))}
        <button
          type="button"
          onClick={() => setShowPin(!showPin)}
          className={`ml-1 flex h-11 w-11 items-center justify-center rounded-lg transition-colors text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]`}
          tabIndex={-1}
        >
          {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  )
}
