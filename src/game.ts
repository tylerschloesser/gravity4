import { animationFrames, pipe } from 'rxjs'
import { map, scan, withLatestFrom } from 'rxjs/operators'
import { vec2 } from './math'
import { initPhysics } from './physics.init'
import { newRender } from './render'
import { Ball, Circle, Game, GameArgs, GameState } from './types'

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
  const { context, viewport$, input$ } = init

  const boxes: GameState['boxes'] = []

  const GRID_SIZE = 3
  const GAP = 60
  const BOX_SIZE = 30
  const GRID_CENTER = { x: (100 - BOX_SIZE) / 2, y: -65 }
  for (let i = Math.ceil(GRID_SIZE / -2); i < Math.ceil(GRID_SIZE / 2); i++) {
    for (let j = Math.ceil(GRID_SIZE / -2); j < Math.ceil(GRID_SIZE / 2); j++) {
      boxes.push({
        p: vec2(
          i * BOX_SIZE + i * GAP + GRID_CENTER.x,
          j * BOX_SIZE + j * GAP + GRID_CENTER.y
        ),
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
    ball: <Ball>{ p: vec2(50, 20), v: vec2(), r: 7, angle: 0 },
    boxes,
    circles,
    camera: { angle: 0, av: 0 },
    speed: 1,
    debug: {
      force: vec2(),
    },
  }

  const physics = await initPhysics(initialState)
  const render = await newRender()

  const state$ = animationFrames().pipe(
    mapDelta,
    withLatestFrom(input$),
    scan(
      (state, [delta, input]) => physics.update({ delta, input, state }),
      initialState
    )
  )

  state$
    .pipe(
      withLatestFrom(input$, viewport$),
      map(([state, input, viewport]) => ({
        state,
        input,
        viewport,
        context,
      }))
    )
    .subscribe(render)

  // game is never over
  return new Promise(() => {})
}
