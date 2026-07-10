import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore, useChild, missionsOf } from '../../store'
import type { Category, ChildId, Cycle, Mission } from '../../lib/types'
import { CATEGORY_META, CATEGORY_ORDER, CYCLES } from '../../lib/categories'
import CharacterAvatar from '../../components/CharacterAvatar'
import { ParentNav } from '../../components/Nav'
import { useToast } from '../../components/Toast'

interface FormState {
  title: string
  category: Category
  cycle: Cycle
  startDate: string
  endDate: string
}

const EMPTY: FormState = { title: '', category: '학습', cycle: '매일', startDate: '2026-07-07', endDate: '2026-08-31' }

export default function MissionManage() {
  const { id } = useParams()
  const childId = id as ChildId
  const nav = useNavigate()
  const toast = useToast()
  const { state, addMission, updateMission, deleteMission, moveMission } = useStore()
  const child = useChild(childId)
  const missions = missionsOf(state, childId)

  const [editing, setEditing] = useState<string | null>(null) // mission id | 'new' | null
  const [form, setForm] = useState<FormState>(EMPTY)

  const openNew = () => {
    setForm(EMPTY)
    setEditing('new')
  }
  const openEdit = (m: Mission) => {
    setForm({ title: m.title, category: m.category, cycle: m.cycle, startDate: m.startDate, endDate: m.endDate })
    setEditing(m.id)
  }
  const close = () => setEditing(null)

  const submit = () => {
    if (!form.title.trim()) {
      toast('미션 제목을 입력해주세요')
      return
    }
    if (editing === 'new') {
      addMission({ childId, title: form.title.trim(), category: form.category, cycle: form.cycle, startDate: form.startDate, endDate: form.endDate })
      toast('미션을 추가했어요')
    } else if (editing) {
      updateMission(editing, { title: form.title.trim(), category: form.category, cycle: form.cycle, startDate: form.startDate, endDate: form.endDate })
      toast('미션을 수정했어요')
    }
    close()
  }

  const remove = (m: Mission) => {
    if (confirm(`"${m.title}" 미션을 삭제할까요?`)) {
      deleteMission(m.id)
      toast('미션을 삭제했어요')
    }
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="iconbtn" onClick={() => nav(`/parent/${childId}/dashboard`)}>‹</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CharacterAvatar character={child.character} size={34} />
          <div className="topbar__title">{child.name} 미션 관리</div>
        </div>
      </div>

      <div className="screen__body">
        <div className="pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2px 4px 12px' }}>
            <span className="muted" style={{ fontSize: 13 }}>총 {missions.length}개 · 자녀별 개별 관리</span>
            <button className="btn btn--sm" onClick={openNew}>＋ 미션 추가</button>
          </div>

          {CATEGORY_ORDER.map((cat) => {
            const items = missions.filter((m) => m.category === cat)
            if (!items.length) return null
            const meta = CATEGORY_META[cat]
            return (
              <div key={cat}>
                <div className="section-title"><span>{meta.icon}</span>{cat}</div>
                <div className="card" style={{ padding: 6 }}>
                  {items.map((m, i) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 8px', borderBottom: '1px solid var(--line)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <button onClick={() => moveMission(m.id, -1)} disabled={i === 0} style={{ fontSize: 12, opacity: i === 0 ? 0.25 : 0.7, lineHeight: 1 }}>▲</button>
                        <button onClick={() => moveMission(m.id, 1)} disabled={i === items.length - 1} style={{ fontSize: 12, opacity: i === items.length - 1 ? 0.25 : 0.7, lineHeight: 1 }}>▼</button>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{m.title}</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                          <span className="chip" style={{ fontSize: 10, padding: '2px 7px' }}>{m.cycle}</span>
                          <span className="chip" style={{ fontSize: 10, padding: '2px 7px' }}>~{m.endDate.slice(5)}</span>
                        </div>
                      </div>
                      <button className="iconbtn" style={{ width: 32, height: 32, fontSize: 15 }} onClick={() => openEdit(m)}>✏️</button>
                      <button className="iconbtn" style={{ width: 32, height: 32, fontSize: 15 }} onClick={() => remove(m)}>🗑️</button>
                    </div>
                  ))}
                  <div style={{ height: 4 }} />
                </div>
              </div>
            )
          })}
          <div style={{ height: 10 }} />
        </div>
      </div>

      {/* 추가/수정 시트 */}
      {editing && (
        <div
          onClick={close}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.35)', zIndex: 90, display: 'flex', alignItems: 'flex-end' }}
        >
          <div className="anim-slideup" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', width: '100%', borderRadius: '24px 24px 0 0', padding: 18, maxHeight: '86%', overflowY: 'auto' }}>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 19, color: 'var(--kakao-brown)', marginBottom: 14 }}>
              {editing === 'new' ? '새 미션 추가' : '미션 수정'}
            </div>

            <Field label="미션 제목">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="예: 영어 단어 30개 테스트" style={inputStyle} />
            </Field>

            <Field label="분류">
              <div style={{ display: 'flex', gap: 8 }}>
                {CATEGORY_ORDER.map((c) => {
                  const meta = CATEGORY_META[c]
                  const on = form.category === c
                  return (
                    <button key={c} onClick={() => setForm({ ...form, category: c })} style={{ flex: 1, padding: '10px 0', borderRadius: 12, background: on ? meta.soft : '#f6f2ec', border: on ? `2px solid ${meta.color}` : '2px solid transparent', fontWeight: 700, fontSize: 13 }}>
                      {meta.icon} {c}
                    </button>
                  )
                })}
              </div>
            </Field>

            <Field label="반복 주기">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CYCLES.map((c) => (
                  <button key={c} onClick={() => setForm({ ...form, cycle: c })} className="chip" style={{ padding: '8px 14px', background: form.cycle === c ? 'var(--kakao-yellow)' : '#f4efe8', color: form.cycle === c ? 'var(--kakao-brown)' : 'var(--ink-soft)', fontFamily: 'var(--font-title)' }}>
                    {c}
                  </button>
                ))}
              </div>
            </Field>

            <div style={{ display: 'flex', gap: 10 }}>
              <Field label="시작일"><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} style={inputStyle} /></Field>
              <Field label="완료일"><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} style={inputStyle} /></Field>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn btn--ghost" style={{ flex: 1 }} onClick={close}>취소</button>
              <button className="btn" style={{ flex: 1 }} onClick={submit}>{editing === 'new' ? '추가' : '저장'}</button>
            </div>
          </div>
        </div>
      )}

      <ParentNav childId={childId} />
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid var(--line)',
  borderRadius: 12,
  padding: '11px 13px',
  fontSize: 14,
  outline: 'none',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14, flex: 1 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  )
}
