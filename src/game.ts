import { animationFrames, pipe } from 'rxjs'
import { map, scan, withLatestFrom } from 'rxjs/operators'
import { initBall, initBoxes, initCircles } from './game.generate'
import { vec2 } from './math'
import { initPhysics } from './physics.init'
import { initRender } from './render'
import { Game, GameArgs, GameState } from './types'

const mapDelta = pipe(
  scan<{ elapsed: number }, { delta: number; prev: number }>(
    (acc, { elapsed }) => ({
      delta: elapsed - acc.prev,
      prev: elapsed,
    }),
    { prev: 0, delta: 0 },
  ),
  map(({ delta }) => delta),
  // don't jump in case of long frames, or perhaps alt/tab
  map((delta) => Math.min(delta, (1 / 30) * 1000)),
)

export async function newGame(init: GameArgs): Promise<Game> {
  const { context, viewport$, input$ } = init

  const boxes = await initBoxes()
  const circles = await initCircles()
  const ball = await initBall()

  const initialState: GameState = {
    ball,
    boxes,
    circles,
    // initial angle is counter clockwise 90 degrees, aka facing "up" the y axis
    camera: { angle: Math.PI / 2, av: 0 },
    //camera: { angle: 0, av: 0 },
    speed: 0,
    gravity: vec2(),
    debug: {
      force: vec2(),
    },
  }

  const physics = await initPhysics(initialState)
  const render = await initRender()

  const state$ = animationFrames().pipe(
    mapDelta,
    withLatestFrom(input$),
    scan(
      (state, [delta, input]) => physics.update({ delta, input, state }),
      initialState,
    ),
  )

  state$
    .pipe(
      withLatestFrom(input$, viewport$),
      map(([state, input, viewport]) => ({
        state,
        input,
        viewport,
        context,
      })),
    )
    .subscribe(render)

  // game is never over
  return new Promise(() => {})
}
