import Box2DFactory from 'box2d-wasm'
import { Drag, GameState, Input } from './types'

function calculateAngle({
  delta,
  input,
  state,
  size,
}: {
  delta: number
  input: Input
  state: GameState
  size: { w: number; h: number }
}): { angle: number; angularVelocity: number } {
  const { drag } = input
  let angle = state.angle
  let av = state.angularVelocity

  if (input.down && !isVyMax(drag)) {
    const POW = 1
    const SCALE = 100

    let dragX = drag.vx * -1

    const dx =
      Math.sign(dragX) *
      Math.pow(Math.abs(dragX), POW) *
      (delta / 1000) *
      (Math.PI / 180)
    av = dx * SCALE
  } else {
    // reduce av
    av =
      Math.sign(av) *
      (Math.abs(av) - Math.abs(av) * (delta / 1000) * (0.66 * 10))
  }

  // enforce max av
  av =
    Math.sign(av) * Math.min(Math.abs(av), (Math.PI * (delta / 1000) * 10) / 2)

  angle += -av

  return {
    angle,
    angularVelocity: av,
  }
}

function isVyMax(drag: Drag | null) {
  if (!drag) {
    return false
  }
  return Math.abs(drag.vy) > Math.abs(drag.vx)
}

function updatePhysics({
  box2d,
  world,
  ballBody,
  state,
  delta,
  size,
  input,
}: {
  box2d: typeof Box2D & EmscriptenModule
  world: Box2D.b2World
  ballBody: Box2D.b2Body
  state: GameState
  delta: number
  size: { w: number; h: number }
  input: Input
}): GameState {
  const { angle, angularVelocity } = calculateAngle({
    delta,
    input,
    state,
    size,
  })
  const grav = new box2d.b2Vec2(-1 * Math.sin(angle), Math.cos(angle))

  let { speed } = state
  const { drag } = input

  if (isVyMax(drag)) {
    const { vy } = input.drag!
    speed += vy * (delta / 1000) * -1 * 2
    speed = Math.max(Math.min(speed, 1), 0)
  }

  const gravScale = 200
  grav.Normalize()
  grav.op_mul(gravScale * -1)

  grav.op_mul(ballBody.GetMass())
  ballBody.ApplyForce(grav, ballBody.GetPosition(), true)

  let maxVel = (gravScale / 3) * speed

  if (ballBody.GetLinearVelocity().Length() > maxVel) {
    const newVelocity = new box2d.b2Vec2(
      ballBody.GetLinearVelocity().x,
      ballBody.GetLinearVelocity().y
    )
    newVelocity.Normalize()
    newVelocity.op_mul(maxVel)
    ballBody.SetLinearVelocity(newVelocity)
  }

  const velocityIterations = 40
  const positionIterations = 40
  world.Step(delta / 1000, velocityIterations, positionIterations)

  const ballPosition = ballBody.GetPosition()

  return {
    ...state,
    speed,
    ball: {
      ...state.ball,
      x: ballPosition.x,
      y: ballPosition.y,
      angle: ballBody.GetAngle(),
    },
    angle,
    angularVelocity,
  }
}

export async function newPhysics(state: GameState) {
  const box2d = await Box2DFactory()

  const { b2BodyDef, b2_dynamicBody, b2PolygonShape, b2Vec2, b2World } = box2d

  const gravity = new box2d.b2Vec2(0, 0)
  const world = new b2World(gravity)

  let ballBody: Box2D.b2Body

  {
    const circle = new box2d.b2CircleShape()
    circle.set_m_radius(state.ball.r)
    const bd = new b2BodyDef()
    bd.set_type(b2_dynamicBody)
    console.log(state.ball)
    bd.position.Set(state.ball.x, state.ball.y)

    ballBody = world.CreateBody(bd)
    ballBody.CreateFixture(circle, 10)
  }

  state.boxes.forEach((box) => {
    let def: Box2D.b2BodyDef = new box2d.b2BodyDef()

    const halfSize = box.size / 2
    def.position.Set(box.x + halfSize, box.y + halfSize)

    def.set_type(box2d.b2_kinematicBody)
    const shape = new b2PolygonShape()
    shape.SetAsBox(halfSize, halfSize)

    let body: Box2D.b2Body = world.CreateBody(def)
    body.CreateFixture(shape, 0)
  })

  // for (let { x, y } of [
  //   {
  //     x: -5,
  //     y: 50,
  //   },
  //   {
  //     x: 105,
  //     y: 50,
  //   },
  // ]) {
  //   const bd = new box2d.b2BodyDef()
  //   bd.position.Set(x, y)
  //   const body = world.CreateBody(bd)
  //   const shape = new b2PolygonShape()
  //   shape.SetAsBox(5, 50)
  //   body.CreateFixture(shape, 1)
  // }
  // {
  //   const bd = new box2d.b2BodyDef()
  //   bd.position.Set(50, -5)
  //   const body = world.CreateBody(bd)
  //   const shape = new b2PolygonShape()
  //   shape.SetAsBox(50, 5)
  //   body.CreateFixture(shape, 1)
  // }

  return {
    update: ({
      delta,
      size,
      input,
      state,
    }: {
      delta: number
      size: { w: number; h: number }
      input: Input
      state: GameState
    }) => {
      return updatePhysics({
        box2d,
        world,
        ballBody,
        state,
        delta,
        size,
        input,
      })
    },
  }
}
