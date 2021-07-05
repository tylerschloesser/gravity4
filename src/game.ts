import {
  animationFrameScheduler,
  combineLatest,
  Observable,
  scheduled,
} from 'rxjs'

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

export function newGame(init: GameArgs): Game {
  const { context, resize$, pointer$ } = init

  scheduled(
    combineLatest([pointer$, resize$]),
    animationFrameScheduler
  ).subscribe(([pointer, size]) => {
    render({ context, pointer, size })
  })

  return {}
}
