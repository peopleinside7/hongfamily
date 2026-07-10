import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import CharacterAvatar from '../../components/CharacterAvatar'
import bannerLineup from '../../assets/kakao/카카오프렌즈1.webp'

export default function CharacterSelect() {
  const nav = useNavigate()
  const { state, setLastChild } = useStore()

  const pick = (id: 'juho' | 'jua') => {
    setLastChild(id)
    nav(`/child/${id}/home`)
  }

  return (
    <div className="screen">
      <div className="screen__body">
        <div
          style={{
            background: 'var(--kakao-yellow)',
            padding: '22px 16px 16px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 26, color: 'var(--kakao-brown)' }}>
            우리가족 미션달성
          </div>
          <div style={{ color: 'var(--kakao-brown-soft)', fontWeight: 700, marginTop: 2 }}>
            주호 · 주아의 하루 미션
          </div>
          <img
            src={bannerLineup}
            alt="카카오프렌즈"
            style={{ width: '100%', borderRadius: 18, marginTop: 14, boxShadow: 'var(--shadow-sm)' }}
          />
        </div>

        <div className="pad">
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 18, color: 'var(--kakao-brown)', margin: '6px 4px 14px' }}>
            누구의 미션을 열어볼까요?
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {state.children.map((c) => (
              <button
                key={c.id}
                className="card anim-pop"
                onClick={() => pick(c.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  padding: '22px 12px',
                  border: `3px solid ${c.id === 'juho' ? 'var(--choonsik)' : 'var(--apeach)'}`,
                }}
              >
                <CharacterAvatar character={c.character} size={104} floating />
                <div style={{ fontFamily: 'var(--font-title)', fontSize: 22, color: 'var(--kakao-brown)' }}>
                  {c.emoji} {c.name}
                </div>
                <div className="chip" style={{ background: c.id === 'juho' ? 'var(--choonsik-soft)' : 'var(--apeach-soft)' }}>
                  {c.character === 'choonsik' ? '춘식이' : '어피치'}
                </div>
              </button>
            ))}
          </div>

          <div
            className="card"
            style={{ marginTop: 18, background: 'var(--choonsik-soft)', textAlign: 'center', fontWeight: 700, color: 'var(--kakao-brown-soft)' }}
          >
            오늘도 화이팅! 🐱🍑 매일 미션을 스스로 체크해봐요
          </div>
        </div>
      </div>
    </div>
  )
}
