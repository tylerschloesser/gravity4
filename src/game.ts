import { animationFrames, pipe } from 'rxjs'
import { map, scan, withLatestFrom } from 'rxjs/operators'
import { vec2 } from './math'
import { newPhysics } from './physics'
import { newRender } from './render'
import { Circle, Game, GameArgs, GameState } from './types'

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

  const GRID_SIZE = 3
  const GAP = 60
  const BOX_SIZE = 30
  const GRID_CENTER = { x: (100 - BOX_SIZE) / 2, y: -65 }
  for (let i = Math.ceil(GRID_SIZE / -2); i < Math.ceil(GRID_SIZE / 2); i++) {
    for (let j = Math.ceil(GRID_SIZE / -2); j < Math.ceil(GRID_SIZE / 2); j++) {
      boxes.push({
        x: i * BOX_SIZE + i * GAP + GRID_CENTER.x,
        y: j * BOX_SIZE + j * GAP + GRID_CENTER.y,
        size: BOX_SIZE,
      })
    }
  }

  const circles: Circle[] = [
    {
      p: {
        x: 50,
        y: -50,
      },
      r: 50,
    },
  ]

  const initialState: GameState = {
    ball: { p: vec2(50, 20), r: 7, angle: 0 },
    boxes,
    circles,
    angle: 0,
    angularVelocity: 0,
    speed: 1,
  }

  const physics = await newPhysics(initialState)
  const render = await newRender()

  const state$ = animationFrames().pipe(
    mapDelta,
    withLatestFrom(input$, size$),
    scan(
      (state, [delta, input, size]) =>
        physics.update({ delta, size, input, state }),
      initialState
    )
  )

  state$
    .pipe(
      withLatestFrom(input$, size$),
      map(([state, input, size]) => ({
        state,
        input,
        size,
        context,
      }))
    )
    .subscribe(render)

  // game is never over
  return new Promise(() => {})
}
