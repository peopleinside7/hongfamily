export type ChildId = 'juho' | 'jua'
export type CharacterKey = 'choonsik' | 'apeach'
export type Category = '신앙' | '독서' | '학습' | '생활'
export type Cycle = '매일' | '주5회' | '주1권 목표' | '주3회'

/** 미션 항목 상태 (기획서 2-2) */
export type Status = 'none' | 'checked' | 'sent' | 'approved' | 'rejected'

export interface Child {
  id: ChildId
  name: string
  character: CharacterKey
  emoji: string
}

export interface Mission {
  id: string
  childId: ChildId
  title: string
  category: Category
  cycle: Cycle
  order: number
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
}

/** 특정 자녀·날짜·미션의 수행 기록 */
export interface Record {
  status: Status
  /** 부모가 남긴 코멘트 */
  comment?: string
}

export interface Message {
  id: string
  childId: ChildId
  from: 'parent' | 'child'
  text?: string
  sticker?: string
  ts: number
}

/** records 키: `${childId}|${date}|${missionId}` */
export type RecordMap = { [key: string]: Record }

export interface AppState {
  version: number
  children: Child[]
  missions: Mission[]
  records: RecordMap
  messages: Message[]
  familyRule: string
  /** 마지막으로 선택한 자녀 (자녀 앱 진입 기억) */
  lastChild: ChildId | null
}
