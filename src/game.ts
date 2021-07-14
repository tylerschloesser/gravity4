import {animationFrames, pipe} from 'rxjs'
import {map, scan, withLatestFrom} from 'rxjs/operators'
import {newPhysics} from './physics'
import {render} from './render'
import {Game, GameArgs, GameState, Input} from './types'

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
  const { context, size$, input$, key$ } = init

  const boxes: GameState['boxes'] = []

  const GAP = 40
  const BOX_SIZE = 60
  for (let i = -2; i < 3; i++) {
    for (let j = -2; j < 3; j++) {
      boxes.push({
        x: i * BOX_SIZE + i * GAP + (100 - BOX_SIZE) / 2,
        y: j * BOX_SIZE + j * GAP + 50,
        size: BOX_SIZE,
      })
    }
  }

  const physics = await newPhysics({
    ball: { x: 50, y: 20, r: 7, angle: 0 },
    boxes,
  })

  let lastInput: Input | null = null

  let av = 0
  let angle = 0

  animationFrames()
    .pipe(mapDelta, withLatestFrom(input$, size$))
    .subscribe(([delta, input, size]) => {
      let drag: { x: number; y: number } | null = null
      if (lastInput?.pos && lastInput?.down && input.pos && input?.down) {
        if (input.pos.x - lastInput.pos.x !== 0) {
          drag = {
            x: input.pos.x - lastInput.pos.x,
            y: input.pos.y - lastInput.pos.y,
          }
        }
      }
      lastInput = input

      if (drag) {
        const POW = 1.8
        const SCALE = 200

        const dx =
          ((Math.sign(drag.x) * Math.pow(Math.abs(drag.x), POW)) / size.w) *
          (delta / 1000) *
          (Math.PI / 180)
        av = dx * SCALE
      } else {
        //av = Math.sign(av) * Math.max(Math.abs(av) - Math.sqrt(delta / 5000), 0)
        av =
          Math.sign(av) *
          (Math.abs(av) - Math.abs(av) * 0.5 * (delta / 1000) * 10)
      }

      av =
        Math.sign(av) *
        Math.min(Math.abs(av), (Math.PI * (delta / 1000) * 10) / 3)

      angle += -av

      const state = physics.update({ delta, angle, size })
      render({ state, context, input, size, angle })
    })

  // game is never over
  return new Promise(() => {})
}
