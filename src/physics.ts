import * as _ from 'lodash/fp'
import { vec2 } from './math'
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

  let { speed } = state
  const { drag } = input

  if (isVyMax(drag)) {
    const { v } = input.drag!
    speed += v.y * (delta / 1000) * -1 * 2
    speed = Math.max(Math.min(speed, 1), 0)
  }

  let gravScale = 200
  let vmax = (gravScale / 3) * speed
  if (state.circles.some((circle) => isCircleHit(state, circle))) {
    gravScale *= 2
    vmax *= 2
  }

  const grav = _.pipe(
    vec2.rotate(camera.angle),
    vec2.scale(gravScale * -1 * ballBody.GetMass())
  )(vec2(0, 1))


  let dampen = vec2()
  let v = vec2(ballBody.GetLinearVelocity().x, ballBody.GetLinearVelocity().y)
  if (vec2.dist(v) > vmax) {
    dampen = _.pipe(
      vec2.normalize,
      vec2.scale(vec2.dist(grav) * 1.2),
      vec2.scale(-1),
    )(v)
  }

  const force = vec2.add(grav, dampen)
  ballBody.ApplyForce(
    new box2d.b2Vec2(force.x, force.y),
    ballBody.GetPosition(),
    true,
  )

  const velocityIterations = 10
  const positionIterations = 10
  world.Step(delta / 1000, velocityIterations, positionIterations)

  const ballPosition = ballBody.GetPosition()

  return {
    ...state,
    speed,
    ball: {
      ...state.ball,
      p: vec2(ballPosition.x, ballPosition.y),
      v,
      angle: ballBody.GetAngle(),
    },
    camera,
  }
}
