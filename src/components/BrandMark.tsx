interface Props {
  size?: number
  className?: string
}

/** The app and browser tab use the same vector so the mark stays consistent at every size. */
export function BrandMark({ size = 44, className = '' }: Props) {
  return (
    <img
      src="/favicon.svg?v=balanced-flow"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      draggable={false}
      className={`brand-mark block shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
