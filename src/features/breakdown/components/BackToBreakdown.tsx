import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function BackToBreakdown({ userId }: { userId: string }) {
  return (
    <Link
      to={`/app/${userId}/breakdown`}
      className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-base font-semibold text-[var(--bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
    >
      <ArrowLeft className="h-5 w-5" strokeWidth={2.25} />
      Back to Breakdown
    </Link>
  )
}
