import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import type { CharacterKey } from '../../lib/types'
import CharacterAvatar from '../../components/CharacterAvatar'
import { ParentNav } from '../../components/Nav'
import { useToast } from '../../components/Toast'
import { useAuth } from '../../App'

const CHARS: { key: CharacterKey; name: string }[] = [
  { key: 'choonsik', name: '춘식이' },
  { key: 'apeach', name: '어피치' },
]

export default function Settings() {
  const nav = useNavigate()
  const toast = useToast()
  const { state, setCharacter, resetData } = useStore()
  const { logout } = useAuth()

  return (
    <div className="screen">
      <div className="topbar">
        <button className="iconbtn" onClick={() => nav('/parent/select')}>‹</button>
        <div className="topbar__title">설정</div>
      </div>

      <div className="screen__body">
        <div className="pad">
          <div className="section-title">자녀 캐릭터 매칭</div>
          {state.children.map((c) => (
            <div key={c.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <CharacterAvatar character={c.character} size={48} />
                <div style={{ fontFamily: 'var(--font-title)', fontSize: 17, color: 'var(--kakao-brown)' }}>{c.emoji} {c.name}</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {CHARS.map((ch) => {
                  const on = c.character === ch.key
                  return (
                    <button
                      key={ch.key}
                      onClick={() => { setCharacter(c.id, ch.key); toast(`${c.name} 캐릭터를 ${ch.name}(으)로 변경했어요`) }}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        padding: '12px 0',
                        borderRadius: 14,
                        background: on ? 'var(--kakao-yellow)' : '#f6f2ec',
                        border: on ? '2px solid var(--kakao-brown)' : '2px solid transparent',
                      }}
                    >
                      <CharacterAvatar character={ch.key} size={44} />
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{ch.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="section-title">가족 규칙</div>
          <div className="card" style={{ background: '#fff3cd', color: '#8a6d1a', fontWeight: 700, fontSize: 14 }}>
            ⚠️ {state.familyRule}
          </div>

          <div className="section-title">데이터</div>
          <div className="card">
            <button
              className="btn btn--ghost"
              onClick={() => {
                if (confirm('모든 기록을 초기 상태로 되돌릴까요? (미션·수행기록·대화 초기화)')) {
                  resetData()
                  toast('초기 데이터로 리셋했어요')
                }
              }}
            >
              🔄 초기 데이터로 리셋
            </button>
            <div className="muted" style={{ fontSize: 11, marginTop: 8, textAlign: 'center' }}>
              기획서 기준 미션 16개와 예시 기록으로 되돌립니다
            </div>
          </div>

          <div className="section-title">계정</div>
          <div className="card">
            <button className="btn btn--ghost" onClick={() => { logout(); nav('/parent/login') }}>로그아웃</button>
          </div>

          <div className="muted" style={{ fontSize: 11, textAlign: 'center', margin: '18px 0' }}>
            우리가족 미션달성 앱 · 프로토타입 v1.0<br />🐱 주호 · 🍑 주아 — 오늘도 미션 화이팅!
          </div>
        </div>
      </div>

      <ParentNav childId="juho" />
    </div>
  )
}
