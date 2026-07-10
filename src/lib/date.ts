const WEEK = ['일', '월', '화', '수', '목', '금', '토']

/** Date -> 'YYYY-MM-DD' (로컬 기준) */
export function toKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey(): string {
  return toKey(new Date())
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** '7월 8일 (화)' */
export function labelKorean(key: string): string {
  const d = parseKey(key)
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEK[d.getDay()]})`
}

export function shortLabel(key: string): string {
  const d = parseKey(key)
  return `${d.getMonth() + 1}.${d.getDate()}`
}

export function weekdayKor(key: string): string {
  return WEEK[parseKey(key).getDay()]
}

export function addDays(key: string, n: number): string {
  const d = parseKey(key)
  d.setDate(d.getDate() + n)
  return toKey(d)
}

/** key 이전 n일(오늘 포함) 배열, 과거->오늘 순 */
export function lastNDays(key: string, n: number): string[] {
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) out.push(addDays(key, -i))
  return out
}

export function isSameMonth(a: string, b: string): boolean {
  return a.slice(0, 7) === b.slice(0, 7)
}

/** 달력 그리드용: 해당 월의 날짜 배열 (앞쪽 null 패딩 포함) */
export function monthGrid(key: string): (string | null)[] {
  const d = parseKey(key)
  const year = d.getFullYear()
  const month = d.getMonth()
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (string | null)[] = []
  for (let i = 0; i < first.getDay(); i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toKey(new Date(year, month, day)))
  }
  return cells
}

export const WEEKDAYS = WEEK
