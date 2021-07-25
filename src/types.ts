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

interface Ball {
  p: Vec2
  r: number
  angle: number
}

interface Box {
  p: Vec2
  size: number
}

export interface GameState {
  ball: Ball
  boxes: Box[]
  circles: Circle[]
  angle: number
  angularVelocity: number
  speed: number
}
