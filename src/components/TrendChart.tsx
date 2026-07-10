import { shortLabel, weekdayKor } from '../lib/date'

interface Props {
  data: { date: string; rate: number }[]
  color?: string
  height?: number
}

/** 주간/월간 달성률 추이 막대그래프 (경량 SVG) */
export default function TrendChart({ data, color = 'var(--kakao-yellow-deep)', height = 130 }: Props) {
  const w = 100 / Math.max(1, data.length)
  const barW = Math.min(w * 0.6, 10)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height, padding: '4px 2px' }}>
        {data.map((d) => (
          <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-soft)' }}>{d.rate}</div>
            <div
              style={{
                width: '70%',
                maxWidth: 22,
                height: `${Math.max(4, (d.rate / 100) * (height - 34))}px`,
                background: color,
                borderRadius: 8,
                transition: 'height .5s ease',
              }}
            />
            <div style={{ fontSize: 10, color: 'var(--ink-soft)' }}>{weekdayKor(d.date)}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 4px 0', fontSize: 9, color: 'var(--ink-soft)' }}>
        <span>{data.length ? shortLabel(data[0].date) : ''}</span>
        <span>{data.length ? shortLabel(data[data.length - 1].date) : ''}</span>
      </div>
    </div>
  )
}
