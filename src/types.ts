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

export interface Key {
  key: string
  down: boolean
}

export interface Game {}

export interface GameArgs {
  context: CanvasRenderingContext2D
  size$: Observable<CanvasSize>
  pointer$: Observable<Pointer | null>
  key$: Observable<Key>
}

export interface RenderArgs {
  context: CanvasRenderingContext2D
  pointer: Pointer | null
  size: CanvasSize
  state: GameState
  angle: number
}

export interface GameState {
  ball: { x: number; y: number; r: number; angle: number }
  boxes: { x: number; y: number; size: number }[]
}
