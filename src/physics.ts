import * as _ from 'lodash/fp'
import { vec2 } from './math'
import { updateCamera } from './physics.camera'
import { SCALE } from './physics.constants'
import { isVyMax } from './physics.util'
import { GameState, PhysicsUpdateFnArgs, Vec2 } from './types'
import { isCircleHit } from './util'

interface UpdatePhysicsArgs extends PhysicsUpdateFnArgs {
  box2d: typeof Box2D & EmscriptenModule
  world: Box2D.b2World
  ballBody: Box2D.b2Body
}

export const computeGravity = ({
  cameraAngle,
  scale,
}: {
  cameraAngle: number
  scale: number
}) =>
  _.pipe(
    vec2.rotate(cameraAngle),
    // more rotation when in hit zone
    // vec2.rotate(
    //   hitAngle ? (camera.angle - hitAngle) * Math.min(Math.abs(drag.v.x), 1) : 0
    // ),
    vec2.scale(scale),
    vec2.scale(-1),
  )(vec2(0, 1))

export const computeDampen = ({
  ballVelocity,
  dampenSpeed,
  maxSpeed,
}: {
  ballVelocity: Vec2
  dampenSpeed: number
  maxSpeed: number
}) => {
  const ballSpeed = vec2.dist(ballVelocity)
  if (ballSpeed <= maxSpeed) {
    return vec2()
  }
  return _.pipe(
    vec2.normalize,
    vec2.scale(dampenSpeed),
    vec2.scale(-1),
  )(ballVelocity)
}

export const computeHitAngle = ({
  circlePosition,
  ballPosition,
}: {
  circlePosition: Vec2
  ballPosition: Vec2
}) =>
  _.pipe(vec2.sub(ballPosition), vec2.normalize, ({ x, y }) =>
    Math.atan2(y, x),
  )(circlePosition)

export function updatePhysics({
  box2d,
  world,
  ballBody,
  state,
  delta,
  input,
}: UpdatePhysicsArgs): GameState {
  const camera = updateCamera({
    delta,
    input,
    state,
  })

  let { speed } = state
  const { drag } = input

  if (isVyMax(drag)) {
    const { v } = input.drag
    speed += (v.y * -1) / 20
    speed = Math.max(Math.min(speed, 1), 0)
  }

  let gravScale = 1000 * SCALE
  let vmax = 50 * SCALE
  const hit = state.circles.find((circle) => isCircleHit(state, circle))
  if (hit) {
    gravScale /= 2
    vmax = Number.POSITIVE_INFINITY
  }

  const hitAngle = hit
    ? computeHitAngle({
        circlePosition: hit.p,
        ballPosition: state.ball.p,
      })
    : null

  // TODO unit test this ffs
  const gravity = computeGravity({
    cameraAngle: camera.angle,
    scale: gravScale,
  })

  let v = vec2(ballBody.GetLinearVelocity().x, ballBody.GetLinearVelocity().y)
  let dampen = computeDampen({
    ballVelocity: v,
    dampenSpeed: vec2.dist(gravity) * 1.2,
    maxSpeed: vmax,
  })

  const force = vec2.add(gravity, dampen)
  ballBody.ApplyForceToCenter(new box2d.b2Vec2(force.x, force.y), true)

  const velocityIterations = 8
  const positionIterations = 3
  world.Step((delta / 1000) * speed, velocityIterations, positionIterations)

  const ballPosition = ballBody.GetPosition()
  const ballVelocity = ballBody.GetLinearVelocity()

  return {
    ...state,
    speed,
    gravity,
    ball: {
      ...state.ball,
      p: vec2(ballPosition.x / SCALE, ballPosition.y / SCALE),
      v: vec2(ballVelocity.x / SCALE, ballVelocity.y / SCALE),
      angle: ballBody.GetAngle(),
    },
    camera,
    debug: {
      force,
    },
  }
}
