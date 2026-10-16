import type { Frequency } from '../../types'

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
}

export function monthlyTotal(amount: number, frequency: Frequency) {
  const multiplier = { weekly: 4, biweekly: 2, monthly: 1, quarterly: 1 / 3, yearly: 1 / 12 }
  return amount * (multiplier[frequency] || 1)
}
