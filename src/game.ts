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
}

interface GameState {
  boxA: { x: number; y: number }
  boxB: { x: number; y: number }
}

const INITIAL_STATE: GameState = {
  boxA: { x: 10, y: 90 },
  boxB: { x: 80, y: 90 },
}

export function newGame(init: GameArgs): Game {
  const { context, resize$, pointer$ } = init

  const engine = newPhysics()

  animationFrames()
    .pipe(
      scan(
        (acc, { elapsed }) => ({
          delta: elapsed - acc.prev,
          prev: elapsed,
        }),
        { prev: 0, delta: 0 }
      ),
      tap(({ delta }) => {
        Engine.update(engine, delta)
      })
    )
    .pipe(withLatestFrom(pointer$, resize$))
    .subscribe(([{ delta }, pointer, size]) => {
      render({ context, pointer, size })
    })

  return {}
}
