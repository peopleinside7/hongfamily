import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore, useChild, dayStats, pendingCount, trend, streak } from '../../store'
import type { ChildId } from '../../lib/types'
import { labelKorean, todayKey } from '../../lib/date'
import CharacterAvatar from '../../components/CharacterAvatar'
import DonutChart from '../../components/DonutChart'
import TrendChart from '../../components/TrendChart'
import { ParentNav } from '../../components/Nav'

export default function Dashboard() {
  const { id } = useParams()
  const childId = id as ChildId
  const nav = useNavigate()
  const { state } = useStore()
  const child = useChild(childId)
  const date = todayKey()
  const [range, setRange] = useState<7 | 30>(7)

  const stats = dayStats(state, childId, date)
  const pend = pendingCount(state, childId, date)
  const str = streak(state, childId, date)
  const trendData = useMemo(() => trend(state, childId, date, range), [state, childId, date, range])
  const avgRate = trendData.length ? Math.round(trendData.reduce((s, d) => s + d.rate, 0) / trendData.length) : 0

  const color = childId === 'juho' ? 'var(--choonsik)' : 'var(--apeach)'

  return (
    <div className="screen">
      <div className="topbar">
        <button className="iconbtn" onClick={() => nav('/parent/select')}>‹</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CharacterAvatar character={child.character} size={34} />
          <div className="topbar__title">{child.name} 대시보드</div>
        </div>
      </div>

      <div className="screen__body">
        <div className="pad">
          <div className="muted" style={{ fontSize: 13, margin: '2px 4px 12px' }}>{labelKorean(date)} 기준</div>

          {/* 승인 대기 알림 */}
          {pend > 0 && (
            <button
              className="card anim-slideup"
              onClick={() => nav(`/parent/${childId}/approve`)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: '#fff3cd', border: '1px solid #ffe08a', marginBottom: 14 }}
            >
              <span style={{ fontSize: 26 }}>📮</span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--font-title)', color: '#8a6d1a' }}>승인 대기 {pend}건</div>
                <div style={{ fontSize: 12, color: '#a5852a' }}>{child.name}가 완료 전송한 미션이 있어요</div>
              </div>
              <span className="badge-dot">{pend}</span>
            </button>
          )}

          {/* 요약 카드 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="card" style={{ textAlign: 'center', padding: '16px 10px' }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 34, color: 'var(--ok)' }}>{stats.approved}</div>
              <div className="muted" style={{ fontSize: 12 }}>오늘 달성(승인)</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '16px 10px' }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 34, color: 'var(--danger)' }}>
                {stats.total - stats.approved}
              </div>
              <div className="muted" style={{ fontSize: 12 }}>미달성</div>
            </div>
          </div>

          {/* 달성률 도넛 */}
          <div className="section-title">오늘의 달성률</div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <DonutChart percent={stats.rate} color={color} sub={`${stats.approved}/${stats.total}`} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--ink-soft)' }}>
                <div>승인 미션 <b style={{ color: 'var(--ink)' }}>{stats.approved}</b></div>
                <div>전송 대기 <b style={{ color: 'var(--ink)' }}>{stats.sent}</b></div>
                <div>체크만 <b style={{ color: 'var(--ink)' }}>{stats.checked}</b></div>
                <div>전체 <b style={{ color: 'var(--ink)' }}>{stats.total}</b></div>
              </div>
              {str > 0 && (
                <div className="chip" style={{ background: '#fff0e0', color: '#e07a1f', marginTop: 8 }}>🔥 {str}일 연속 달성</div>
              )}
            </div>
          </div>
          <div className="muted" style={{ fontSize: 11, margin: '8px 4px 0' }}>
            달성률 = (승인된 미션 ÷ 전체 미션) × 100 · 미체크 항목은 미달성 집계
          </div>

          {/* 추이 그래프 */}
          <div className="section-title" style={{ justifyContent: 'space-between' }}>
            <span>달성률 추이</span>
            <span className="role-toggle" style={{ background: '#f4efe8', padding: 3 }}>
              <button className={range === 7 ? 'active' : ''} style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => setRange(7)}>주간</button>
              <button className={range === 30 ? 'active' : ''} style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => setRange(30)}>월간</button>
            </span>
          </div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="muted" style={{ fontSize: 12 }}>최근 {range}일 평균</span>
              <span style={{ fontFamily: 'var(--font-title)', color: 'var(--kakao-brown)' }}>{avgRate}%</span>
            </div>
            <TrendChart data={range === 7 ? trendData : trendData.slice(-14)} color={color} />
            {range === 30 && <div className="muted" style={{ fontSize: 10, textAlign: 'center', marginTop: 4 }}>* 최근 14일 표시</div>}
          </div>

          <div style={{ height: 10 }} />
        </div>
      </div>

      <ParentNav childId={childId} />
    </div>
  )
}
