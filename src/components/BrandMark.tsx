import { useId } from 'react'

interface Props {
  size?: number
  className?: string
}

export function BrandMark({ size = 44, className = '' }: Props) {
  const raw = useId().replace(/:/g, '')
  const rim = `rim-${raw}`
  const plate = `plate-${raw}`
  const metal = `metal-${raw}`
  const face = `face-${raw}`

  return (
    <span
      aria-hidden="true"
      className={`brand-mark inline-flex shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 64 64">
        <defs>
          <linearGradient id={rim} x1="6" y1="2" x2="58" y2="62" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#d7e4f0" />
            <stop offset="0.4" stopColor="#3f6284" />
            <stop offset="1" stopColor="#1a456e" />
          </linearGradient>
          <linearGradient id={plate} x1="10" y1="6" x2="54" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fbfcfd" />
            <stop offset="0.45" stopColor="#e7eef4" />
            <stop offset="1" stopColor="#9aafc2" />
          </linearGradient>
          <linearGradient id={metal} x1="16" y1="16" x2="48" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#f7fbfe" />
            <stop offset="0.45" stopColor="#9eb4c8" />
            <stop offset="1" stopColor="#1a456e" />
          </linearGradient>
          <clipPath id={face}>
            <rect x="5.5" y="5.5" width="53" height="53" rx="15" />
          </clipPath>
        </defs>
        <rect x="1.5" y="1.5" width="61" height="61" rx="18" fill={`url(#${rim})`} />
        <rect x="5.5" y="5.5" width="53" height="53" rx="15" fill={`url(#${plate})`} />
        <g clipPath={`url(#${face})`}>
          <path d="M15 18 L32 49 L49 18" fill="none" stroke={`url(#${metal})`} strokeWidth="7" strokeLinejoin="miter" strokeLinecap="butt" />
          <circle cx="32" cy="45" r="4.2" fill="#f7fafc" stroke="#1a456e" strokeWidth="1.6" />
        </g>
      </svg>
    </span>
  )
}
