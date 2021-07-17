import { animationFrames, pipe } from 'rxjs'
import { map, scan, withLatestFrom } from 'rxjs/operators'
import { newPhysics } from './physics'
import { render } from './render'
import { Game, GameArgs, GameState, Input } from './types'

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
  const { context, size$, input$ } = init

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
    angle: 0,
    angularVelocity: 0,
  })

  animationFrames()
    .pipe(
      mapDelta, 
      withLatestFrom(input$, size$),
      map(([ delta, input, size ]) => ({
        input,
        size,
        state: physics.update({ delta, size, input }),
        context,
      }))
    ).subscribe(render)

  // game is never over
  return new Promise(() => {})
}
