import { animationFrames, Observable } from 'rxjs'
import { scan, tap, withLatestFrom } from 'rxjs/operators'
import { GameState, newPhysics } from './physics'

interface Game {}

export interface CanvasSize {
  w: number
  h: number
}

export interface Pointer {
  x: number
  y: number
  down: boolean
}

export interface GameArgs {
  context: CanvasRenderingContext2D
  resize$: Observable<CanvasSize>
  pointer$: Observable<Pointer | null>
}

export interface RenderArgs {
  context: CanvasRenderingContext2D
  pointer: Pointer | null
  size: CanvasSize
  state: GameState
}

function render(args: RenderArgs) {
  const { context, pointer, size, state } = args
  const { w, h } = size
  context.clearRect(0, 0, w, h)

  context.fillStyle = '#444'
  context.fillRect(0, 0, w, h)

  if (pointer) {
    context.strokeStyle = 'white'
    if (pointer.down) {
      context.strokeStyle = 'blue'
    }
    context.beginPath()
    context.arc(pointer.x, pointer.y, 50, 0, 2 * Math.PI)
    context.stroke()
  }

  const scale = w / 100

  context.strokeStyle = 'red'
  context.strokeRect(
    state.platform.x * scale,
    state.platform.y * scale,
    state.platform.size * scale,
    state.platform.size * scale
  )

  context.strokeStyle = 'white'
  context.beginPath()
  context.arc(
    state.ball.x * scale,
    state.ball.y * scale,
    state.ball.r * scale,
    0,
    2 * Math.PI
  )
  context.stroke()
}

const mapDelta = scan<{ elapsed: number }, { delta: number; prev: number }>(
  (acc, { elapsed }) => ({
    delta: elapsed - acc.prev,
    prev: elapsed,
  }),
  { prev: 0, delta: 0 }
)

export function newGame(init: GameArgs): Game {
  const { context, resize$, pointer$ } = init

  const physics = newPhysics({
    ball: { x: 50, y: 20, r: 10 },
    platform: { x: 0, y: 50, size: 100 },
  })

  animationFrames()
    .pipe(mapDelta, withLatestFrom(pointer$, resize$))
    .subscribe(([{ delta }, pointer, size]) => {
      const state = physics.update({ delta })
      render({ state, context, pointer, size })
    })

  return {}
}
