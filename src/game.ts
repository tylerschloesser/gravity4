import { animationFrameScheduler, Observable, scheduled } from 'rxjs'

interface Game {}

export interface CanvasSize {
  w: number
  h: number
}

export interface InitGame {
  context: CanvasRenderingContext2D
  resize$: Observable<CanvasSize>
}

export function newGame(init: InitGame): Game {
  const { context, resize$ } = init

  // context.fillStyle = '#444'
  // context.fillRect(0, 0, w, h)

  scheduled(resize$, animationFrameScheduler).subscribe((canvasSize) => {
    const { w, h } = canvasSize
    context.fillStyle = '#444'
    context.fillRect(0, 0, w, h)
  })

  return {}
}
