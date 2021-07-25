import { normalizeVec2, rotateVec2, scaleVec2, vec2 } from './math'
import { updateCamera } from './physics.camera'
import { isVyMax } from './physics.util'
import { GameState, Input } from './types'
import { isCircleHit } from './util'

export function updatePhysics({
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

  let grav = rotateVec2(vec2(0, 1), camera.angle)

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

  grav = normalizeVec2(grav)
  grav = scaleVec2(grav, gravScale * -1 * ballBody.GetMass())

  ballBody.ApplyForce(
    new box2d.b2Vec2(grav.x, grav.y),
    ballBody.GetPosition(),
    true
  )

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
