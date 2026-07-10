import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore, useChild, missionsOf, statusOf, dayStats } from '../../store'
import type { ChildId } from '../../lib/types'
import { addDays, labelKorean, monthGrid, parseKey, toKey, todayKey, WEEKDAYS } from '../../lib/date'
import { CATEGORY_META } from '../../lib/categories'
import { ChildNav } from '../../components/Nav'

function rateColor(rate: number, has: boolean): string {
  if (!has) return 'transparent'
  if (rate >= 80) return 'var(--ok)'
  if (rate >= 50) return 'var(--kakao-yellow-deep)'
  if (rate > 0) return '#ffcf7a'
  return '#f0ece4'
}

export default function ChildCalendar() {
  const { id } = useParams()
  const childId = id as ChildId
  const nav = useNavigate()
  const { state } = useStore()
  const child = useChild(childId)
  const today = todayKey()
  const [cursor, setCursor] = useState(today) // 보고 있는 달의 임의 날짜
  const [selected, setSelected] = useState(today)

  const cells = monthGrid(cursor)
  const monthLabel = `${parseKey(cursor).getFullYear()}년 ${parseKey(cursor).getMonth() + 1}월`

  const shiftMonth = (n: number) => {
    const d = parseKey(cursor)
    d.setMonth(d.getMonth() + n)
    setCursor(toKey(d))
  }

  const dayHasRecord = (key: string) =>
    missionsOf(state, childId).some((m) => statusOf(state, childId, key, m.id) !== 'none')

  const selStats = dayStats(state, childId, selected)
  const selMissions = missionsOf(state, childId)

  return (
    <div className="screen">
      <div className="topbar">
        <button className="iconbtn" onClick={() => nav(`/child/${childId}/home`)}>‹</button>
        <div className="topbar__title">{child.name}의 달력·기록</div>
      </div>

      <div className="screen__body">
        <div className="pad">
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <button className="iconbtn" onClick={() => shiftMonth(-1)}>‹</button>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 17, color: 'var(--kakao-brown)' }}>{monthLabel}</div>
              <button className="iconbtn" onClick={() => shiftMonth(1)}>›</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, textAlign: 'center' }}>
              {WEEKDAYS.map((w, i) => (
                <div key={w} style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? '#e06060' : 'var(--ink-soft)', padding: '4px 0' }}>
                  {w}
                </div>
              ))}
              {cells.map((key, i) => {
                if (!key) return <div key={`e${i}`} />
                const has = dayHasRecord(key)
                const rate = has ? dayStats(state, childId, key).rate : 0
                const isToday = key === today
                const isSel = key === selected
                const future = key > today
                return (
                  <button
                    key={key}
                    onClick={() => !future && setSelected(key)}
                    disabled={future}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 3,
                      background: isSel ? 'var(--kakao-yellow)' : 'transparent',
                      border: isToday ? '2px solid var(--kakao-brown)' : '2px solid transparent',
                      opacity: future ? 0.3 : 1,
                      color: 'var(--ink)',
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    {parseKey(key).getDate()}
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: rateColor(rate, has),
                      }}
                    />
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
              <Legend color="var(--ok)" label="80%+" />
              <Legend color="var(--kakao-yellow-deep)" label="50%+" />
              <Legend color="#ffcf7a" label="일부" />
            </div>
          </div>

          {/* 선택일 상세 */}
          <div className="section-title">{labelKorean(selected)} 수행 기록</div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 28, color: 'var(--kakao-brown)' }}>{selStats.rate}%</div>
            <div className="muted" style={{ fontSize: 13 }}>
              승인 {selStats.approved} · 전송 {selStats.sent} · 체크 {selStats.checked} / 총 {selStats.total}개
            </div>
          </div>

          <div className="card" style={{ padding: 6 }}>
            {selMissions.map((m) => {
              const st = statusOf(state, childId, selected, m.id)
              const meta = CATEGORY_META[m.category]
              const icon =
                st === 'approved' ? '⭐' : st === 'sent' ? '📮' : st === 'checked' ? '✅' : st === 'rejected' ? '✖' : '⬜'
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 8px', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ fontSize: 12 }}>{meta.icon}</span>
                  <span style={{ flex: 1, fontSize: 14, color: st === 'none' ? 'var(--ink-soft)' : 'var(--ink)' }}>{m.title}</span>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                </div>
              )
            })}
            <div style={{ height: 4 }} />
          </div>
          <div style={{ height: 8 }} />
        </div>
      </div>

      <ChildNav childId={childId} />
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--ink-soft)' }}>
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: color }} />
      {label}
    </span>
  )
}
