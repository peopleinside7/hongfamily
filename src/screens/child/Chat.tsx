import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore, useChild, messagesOf } from '../../store'
import type { ChildId } from '../../lib/types'
import { STICKERS } from '../../lib/categories'
import CharacterAvatar from '../../components/CharacterAvatar'
import { ChildNav } from '../../components/Nav'

export default function ChildChat() {
  const { id } = useParams()
  const childId = id as ChildId
  const nav = useNavigate()
  const { state, sendMessage } = useStore()
  const child = useChild(childId)
  const msgs = messagesOf(state, childId)
  const [text, setText] = useState('')
  const [showStickers, setShowStickers] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs.length])

  const send = () => {
    if (!text.trim()) return
    sendMessage(childId, 'child', text.trim())
    setText('')
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="iconbtn" onClick={() => nav(`/child/${childId}/home`)}>‹</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CharacterAvatar character={child.character} size={34} />
          <div className="topbar__title">엄마·아빠와 대화</div>
        </div>
      </div>

      <div className="screen__body" style={{ background: '#b2c7d9' }}>
        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ textAlign: 'center', fontSize: 11, color: '#54697c', margin: '4px 0' }}>
            미션을 완료하면 엄마·아빠가 확인하고 응원해줘요 🎉
          </div>
          {msgs.map((m) => {
            const mine = m.from === 'child'
            return (
              <div key={m.id} style={{ display: 'flex', flexDirection: mine ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
                {!mine && <div style={{ fontSize: 22 }}>👩‍👧</div>}
                <div style={{ maxWidth: '72%' }}>
                  {!mine && <div style={{ fontSize: 11, color: '#41556a', marginBottom: 3, marginLeft: 4 }}>엄마·아빠</div>}
                  {m.sticker && !m.text ? (
                    <div style={{ fontSize: 44, textAlign: mine ? 'right' : 'left' }} className="anim-pop">{m.sticker}</div>
                  ) : (
                    <div
                      className="anim-slideup"
                      style={{
                        background: mine ? 'var(--kakao-yellow)' : '#fff',
                        color: 'var(--ink)',
                        padding: '9px 13px',
                        borderRadius: 16,
                        borderTopRightRadius: mine ? 4 : 16,
                        borderTopLeftRadius: mine ? 16 : 4,
                        fontSize: 14,
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      {m.text} {m.sticker}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={endRef} />
        </div>
      </div>

      {showStickers && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '10px 12px', background: '#fff', borderTop: '1px solid var(--line)' }}>
          {STICKERS.map((s) => (
            <button
              key={s}
              onClick={() => {
                sendMessage(childId, 'child', undefined, s)
                setShowStickers(false)
              }}
              style={{ fontSize: 28, padding: 4 }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, padding: 10, background: '#fff', borderTop: '1px solid var(--line)', alignItems: 'center' }}>
        <button className="iconbtn" onClick={() => setShowStickers((v) => !v)}>😊</button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="메시지 입력…"
          style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 20, padding: '10px 14px', fontSize: 14, outline: 'none' }}
        />
        <button className="btn btn--sm" onClick={send} style={{ borderRadius: 20 }}>전송</button>
      </div>

      <ChildNav childId={childId} />
    </div>
  )
}
