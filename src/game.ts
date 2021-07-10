import { animationFrames, pipe } from 'rxjs'
import { map, scan, withLatestFrom } from 'rxjs/operators'
import { newPhysics } from './physics'
import { render } from './render'
import { Game, GameArgs, Pointer } from './types'

const mapDelta = pipe(
  scan<{ elapsed: number }, { delta: number; prev: number }>(
    (acc, { elapsed }) => ({
      delta: elapsed - acc.prev,
      prev: elapsed,
    }),
    { prev: 0, delta: 0 }
  ),
  map(({ delta }) => delta),
  // don't jump in case of long frames, or perhaps alt/tab
  map((delta) => Math.min(delta, (1 / 30) * 1000))
)

export async function newGame(init: GameArgs): Promise<Game> {
  const { context, resize$, pointer$ } = init

  const physics = await newPhysics({
    ball: { x: 50, y: 20, r: 7, angle: 0 },
    //platform: { x: 0, y: 50, size: 100, angle: (20 * Math.PI) / 180 },
    platform: { x: 0, y: 50, size: 100, angle: 0 },
  })

  let lastPointer: Pointer | null = null

  let av = 0
  let angle = 0

  animationFrames()
    .pipe(mapDelta, withLatestFrom(pointer$, resize$))
    .subscribe(([delta, pointer, size]) => {
      let drag: { x: number; y: number } | null = null
      if (lastPointer?.down && pointer?.down) {
        drag = {
          x: pointer.x - lastPointer.x,
          y: pointer.y - lastPointer.y,
        }
      }
      lastPointer = pointer

      if (drag) {
        const dx =
          (Math.pow(Math.abs(drag.x), 1.25) * Math.sign(drag.x)) / size.w

        av = dx * (Math.PI / 180)
      } else {
        av *= 0.9
      }

      angle += -av * delta

      const state = physics.update({ delta, angle, size })
      render({ state, context, pointer, size, angle })
    })

  // game is never over
  return new Promise(() => {})
}
