import { Observable } from 'rxjs'

export interface Vec2 {
  x: number
  y: number
}

export type Viewport = Vec2

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
  viewport$: Observable<Viewport>
  input$: Observable<Input>
}

export interface RenderArgs {
  context: CanvasRenderingContext2D
  input: Input
  viewport: Viewport
  state: GameState
}

export interface Circle {
  id: string
  p: Vec2
  r: number
}

export interface Ball {
  p: Vec2
  v: Vec2
  r: number
  angle: number
}

export interface Box {
  /**
   * Top left corner of the box. Optimized for canvas drawing.
   * Box2D uses the center of rectangles.
   */
  p: Vec2

  size: number
}

// camera position is the same as ball position
export interface Camera {
  angle: number
  av: number
}

export interface DebugState {
  force: Vec2
}

export interface GameState {
  ball: Ball
  boxes: Box[]
  circles: Circle[]
  camera: Camera
  speed: number
  gravity: Vec2
  debug: DebugState
  circleHitId: string | null
}

export interface PhysicsUpdateFnArgs {
  delta: number
  input: Input
  state: GameState
}

export interface Physics {
  update: (args: PhysicsUpdateFnArgs) => GameState
}
