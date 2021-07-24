import { Observable } from 'rxjs'

export interface CanvasSize {
  w: number
  h: number
}

export interface Drag2 {
  rdx: number
  rdy: number
  dx: number
  dy: number
  vx: number
  vy: number
  time: number
  correction: number
}

export interface Input {
  pos: { x: number; y: number } | null
  down: boolean
  drag2: Drag2 | null
}

export interface Key {
  key: string
  down: boolean
}

export interface Game {}

export interface GameArgs {
  context: CanvasRenderingContext2D
  size$: Observable<CanvasSize>
  input$: Observable<Input>
}

export interface RenderArgs {
  context: CanvasRenderingContext2D
  input: Input
  size: CanvasSize
  state: GameState
}

export interface GameState {
  ball: { x: number; y: number; r: number; angle: number }
  boxes: { x: number; y: number; size: number }[]
  angle: number
  angularVelocity: number
  speed: number
}
