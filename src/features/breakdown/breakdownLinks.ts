export function monthBreakdownPath(userId: string, fullDate: string) {
  const [year, month] = fullDate.split('-')
  if (!/^\d{4}$/.test(year || '') || !/^\d{2}$/.test(month || '')) {
    return `/app/${userId}/breakdown`
  }
  return `/app/${userId}/breakdown/month/${year}/${Number(month)}`
}

export function categorySpendPath(userId: string, categoryId: string, from?: string, to?: string) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const query = params.toString()
  return `/app/${userId}/breakdown/category/${categoryId}${query ? `?${query}` : ''}`
}

export function monthEnd(year: number, month: number) {
  const lastDay = new Date(year, month, 0).getDate()
  return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
}

export function rangeFromMonths(months: { fullDate: string }[]) {
  const keys = months.map((month) => month.fullDate).filter((key) => /^\d{4}-\d{2}$/.test(key)).sort()
  if (keys.length === 0) return {}
  const start = keys[0]
  const end = keys[keys.length - 1]
  const [year, month] = end.split('-').map(Number)
  return { from: `${start}-01`, to: monthEnd(year, month) }
}
