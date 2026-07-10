import { useNavigate } from 'react-router-dom'
import { useStore, pendingCount, dayStats } from '../../store'
import { todayKey } from '../../lib/date'
import CharacterAvatar from '../../components/CharacterAvatar'
import { useAuth } from '../../App'

export default function ParentChildSelect() {
  const nav = useNavigate()
  const { state } = useStore()
  const { logout } = useAuth()
  const date = todayKey()

  return (
    <div className="screen">
      <div className="topbar">
        <div className="topbar__title">관리 대상 선택</div>
        <div className="topbar__spacer" />
        <button className="iconbtn" onClick={() => { logout(); nav('/parent/login') }} title="로그아웃">⎋</button>
      </div>

      <div className="screen__body">
        <div className="pad">
          <div style={{ fontFamily: 'var(--font-title)', color: 'var(--kakao-brown)', fontSize: 17, margin: '4px 4px 14px' }}>
            어느 자녀를 관리할까요?
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {state.children.map((c) => {
              const pend = pendingCount(state, c.id, date)
              const stats = dayStats(state, c.id, date)
              return (
                <button
                  key={c.id}
                  className="card"
                  onClick={() => nav(`/parent/${c.id}/dashboard`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    textAlign: 'left',
                    border: `3px solid ${c.id === 'juho' ? 'var(--choonsik)' : 'var(--apeach)'}`,
                  }}
                >
                  <CharacterAvatar character={c.character} size={72} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-title)', fontSize: 20, color: 'var(--kakao-brown)' }}>
                      {c.emoji} {c.name}
                    </div>
                    <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>
                      오늘 달성률 {stats.rate}% · 승인 {stats.approved}/{stats.total}
                    </div>
                  </div>
                  {pend > 0 && <span className="badge-dot">{pend}</span>}
                  <span style={{ fontSize: 22, color: 'var(--ink-soft)' }}>›</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
