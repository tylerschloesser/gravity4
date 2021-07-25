import Box2DFactory from 'box2d-wasm'
import { vec2 } from './math'
import { updateCamera } from './physics.camera'
import { isVyMax } from './physics.util'
import { GameState, Input } from './types'
import { isCircleHit } from './util'

function updatePhysics({
  box2d,
  world,
  ballBody,
  state,
  delta,
  input,
}: {
  box2d: typeof Box2D & EmscriptenModule
  world: Box2D.b2World
  ballBody: Box2D.b2Body
  state: GameState
  delta: number
  input: Input
}): GameState {
  const camera = updateCamera({
    delta,
    input,
    state,
  })
  const grav = new box2d.b2Vec2(
    -1 * Math.sin(camera.angle),
    Math.cos(camera.angle)
  )

  let { speed } = state
  const { drag } = input

  if (isVyMax(drag)) {
    const { v } = input.drag!
    speed += v.y * (delta / 1000) * -1 * 2
    speed = Math.max(Math.min(speed, 1), 0)
  }

  let gravScale = 200
  let maxVel = (gravScale / 3) * speed
  if (state.circles.some((circle) => isCircleHit(state, circle))) {
    gravScale *= 2
    maxVel *= 2
  }

  grav.Normalize()
  grav.op_mul(gravScale * -1)

  grav.op_mul(ballBody.GetMass())
  ballBody.ApplyForce(grav, ballBody.GetPosition(), true)

  if (ballBody.GetLinearVelocity().Length() > maxVel) {
    // decelerate
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
  const ballVelocity = ballBody.GetLinearVelocity()

  return {
    ...state,
    speed,
    ball: {
      ...state.ball,
      p: vec2(ballPosition.x, ballPosition.y),
      v: vec2(ballVelocity.x, ballVelocity.y),
      angle: ballBody.GetAngle(),
    },
    camera,
  }
}

export async function newPhysics(state: GameState) {
  const box2d = await Box2DFactory()

  const { b2BodyDef, b2_dynamicBody, b2PolygonShape, b2World } = box2d

  const gravity = new box2d.b2Vec2(0, 0)
  const world = new b2World(gravity)

  let ballBody: Box2D.b2Body

  {
    const circle = new box2d.b2CircleShape()
    circle.set_m_radius(state.ball.r)
    const bd = new b2BodyDef()
    bd.set_type(b2_dynamicBody)
    bd.position.Set(state.ball.p.x, state.ball.p.y)

    ballBody = world.CreateBody(bd)
    ballBody.CreateFixture(circle, 10)
  }

  state.boxes.forEach((box) => {
    let def: Box2D.b2BodyDef = new box2d.b2BodyDef()

    const halfSize = box.size / 2
    def.position.Set(box.p.x + halfSize, box.p.y + halfSize)

    def.set_type(box2d.b2_kinematicBody)
    const shape = new b2PolygonShape()
    shape.SetAsBox(halfSize, halfSize)

    let body: Box2D.b2Body = world.CreateBody(def)
    body.CreateFixture(shape, 0)
  })

  return {
    update: ({
      delta,
      input,
      state,
    }: {
      delta: number
      input: Input
      state: GameState
    }) => {
      return updatePhysics({
        box2d,
        world,
        ballBody,
        state,
        delta,
        input,
      })
    },
  }
}
