import type { Category, Cycle } from './types'

export const CATEGORY_META: Record<
  Category,
  { color: string; soft: string; icon: string }
> = {
  신앙: { color: 'var(--cat-faith)', soft: '#e7ecff', icon: '🙏' },
  독서: { color: 'var(--cat-read)', soft: '#ffeedd', icon: '📚' },
  학습: { color: 'var(--cat-study)', soft: '#ddf5ee', icon: '✏️' },
  생활: { color: 'var(--cat-life)', soft: '#f3e6fd', icon: '🏠' },
}

export const CATEGORY_ORDER: Category[] = ['신앙', '독서', '학습', '생활']

export const CYCLES: Cycle[] = ['매일', '주5회', '주3회', '주1권 목표']

export const STICKERS = ['⭐', '👍', '❤️', '🎉', '🔥', '🥰', '😆', '🏆', '🍀', '💯']
