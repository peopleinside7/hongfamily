import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../App'
import bannerBeach from '../../assets/kakao/2.jpeg'

export default function ParentLogin() {
  const nav = useNavigate()
  const { login } = useAuth()
  const [id, setId] = useState('parent')
  const [pw, setPw] = useState('')

  const go = () => {
    login()
    nav('/parent/select')
  }

  return (
    <div className="screen">
      <div className="screen__body">
        <div style={{ background: 'var(--kakao-yellow)', padding: '28px 20px 22px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 24, color: 'var(--kakao-brown)' }}>부모(관리자) 로그인</div>
          <div style={{ color: 'var(--kakao-brown-soft)', fontWeight: 700, marginTop: 4, fontSize: 13 }}>
            우리가족 미션달성 앱 · 관리자
          </div>
          <img src={bannerBeach} alt="" style={{ width: '100%', borderRadius: 18, marginTop: 16, boxShadow: 'var(--shadow-sm)' }} />
        </div>

        <div className="pad">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)' }}>
              아이디
              <input
                value={id}
                onChange={(e) => setId(e.target.value)}
                style={{ width: '100%', marginTop: 6, border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', fontSize: 15, outline: 'none' }}
              />
            </label>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)' }}>
              비밀번호
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && go()}
                placeholder="데모: 아무 값이나 입력"
                style={{ width: '100%', marginTop: 6, border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', fontSize: 15, outline: 'none' }}
              />
            </label>
            <button className="btn" onClick={go}>로그인</button>
          </div>

          <div style={{ textAlign: 'center', margin: '16px 0 10px', color: 'var(--ink-soft)', fontSize: 12 }}>또는 간편 로그인</div>
          <button className="btn" onClick={go} style={{ background: '#fee500' }}>
            💬 카카오로 시작하기
          </button>
          <button className="btn btn--ghost" onClick={go} style={{ marginTop: 10 }}>
            📱 휴대폰 번호로 시작하기
          </button>

          <div className="muted" style={{ fontSize: 11, textAlign: 'center', marginTop: 16 }}>
            * 데모 프로토타입입니다. 실제 인증 없이 로그인됩니다.
          </div>
        </div>
      </div>
    </div>
  )
}
