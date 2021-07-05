import { Observable } from 'rxjs'

interface Game {}

export interface ResizeEvent {
  w: number
  h: number
}

export interface InitGame {
  context: CanvasRenderingContext2D
  resize$: Observable<ResizeEvent>
}

export function newGame({ context }: InitGame): Game {
  // context.fillStyle = '#444'
  // context.fillRect(0, 0, w, h)

  return {}
}
