import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  AppState,
  Category,
  CharacterKey,
  ChildId,
  Cycle,
  Mission,
  Status,
} from './lib/types'
import { buildSeed } from './data/seed'
import { addDays, lastNDays, todayKey } from './lib/date'

const STORAGE_KEY = 'hfm.v1'

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      if (parsed && parsed.version === 1) return parsed
    }
  } catch {
    /* ignore */
  }
  return buildSeed()
}

function save(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

interface Ctx {
  state: AppState
  // 자녀 화면
  toggleCheck: (childId: ChildId, date: string, missionId: string) => void
  sendMissions: (childId: ChildId, date: string) => number
  sendMessage: (childId: ChildId, from: 'parent' | 'child', text?: string, sticker?: string) => void
  setLastChild: (childId: ChildId) => void
  // 부모 화면
  approve: (childId: ChildId, date: string, missionId: string, comment?: string) => void
  reject: (childId: ChildId, date: string, missionId: string, comment?: string) => void
  approveAll: (childId: ChildId, date: string) => void
  addMission: (m: Omit<Mission, 'id' | 'order'>) => void
  updateMission: (id: string, patch: Partial<Mission>) => void
  deleteMission: (id: string) => void
  moveMission: (id: string, dir: -1 | 1) => void
  setCharacter: (childId: ChildId, character: CharacterKey) => void
  resetData: () => void
}

const StoreContext = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load)

  useEffect(() => {
    save(state)
  }, [state])

  const rkey = (c: ChildId, d: string, m: string) => `${c}|${d}|${m}`

  const setStatus = useCallback(
    (childId: ChildId, date: string, missionId: string, status: Status, comment?: string) => {
      setState((s) => {
        const records = { ...s.records }
        const k = rkey(childId, date, missionId)
        if (status === 'none') delete records[k]
        else records[k] = { status, comment: comment ?? records[k]?.comment }
        return { ...s, records }
      })
    },
    []
  )

  const toggleCheck: Ctx['toggleCheck'] = useCallback((childId, date, missionId) => {
    setState((s) => {
      const records = { ...s.records }
      const k = rkey(childId, date, missionId)
      const cur = records[k]?.status ?? 'none'
      // 이미 전송/승인된 항목은 자녀가 임의 해제 불가
      if (cur === 'sent' || cur === 'approved') return s
      if (cur === 'checked' || cur === 'rejected') delete records[k]
      else records[k] = { status: 'checked' }
      return { ...s, records }
    })
  }, [])

  const sendMissions: Ctx['sendMissions'] = useCallback((childId, date) => {
    let count = 0
    setState((s) => {
      const records = { ...s.records }
      for (const m of s.missions.filter((m) => m.childId === childId)) {
        const k = rkey(childId, date, m.id)
        if (records[k]?.status === 'checked') {
          records[k] = { ...records[k], status: 'sent' }
          count++
        }
      }
      return { ...s, records }
    })
    return count
  }, [])

  const approve: Ctx['approve'] = useCallback(
    (childId, date, missionId, comment) => setStatus(childId, date, missionId, 'approved', comment),
    [setStatus]
  )
  const reject: Ctx['reject'] = useCallback(
    (childId, date, missionId, comment) => setStatus(childId, date, missionId, 'rejected', comment),
    [setStatus]
  )

  const approveAll: Ctx['approveAll'] = useCallback((childId, date) => {
    setState((s) => {
      const records = { ...s.records }
      for (const m of s.missions.filter((m) => m.childId === childId)) {
        const k = rkey(childId, date, m.id)
        if (records[k]?.status === 'sent') records[k] = { ...records[k], status: 'approved' }
      }
      return { ...s, records }
    })
  }, [])

  const sendMessage: Ctx['sendMessage'] = useCallback((childId, from, text, sticker) => {
    setState((s) => ({
      ...s,
      messages: [
        ...s.messages,
        { id: `m${Date.now()}${Math.round(Math.random() * 999)}`, childId, from, text, sticker, ts: Date.now() },
      ],
    }))
  }, [])

  const setLastChild: Ctx['setLastChild'] = useCallback((childId) => {
    setState((s) => ({ ...s, lastChild: childId }))
  }, [])

  const addMission: Ctx['addMission'] = useCallback((m) => {
    setState((s) => {
      const siblings = s.missions.filter((x) => x.childId === m.childId)
      const order = siblings.length ? Math.max(...siblings.map((x) => x.order)) + 1 : 0
      const mission: Mission = { ...m, id: `${m.childId}-c${Date.now()}`, order }
      return { ...s, missions: [...s.missions, mission] }
    })
  }, [])

  const updateMission: Ctx['updateMission'] = useCallback((id, patch) => {
    setState((s) => ({
      ...s,
      missions: s.missions.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }))
  }, [])

  const deleteMission: Ctx['deleteMission'] = useCallback((id) => {
    setState((s) => ({ ...s, missions: s.missions.filter((m) => m.id !== id) }))
  }, [])

  const moveMission: Ctx['moveMission'] = useCallback((id, dir) => {
    setState((s) => {
      const target = s.missions.find((m) => m.id === id)
      if (!target) return s
      const siblings = s.missions
        .filter((m) => m.childId === target.childId)
        .sort((a, b) => a.order - b.order)
      const idx = siblings.findIndex((m) => m.id === id)
      const swap = siblings[idx + dir]
      if (!swap) return s
      const a = target.order
      const b = swap.order
      return {
        ...s,
        missions: s.missions.map((m) =>
          m.id === target.id ? { ...m, order: b } : m.id === swap.id ? { ...m, order: a } : m
        ),
      }
    })
  }, [])

  const setCharacter: Ctx['setCharacter'] = useCallback((childId, character) => {
    setState((s) => ({
      ...s,
      children: s.children.map((c) => (c.id === childId ? { ...c, character } : c)),
    }))
  }, [])

  const resetData: Ctx['resetData'] = useCallback(() => {
    const fresh = buildSeed()
    setState(fresh)
  }, [])

  const value = useMemo<Ctx>(
    () => ({
      state,
      toggleCheck,
      sendMissions,
      sendMessage,
      setLastChild,
      approve,
      reject,
      approveAll,
      addMission,
      updateMission,
      deleteMission,
      moveMission,
      setCharacter,
      resetData,
    }),
    [
      state,
      toggleCheck,
      sendMissions,
      sendMessage,
      setLastChild,
      approve,
      reject,
      approveAll,
      addMission,
      updateMission,
      deleteMission,
      moveMission,
      setCharacter,
      resetData,
    ]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

/* ================= 파생 셀렉터 ================= */

export function useChild(childId: ChildId) {
  const { state } = useStore()
  return state.children.find((c) => c.id === childId)!
}

export function missionsOf(state: AppState, childId: ChildId): Mission[] {
  return state.missions.filter((m) => m.childId === childId).sort((a, b) => a.order - b.order)
}

export function statusOf(
  state: AppState,
  childId: ChildId,
  date: string,
  missionId: string
): Status {
  return state.records[`${childId}|${date}|${missionId}`]?.status ?? 'none'
}

export function commentOf(
  state: AppState,
  childId: ChildId,
  date: string,
  missionId: string
): string | undefined {
  return state.records[`${childId}|${date}|${missionId}`]?.comment
}

export interface DayStats {
  total: number
  checked: number
  sent: number
  approved: number
  /** 자녀 진행률(체크+전송+승인) */
  doneForChild: number
  /** 달성률 계산용: 승인 개수 */
  rate: number // 승인/전체 %
  progress: number // 체크 이상/전체 % (자녀 진행바)
}

export function dayStats(state: AppState, childId: ChildId, date: string): DayStats {
  const missions = missionsOf(state, childId)
  const total = missions.length
  let checked = 0,
    sent = 0,
    approved = 0
  for (const m of missions) {
    const st = statusOf(state, childId, date, m.id)
    if (st === 'checked') checked++
    else if (st === 'sent') sent++
    else if (st === 'approved') approved++
  }
  const doneForChild = checked + sent + approved
  return {
    total,
    checked,
    sent,
    approved,
    doneForChild,
    rate: total ? Math.round((approved / total) * 100) : 0,
    progress: total ? Math.round((doneForChild / total) * 100) : 0,
  }
}

/** 승인 대기(전송됨) 개수 — 부모 대시보드 배지 */
export function pendingCount(state: AppState, childId: ChildId, date: string): number {
  return missionsOf(state, childId).filter(
    (m) => statusOf(state, childId, date, m.id) === 'sent'
  ).length
}

export function totalPending(state: AppState, date: string): number {
  return state.children.reduce((sum, c) => sum + pendingCount(state, c.id, date), 0)
}

/** 최근 n일 달성률 추이 (승인 기준) */
export function trend(state: AppState, childId: ChildId, date: string, n: number) {
  return lastNDays(date, n).map((d) => ({ date: d, rate: dayStats(state, childId, d).rate }))
}

/** 연속 달성(스트릭): 오늘 포함 거꾸로, 승인율 60% 이상인 날 연속 카운트 */
export function streak(state: AppState, childId: ChildId, date: string): number {
  let count = 0
  let cur = date
  // 오늘이 아직 미달이면 어제부터 계산
  if (dayStats(state, childId, cur).rate < 60) cur = addDays(cur, -1)
  for (let i = 0; i < 60; i++) {
    if (dayStats(state, childId, cur).rate >= 60) {
      count++
      cur = addDays(cur, -1)
    } else break
  }
  return count
}

/** 자녀가 전송했으나 아직 승인/반려 처리 안 된 날짜 목록 (부모 승인 화면) */
export function daysWithPending(state: AppState, childId: ChildId): string[] {
  const set = new Set<string>()
  for (const key of Object.keys(state.records)) {
    const [c, d] = key.split('|')
    if (c === childId && state.records[key].status === 'sent') set.add(d)
  }
  return Array.from(set).sort().reverse()
}

export function messagesOf(state: AppState, childId: ChildId): AppState['messages'] {
  return state.messages.filter((m) => m.childId === childId).sort((a, b) => a.ts - b.ts)
}

/** 자녀 홈 알림: 최근 승인/코멘트 개수 (읽음처리는 목업 범위 외) */
export function feedbackCount(state: AppState, childId: ChildId): number {
  return messagesOf(state, childId).filter((m) => m.from === 'parent').length
}
