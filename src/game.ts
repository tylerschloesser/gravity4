import { Engine } from 'matter-js'
import { animationFrames, Observable } from 'rxjs'
import { scan, tap, withLatestFrom } from 'rxjs/operators'
import { newPhysics } from './physics'

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

  engine: ReturnType<typeof newPhysics>
}

function render(args: RenderArgs) {
  const { context, pointer, size } = args
  const { w, h } = size
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

  args.engine.world.bodies.forEach((body) => {
    const w = Math.abs(body.bounds.max.x - body.bounds.min.x)
    const h = Math.abs(body.bounds.max.y - body.bounds.min.y)

    context.strokeStyle = 'white'
    context.beginPath()
    context.rect(body.position.x, body.position.y, w, h)
    context.stroke()
  })
}

interface GameState {
  boxA: { x: number; y: number }
  boxB: { x: number; y: number }
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

  const engine = newPhysics()

  animationFrames()
    .pipe(
      mapDelta,
      tap(({ delta }) => {
        Engine.update(engine, delta)
      })
    )
    .pipe(withLatestFrom(pointer$, resize$))
    .subscribe(([{ delta }, pointer, size]) => {
      render({ engine, context, pointer, size })
    })

  return {}
}
