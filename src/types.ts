import { Observable } from 'rxjs'

export interface CanvasSize {
  w: number
  h: number
}

export interface Pointer {
  x: number
  y: number
  down: boolean
}

export interface Game {}

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

export interface GameState {
  ball: { x: number; y: number; r: number; angle: number }
  platform: { x: number; y: number; size: number; angle: number }
}
