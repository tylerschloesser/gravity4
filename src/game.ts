import { animationFrames, Observable, pipe } from 'rxjs'
import { map, scan, withLatestFrom } from 'rxjs/operators'
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

  context.translate(
    state.platform.x * scale + (state.platform.size / 2) * scale,
    state.platform.y * scale + (state.platform.size / 2) * scale
  )
  context.rotate(state.platform.angle)

  context.strokeStyle = 'red'
  context.strokeRect(
    (-state.platform.size * scale) / 2,
    (-state.platform.size * scale) / 2,
    state.platform.size * scale,
    state.platform.size * scale
  )

  context.resetTransform()

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

  context.translate(state.ball.x * scale, state.ball.y * scale)
  context.rotate(state.ball.angle)
  context.strokeStyle = 'green'
  context.beginPath()
  context.moveTo(0, 0)
  context.lineTo(state.ball.r * scale, 0)
  context.stroke()
  context.resetTransform()
}

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
    ball: { x: 50, y: 20, r: 5, angle: 0 },
    //platform: { x: 0, y: 50, size: 100, angle: (20 * Math.PI) / 180 },
    platform: { x: 0, y: 50, size: 100, angle: 0 },
  })

  let lastPointer: Pointer | null = null

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

      const state = physics.update({ delta, drag, size })
      render({ state, context, pointer, size })
    })

  // game is never over
  return new Promise(() => {})
}
