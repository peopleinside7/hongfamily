import type { AppState, Category, Cycle, Mission, RecordMap, Status } from '../lib/types'
import { addDays, todayKey } from '../lib/date'

const PERIOD_START = '2026-07-07'
const PERIOD_END = '2026-08-31'

/** 기획서 4장 초기 미션 세트 (주호=주아 공통) */
const BASE: { title: string; category: Category; cycle: Cycle }[] = [
  { title: '새벽기도 (주5회) — 3일은 교회에서 기도하기', category: '신앙', cycle: '주5회' },
  { title: '주일말씀 필사하기 1장', category: '신앙', cycle: '매일' },
  { title: '성령사연 쓰기', category: '신앙', cycle: '매일' },
  { title: '명지 영성 예배', category: '신앙', cycle: '매일' },
  { title: '교회에서 말씀 듣기', category: '신앙', cycle: '매일' },
  { title: '자기 전 기도 또는 찬양 듣기', category: '신앙', cycle: '매일' },
  { title: '선생님 책 50페이지 이상 읽기', category: '독서', cycle: '주1권 목표' },
  { title: '영어 단어 30개 테스트', category: '학습', cycle: '매일' },
  { title: '3030 잉글리쉬', category: '학습', cycle: '매일' },
  { title: '영어 독해 2장', category: '학습', cycle: '매일' },
  { title: '수학 20문제 이상', category: '학습', cycle: '매일' },
  { title: '국어 문제집 2장 풀기', category: '학습', cycle: '매일' },
  { title: '한국사 책 읽기', category: '학습', cycle: '매일' },
  { title: '방 청소·정리하기', category: '생활', cycle: '매일' },
  { title: '설거지하기', category: '생활', cycle: '매일' },
  { title: '11시 반 잠자기', category: '생활', cycle: '매일' },
]

function makeMissions(): Mission[] {
  const list: Mission[] = []
  for (const childId of ['juho', 'jua'] as const) {
    BASE.forEach((m, i) => {
      list.push({
        id: `${childId}-m${i + 1}`,
        childId,
        title: m.title,
        category: m.category,
        cycle: m.cycle,
        order: i,
        startDate: PERIOD_START,
        endDate: PERIOD_END,
      })
    })
  }
  return list
}

/** 결정적 의사난수 (시드값 기반) — 새로고침해도 동일한 과거 기록 */
function seededRand(seed: number): () => number {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/**
 * 대시보드/달력/스트릭이 풍성해 보이도록 과거 6일치 기록을 생성.
 * 오늘은 자녀가 아직 체크 전 상태(none)로 둔다.
 */
function makeHistory(missions: Mission[]): RecordMap {
  const rec: RecordMap = {}
  const today = todayKey()
  const rand: { [k in 'juho' | 'jua']: () => number } = {
    juho: seededRand(20260707),
    jua: seededRand(19990101),
  }
  // 자녀별 성실도 (어피치가 살짝 더 높게)
  const diligence = { juho: 0.72, jua: 0.85 }

  for (let back = 6; back >= 1; back--) {
    const date = addDays(today, -back)
    for (const childId of ['juho', 'jua'] as const) {
      const childMissions = missions.filter((m) => m.childId === childId)
      for (const m of childMissions) {
        const r = rand[childId]()
        let status: Status = 'none'
        if (r < diligence[childId]) {
          // 대부분 승인, 일부는 전송/체크 상태로 남김
          const r2 = rand[childId]()
          status = r2 < 0.88 ? 'approved' : r2 < 0.95 ? 'checked' : 'sent'
        }
        if (status !== 'none') {
          rec[`${childId}|${date}|${m.id}`] = { status }
        }
      }
    }
  }
  return rec
}

export function buildSeed(): AppState {
  const missions = makeMissions()
  return {
    version: 1,
    children: [
      { id: 'juho', name: '주호', character: 'choonsik', emoji: '🐱' },
      { id: 'jua', name: '주아', character: 'apeach', emoji: '🍑' },
    ],
    missions,
    records: makeHistory(missions),
    messages: [
      {
        id: 'msg1',
        childId: 'juho',
        from: 'parent',
        text: '주호야 어제 미션 다 했네! 정말 대견해 🐻 오늘도 화이팅!',
        ts: Date.now() - 1000 * 60 * 60 * 20,
      },
      {
        id: 'msg2',
        childId: 'jua',
        from: 'parent',
        text: '주아 최고! 6일 연속 달성 중이야 🔥 엄마가 응원해!',
        sticker: '⭐',
        ts: Date.now() - 1000 * 60 * 60 * 18,
      },
    ],
    familyRule: '2번 이상 실패 시 → 학교를 열심히 다닌다.',
    lastChild: null,
  }
}
