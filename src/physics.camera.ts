import { isDragVyActive } from './physics.util'
import { Camera, GameState, Input } from './types'

export function updateCamera({
  delta,
  input,
  state,
}: {
  delta: number
  input: Input
  state: GameState
}): Camera {
  const { drag } = input
  let { angle, av } = state.camera

  if (input.down && !isDragVyActive(drag)) {
    const POW = 1
    const SCALE = 100

    let dragX = drag.v.x

    const dx =
      Math.sign(dragX) *
      Math.pow(Math.abs(dragX), POW) *
      (delta / 1000) *
      (Math.PI / 180)
    av = dx * SCALE
  } else {
    // reduce av
    av =
      Math.sign(av) *
      (Math.abs(av) - Math.abs(av) * (delta / 1000) * (0.66 * 10))
  }

  // enforce max av
  av =
    Math.sign(av) * Math.min(Math.abs(av), (Math.PI * (delta / 1000) * 10) / 2)

  angle += -av

  angle = (angle + Math.PI * 2) % (Math.PI * 2)

  return { angle, av }
}
