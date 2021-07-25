import { Observable } from 'rxjs'

export interface Vec2 {
  x: number
  y: number
}

export interface CanvasSize {
  w: number
  h: number
}

// x & y drag velocity in relative units per second
// 1 relative unit is the minimum screen dimension in pixels
export interface Drag {
  v: Vec2
}

export interface Input {
  pos: { x: number; y: number } | null
  down: boolean
  drag: Drag
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


export interface Circle {
  p: Vec2
  r: number
}

export interface GameState {
  ball: { x: number; y: number; r: number; angle: number }
  boxes: { x: number; y: number; size: number }[]
  circles: Circle[]
  angle: number
  angularVelocity: number
  speed: number
}
