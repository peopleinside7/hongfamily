import { useState } from 'react'
import type { CharacterKey } from '../lib/types'

const IMG: Record<CharacterKey, string> = {
  choonsik: '/kakao/choonsik.png',
  apeach: '/kakao/apeach.png',
}

const FALLBACK: Record<CharacterKey, { bg: string; emoji: string }> = {
  choonsik: { bg: 'var(--choonsik-soft)', emoji: '🐱' },
  apeach: { bg: 'var(--apeach-soft)', emoji: '🍑' },
}

interface Props {
  character: CharacterKey
  size?: number
  ring?: boolean
  floating?: boolean
}

/**
 * 캐릭터 아바타. public/kakao/{key}.png 가 있으면 실제 이미지를,
 * 없으면(크롭 전) 브랜드 컬러 원 + 이모지 임시 아바타를 표시한다.
 */
export default function CharacterAvatar({ character, size = 64, ring, floating }: Props) {
  const [ok, setOk] = useState(true)
  const fb = FALLBACK[character]
  return (
    <div
      className={floating ? 'anim-floaty' : undefined}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: fb.bg,
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        flex: '0 0 auto',
        boxShadow: ring ? '0 0 0 4px #fff, 0 6px 16px rgba(0,0,0,.12)' : undefined,
        animation: floating ? 'floaty 3s ease-in-out infinite' : undefined,
      }}
    >
      {ok ? (
        <img
          src={IMG[character]}
          alt={character}
          onError={() => setOk(false)}
          style={{ width: '86%', height: '86%', objectFit: 'contain' }}
        />
      ) : (
        <span style={{ fontSize: size * 0.5, lineHeight: 1 }}>{fb.emoji}</span>
      )}
    </div>
  )
}
