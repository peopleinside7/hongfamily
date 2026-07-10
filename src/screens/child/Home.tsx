import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore, useChild, missionsOf, statusOf, commentOf, dayStats, streak, feedbackCount } from '../../store'
import type { ChildId, Status } from '../../lib/types'
import { labelKorean, todayKey } from '../../lib/date'
import { CATEGORY_META, CATEGORY_ORDER } from '../../lib/categories'
import CharacterAvatar from '../../components/CharacterAvatar'
import { ChildNav } from '../../components/Nav'
import { useToast } from '../../components/Toast'
import { celebrate } from '../../lib/confetti'

function StatusCircle({ status, onTap }: { status: Status; onTap: () => void }) {
  const locked = status === 'sent' || status === 'approved'
  const base: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: 20,
    flex: '0 0 auto',
    transition: 'all .15s ease',
  }
  if (status === 'approved')
    return (
      <div style={{ ...base, background: 'var(--kakao-yellow)' }} className="anim-pop" title="승인됨">
        ⭐
      </div>
    )
  if (status === 'sent')
    return (
      <div style={{ ...base, background: 'var(--kakao-yellow-deep)' }} title="전송됨(승인 대기)">
        📮
      </div>
    )
  if (status === 'checked')
    return (
      <button onClick={onTap} style={{ ...base, background: 'var(--kakao-yellow)', boxShadow: '0 3px 0 var(--kakao-yellow-deep)' }} className="anim-pop">
        ✓
      </button>
    )
  if (status === 'rejected')
    return (
      <button onClick={onTap} style={{ ...base, background: '#ffe3e3', color: 'var(--danger)', border: '2px solid var(--danger)' }} title="반려됨 - 다시 해보기">
        ✖
      </button>
    )
  return (
    <button
      onClick={onTap}
      disabled={locked}
      style={{ ...base, background: '#f1ece4', border: '2px solid #e2dad0' }}
      aria-label="체크"
    />
  )
}

export default function ChildHome() {
  const { id } = useParams()
  const childId = id as ChildId
  const nav = useNavigate()
  const toast = useToast()
  const { state, toggleCheck, sendMissions } = useStore()
  const child = useChild(childId)
  const date = todayKey()
  const [justSent, setJustSent] = useState(false)

  const missions = useMemo(() => missionsOf(state, childId), [state, childId])
  const stats = dayStats(state, childId, date)
  const str = streak(state, childId, date)
  const fb = feedbackCount(state, childId)

  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: missions.filter((m) => m.category === cat),
  })).filter((g) => g.items.length)

  const checkedCount = missions.filter((m) => statusOf(state, childId, date, m.id) === 'checked').length

  const onSend = () => {
    const n = sendMissions(childId, date)
    if (n > 0) {
      celebrate()
      setJustSent(true)
      toast(`${n}개 미션을 엄마·아빠에게 전송했어요! 🎉`)
      setTimeout(() => setJustSent(false), 1500)
    }
  }

  return (
    <div className="screen">
      {/* 헤더 */}
      <div className="topbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="iconbtn" onClick={() => nav('/child')}>
            ‹
          </button>
          <button
            onClick={() => nav(`/child/${childId}/calendar`)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', color: 'var(--kakao-brown)' }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>오늘의 미션 ▾</span>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: 20 }}>{labelKorean(date)}</span>
          </button>
          <div className="topbar__spacer" />
          <button className="iconbtn" onClick={() => nav(`/child/${childId}/chat`)} style={{ position: 'relative' }}>
            💬
            {!!fb && (
              <span className="badge-dot" style={{ position: 'absolute', top: -4, right: -4, transform: 'scale(.8)' }}>
                {fb}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="screen__body">
        <div className="pad">
          {/* 진행률 카드 */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <CharacterAvatar character={child.character} size={72} floating />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-title)', fontSize: 15, color: 'var(--kakao-brown)' }}>
                  {child.name}의 진행률
                </span>
                {str > 0 && <span className="chip" style={{ background: '#fff0e0', color: '#e07a1f' }}>🔥 {str}일 연속</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <div style={{ flex: 1, height: 14, background: '#f0ece4', borderRadius: 999, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${stats.progress}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg,var(--kakao-yellow),var(--kakao-yellow-deep))',
                      borderRadius: 999,
                      transition: 'width .4s ease',
                    }}
                  />
                </div>
                <span style={{ fontFamily: 'var(--font-title)', color: 'var(--kakao-brown)' }}>{stats.progress}%</span>
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                {stats.doneForChild} / {stats.total}개 완료 · 승인 {stats.approved}개 ⭐
              </div>
            </div>
          </div>

          {/* 미션 그룹 */}
          {grouped.map((g) => {
            const meta = CATEGORY_META[g.cat]
            return (
              <div key={g.cat}>
                <div className="section-title">
                  <span style={{ fontSize: 18 }}>{meta.icon}</span>
                  {g.cat}
                  <span className="chip" style={{ background: meta.soft, color: meta.color }}>
                    {g.items.length}
                  </span>
                </div>
                <div className="card" style={{ padding: 6 }}>
                  {g.items.map((m) => {
                    const st = statusOf(state, childId, date, m.id)
                    const cmt = commentOf(state, childId, date, m.id)
                    return (
                      <div
                        key={m.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '11px 10px',
                          borderBottom: '1px solid var(--line)',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 15,
                              color: st === 'approved' || st === 'checked' || st === 'sent' ? 'var(--ink)' : 'var(--ink)',
                              textDecoration: st === 'approved' ? 'none' : 'none',
                            }}
                          >
                            {m.title}
                          </div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                            <span className="chip" style={{ fontSize: 11, padding: '2px 8px' }}>{m.cycle}</span>
                            {st === 'sent' && <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>승인 대기중…</span>}
                            {st === 'approved' && <span style={{ fontSize: 11, color: 'var(--ok)', fontWeight: 700 }}>승인 완료!</span>}
                            {st === 'rejected' && <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 700 }}>다시 해보기</span>}
                          </div>
                          {cmt && (
                            <div style={{ fontSize: 12, color: 'var(--kakao-brown-soft)', background: '#fff7e0', padding: '5px 8px', borderRadius: 8, marginTop: 6 }}>
                              💬 {cmt}
                            </div>
                          )}
                        </div>
                        <StatusCircle status={st} onTap={() => toggleCheck(childId, date, m.id)} />
                      </div>
                    )
                  })}
                  <div style={{ height: 4 }} />
                </div>
              </div>
            )
          })}

          {/* 완료 전송 */}
          <div style={{ marginTop: 18 }}>
            <button className={`btn ${justSent ? 'btn--brown' : ''}`} onClick={onSend} disabled={checkedCount === 0}>
              {checkedCount === 0 ? '체크한 미션이 없어요' : `미션 완료 전송 (${checkedCount}개) 🚀`}
            </button>
          </div>
          <div style={{ height: 8 }} />
        </div>
      </div>

      {/* 가족 규칙 고정 */}
      <div
        style={{
          background: '#fff3cd',
          borderTop: '1px solid #ffe08a',
          padding: '8px 14px',
          fontSize: 12.5,
          fontWeight: 700,
          color: '#8a6d1a',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        ⚠️ 가족 규칙 · {state.familyRule}
      </div>

      <ChildNav childId={childId} />
    </div>
  )
}
