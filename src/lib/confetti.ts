import confetti from 'canvas-confetti'

/** 미션 완료 전송 시 폭죽 (기획서 2-2) */
export function celebrate() {
  const colors = ['#FEE500', '#FF7BA0', '#EB9B3F', '#7C9CF5', '#57C2A8']
  const burst = (x: number) =>
    confetti({
      particleCount: 60,
      spread: 70,
      startVelocity: 42,
      origin: { x, y: 0.7 },
      colors,
      scalar: 0.9,
    })
  burst(0.3)
  setTimeout(() => burst(0.7), 120)
  setTimeout(
    () =>
      confetti({
        particleCount: 90,
        spread: 100,
        origin: { x: 0.5, y: 0.75 },
        colors,
        scalar: 1,
      }),
    240
  )
}

/** 승인 도장 등 가벼운 반짝임 */
export function sparkle() {
  confetti({
    particleCount: 30,
    spread: 55,
    startVelocity: 28,
    origin: { x: 0.5, y: 0.6 },
    colors: ['#FEE500', '#FFD900', '#FFFFFF'],
    scalar: 0.8,
  })
}
