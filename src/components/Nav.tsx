import { useLocation, useNavigate } from 'react-router-dom'
import type { ChildId } from '../lib/types'
import { useStore, totalPending } from '../store'
import { todayKey } from '../lib/date'

interface Item {
  to: string
  label: string
  icon: string
  badge?: number
}

function Bar({ items }: { items: Item[] }) {
  const nav = useNavigate()
  const loc = useLocation()
  return (
    <nav className="bottomnav">
      {items.map((it) => {
        const active = loc.pathname === it.to || loc.pathname.startsWith(it.to + '/')
        return (
          <button key={it.to} className={active ? 'active' : ''} onClick={() => nav(it.to)}>
            <span className="ico" style={{ position: 'relative' }}>
              {it.icon}
              {!!it.badge && (
                <span
                  className="badge-dot"
                  style={{ position: 'absolute', top: -6, right: -12, transform: 'scale(.8)' }}
                >
                  {it.badge}
                </span>
              )}
            </span>
            <span>{it.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export function ChildNav({ childId }: { childId: ChildId }) {
  return (
    <Bar
      items={[
        { to: `/child/${childId}/home`, label: '오늘의 미션', icon: '✅' },
        { to: `/child/${childId}/calendar`, label: '달력·기록', icon: '📅' },
        { to: `/child/${childId}/chat`, label: '대화', icon: '💬' },
      ]}
    />
  )
}

export function ParentNav({ childId }: { childId: ChildId }) {
  const { state } = useStore()
  const pending = totalPending(state, todayKey())
  return (
    <Bar
      items={[
        { to: `/parent/${childId}/dashboard`, label: '대시보드', icon: '📊' },
        { to: `/parent/${childId}/approve`, label: '승인', icon: '📮', badge: pending },
        { to: `/parent/${childId}/missions`, label: '미션관리', icon: '🗂️' },
        { to: `/parent/settings`, label: '설정', icon: '⚙️' },
      ]}
    />
  )
}
