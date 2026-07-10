import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore, useChild, missionsOf, statusOf, daysWithPending } from '../../store'
import type { ChildId } from '../../lib/types'
import { labelKorean, shortLabel, todayKey } from '../../lib/date'
import { CATEGORY_META } from '../../lib/categories'
import CharacterAvatar from '../../components/CharacterAvatar'
import { ParentNav } from '../../components/Nav'
import { useToast } from '../../components/Toast'
import { sparkle } from '../../lib/confetti'

export default function Approve() {
  const { id } = useParams()
  const childId = id as ChildId
  const nav = useNavigate()
  const toast = useToast()
  const { state, approve, reject, approveAll, sendMessage } = useStore()
  const child = useChild(childId)

  const pendingDays = daysWithPending(state, childId)
  const today = todayKey()
  const dates = Array.from(new Set([today, ...pendingDays]))
  const [date, setDate] = useState(pendingDays[0] ?? today)
  const [commentFor, setCommentFor] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')

  const missions = missionsOf(state, childId)
  const sentItems = missions.filter((m) => statusOf(state, childId, date, m.id) === 'sent')
  const processed = missions.filter((m) => ['approved', 'rejected'].includes(statusOf(state, childId, date, m.id)))

  const doApprove = (mid: string, title: string) => {
    approve(childId, date, mid, commentFor === mid ? commentText : undefined)
    sparkle()
    if (commentFor === mid && commentText.trim()) sendMessage(childId, 'parent', `[${title}] ${commentText.trim()}`, '⭐')
    setCommentFor(null)
    setCommentText('')
    toast('승인 완료! 자녀 화면에 도장 ⭐이 찍혔어요')
  }
  const doReject = (mid: string, title: string) => {
    reject(childId, date, mid, commentFor === mid ? commentText : '다시 한번 해볼까요?')
    if (commentFor === mid && commentText.trim()) sendMessage(childId, 'parent', `[${title}] ${commentText.trim()}`)
    setCommentFor(null)
    setCommentText('')
    toast('반려했어요. 자녀에게 다시 안내됩니다')
  }
  const doApproveAll = () => {
    if (!sentItems.length) return
    approveAll(childId, date)
    sparkle()
    sendMessage(childId, 'parent', `오늘 미션 ${sentItems.length}개 모두 승인했어요! 정말 잘했어 🎉`, '🏆')
    toast(`${sentItems.length}건 모두 승인 완료! 🎉`)
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="iconbtn" onClick={() => nav(`/parent/${childId}/dashboard`)}>‹</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CharacterAvatar character={child.character} size={34} />
          <div className="topbar__title">{child.name} 미션 승인</div>
        </div>
      </div>

      <div className="screen__body">
        <div className="pad">
          {/* 날짜 선택 */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
            {dates.map((d) => {
              const cnt = missions.filter((m) => statusOf(state, childId, d, m.id) === 'sent').length
              return (
                <button
                  key={d}
                  onClick={() => setDate(d)}
                  className="chip"
                  style={{
                    flex: '0 0 auto',
                    padding: '8px 12px',
                    background: d === date ? 'var(--kakao-yellow)' : '#f4efe8',
                    color: d === date ? 'var(--kakao-brown)' : 'var(--ink-soft)',
                    fontFamily: 'var(--font-title)',
                  }}
                >
                  {d === today ? '오늘' : shortLabel(d)} {cnt > 0 && <span className="badge-dot" style={{ transform: 'scale(.75)' }}>{cnt}</span>}
                </button>
              )
            })}
          </div>

          <div className="section-title" style={{ justifyContent: 'space-between' }}>
            <span>{labelKorean(date)} · 승인 대기 {sentItems.length}건</span>
            {sentItems.length > 0 && (
              <button className="btn btn--sm btn--brown" onClick={doApproveAll}>모두 승인</button>
            )}
          </div>

          {sentItems.length === 0 && (
            <div className="card" style={{ textAlign: 'center', color: 'var(--ink-soft)', padding: 28 }}>
              🎉 승인 대기중인 미션이 없어요
            </div>
          )}

          {sentItems.map((m) => {
            const meta = CATEGORY_META[m.category]
            const open = commentFor === m.id
            return (
              <div key={m.id} className="card anim-slideup" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span className="chip" style={{ background: meta.soft, color: meta.color }}>{meta.icon} {m.category}</span>
                  <span className="chip">{m.cycle}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, margin: '10px 2px' }}>{m.title}</div>

                {open && (
                  <input
                    autoFocus
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="칭찬/피드백 코멘트 (선택)"
                    style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 12, padding: '10px 12px', marginBottom: 10, fontSize: 14, outline: 'none' }}
                  />
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn--sm" style={{ flex: 1, background: 'var(--ok)', color: '#fff', boxShadow: '0 4px 0 #23875a' }} onClick={() => doApprove(m.id, m.title)}>
                    ✔ 승인
                  </button>
                  <button className="btn btn--sm" style={{ flex: 1, background: '#fff', color: 'var(--danger)', boxShadow: '0 0 0 2px #ffd0d0 inset' }} onClick={() => doReject(m.id, m.title)}>
                    ✖ 반려
                  </button>
                  <button className="iconbtn" onClick={() => { setCommentFor(open ? null : m.id); setCommentText('') }} title="코멘트">💬</button>
                </div>
              </div>
            )
          })}

          {processed.length > 0 && (
            <>
              <div className="section-title">처리 완료 {processed.length}건</div>
              <div className="card" style={{ padding: 6 }}>
                {processed.map((m) => {
                  const st = statusOf(state, childId, date, m.id)
                  return (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', borderBottom: '1px solid var(--line)' }}>
                      <span style={{ fontSize: 18 }}>{st === 'approved' ? '⭐' : '✖'}</span>
                      <span style={{ flex: 1, fontSize: 14 }}>{m.title}</span>
                      <span className="chip" style={{ background: st === 'approved' ? '#e5f7ee' : '#ffe3e3', color: st === 'approved' ? 'var(--ok)' : 'var(--danger)' }}>
                        {st === 'approved' ? '승인' : '반려'}
                      </span>
                    </div>
                  )
                })}
                <div style={{ height: 4 }} />
              </div>
            </>
          )}
          <div style={{ height: 10 }} />
        </div>
      </div>

      <ParentNav childId={childId} />
    </div>
  )
}
