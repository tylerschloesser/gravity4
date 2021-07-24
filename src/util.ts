import { Circle, GameState } from './types'

export function isCircleHit(state: GameState, circle: Circle) {
  const { p } = circle
  const dx = p.x - state.ball.x
  const dy = p.y - state.ball.y
  const dist = Math.sqrt(dx*dx + dy*dy)
  return Math.abs(dist - circle.r) < state.ball.r
}
