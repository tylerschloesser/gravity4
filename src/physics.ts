import * as _ from 'lodash/fp'
import { vec2 } from './math'
import { updateCamera } from './physics.camera'
import { SCALE } from './physics.constants'
import { isDragVyActive } from './physics.util'
import { Ball, Circle, GameState, PhysicsUpdateFnArgs, Vec2 } from './types'

function isCircleHit(ball: Ball, circle: Circle) {
  const { p } = circle
  const dx = p.x - ball.p.x
  const dy = p.y - ball.p.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  return Math.abs(dist - circle.r) < ball.r
}

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
  )(vec2(1, 0))

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

function findCircleHit(state: GameState): Circle | null {
  const { ball } = state
  let cur: Circle | null = null
  let max = 0
  for (let circle of state.circles) {
    if (isCircleHit(ball, circle)) {
      const dist = vec2.dist2(ball.p, circle.p)
      if (dist > max) {
        cur = circle
        max = dist
      }
    }
  }
  return cur
}

export const computeHitAngle = ({
  circlePosition,
  ballPosition,
}: {
  circlePosition: Vec2
  ballPosition: Vec2
}) =>
  _.pipe(vec2.sub(circlePosition), vec2.normalize, ({ x, y }) =>
    Math.atan2(y, x),
  )(ballPosition)

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

  if (isDragVyActive(drag)) {
    const { v } = input.drag
    speed += (v.y * -1) / 20
    speed = Math.max(Math.min(speed, 1), 0)
  }

  let gravScale = 1000 * SCALE
  let vmax = 50 * SCALE
  const hit = findCircleHit(state)
  if (hit) {
    //gravScale /= 2
    vmax *= 4
  }

  let hitAngle = null
  if (hit) {
    hitAngle = computeHitAngle({
      circlePosition: hit.p,
      ballPosition: state.ball.p,
    })
  }

  let gravity = computeGravity({
    cameraAngle: camera.angle,
    scale: gravScale,
  })

  let v = vec2(ballBody.GetLinearVelocity().x, ballBody.GetLinearVelocity().y)
  let dampen = computeDampen({
    ballVelocity: v,
    dampenSpeed: vec2.dist(gravity) * 1.2,
    maxSpeed: vmax,
  })

  if (hit) {
    const pull = _.pipe(
      vec2.sub(hit.p),
      vec2.normalize,
      vec2.scale(-gravScale),
    )(state.ball.p)
    gravity = vec2.add(gravity, pull)
  }

  const force = _.pipe(vec2.add(dampen))(gravity)

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
    circleHitId: hit?.id ?? null,
  }
}
