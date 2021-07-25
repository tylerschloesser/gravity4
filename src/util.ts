import { Circle, GameState } from './types'

export function isCircleHit(state: GameState, circle: Circle) {
  const { p } = circle
  const dx = p.x - state.ball.p.x
  const dy = p.y - state.ball.p.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  return Math.abs(dist - circle.r) < state.ball.r
}
