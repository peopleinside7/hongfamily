interface Props {
  percent: number
  size?: number
  color?: string
  label?: string
  sub?: string
}

/** 달성률 원형 그래프 (커스텀 SVG) */
export default function DonutChart({
  percent,
  size = 150,
  color = 'var(--kakao-yellow-deep)',
  label,
  sub,
}: Props) {
  const stroke = 16
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const p = Math.max(0, Math.min(100, percent))
  const dash = (p / 100) * c
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0ece4" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          style={{ transition: 'stroke-dasharray .6s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: size * 0.26, color: 'var(--kakao-brown)' }}>
            {label ?? `${p}%`}
          </div>
          {sub && <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
    </div>
  )
}
