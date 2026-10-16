import { Folder } from 'lucide-react'
import { getIconById } from '../lib/categoryIcons'

export function CategoryGlyph({ iconId, className = '' }: { iconId?: string; className?: string }) {
  if (!iconId) return <Folder className={className} strokeWidth={1.75} />
  const IconComponent = getIconById(iconId)
  return <IconComponent className={className} strokeWidth={1.75} />
}

export function renderCategoryIcon(iconId: string | undefined, className = '') {
  return <CategoryGlyph iconId={iconId} className={className} />
}
