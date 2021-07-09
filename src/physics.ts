import Matter from 'matter-js'
import { Engine, Bodies, Composite, World, Constraint, Body } from 'matter-js'

export interface GameState {
  ball: { x: number; y: number; r: number; angle: number }
  platform: { x: number; y: number; size: number; angle: number }
}

export function newPhysics(state: GameState) {
  const engine = Engine.create()
  engine.gravity = {
    x: 0,
    y: 3,
    scale: 1 / 1000 / 10,
  }
  // engine.gravity = {
  //   x: 0,
  //   y: 0,
  //   scale: 1,
  // }

  const { ball, platform } = state

  const ballBody = Bodies.circle(ball.x, ball.y, ball.r, {
    density: 1,
    friction: 0,
    frictionAir: 0,
    frictionStatic: 0,
    restitution: 0,
    //force: { y: 0.1, x: 0 },
  })
  const platformBody = Bodies.rectangle(
    platform.x + platform.size / 2,
    platform.y + platform.size / 2,
    platform.size,
    platform.size,
    {
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0,
      angle: platform.angle,
      isStatic: true,
    }
  )

  Composite.add(engine.world, ballBody)
  Composite.add(engine.world, platformBody)

  const sideProps: Matter.IChamferableBodyDefinition = {
    isStatic: true,
    friction: 0,
    frictionAir: 0,
    frictionStatic: 0,
  }

  // top
  Composite.add(engine.world, Bodies.rectangle(50, -5, 120, 10, sideProps))
  // right
  Composite.add(engine.world, Bodies.rectangle(105, 50, 10, 120, sideProps))
  // left
  Composite.add(engine.world, Bodies.rectangle(-5, 50, 10, 120, sideProps))
  // bottom
  Composite.add(engine.world, Bodies.rectangle(50, 105, 120, 10, sideProps))

  return {
    update: ({
      delta,
      drag,
      size,
    }: {
      delta: number
      drag: { x: number; y: number } | null
      size: { w: number; h: number }
    }) => {
      if (drag) {
        const dx = drag.x / size.w
        Body.rotate(platformBody, 5 * dx * (Math.PI / 180) * delta)
        Body.setAngularVelocity(platformBody, 5 * dx * (Math.PI / 180) * delta)
      }

      Matter.Body.setAngularVelocity(ballBody, 0)
      Engine.update(engine, delta)
      return {
        ball: {
          ...state.ball,
          x: ballBody.position.x,
          y: ballBody.position.y,
          angle: ballBody.angle,
        },
        platform: {
          ...state.platform,
          x: platformBody.position.x - platform.size / 2,
          y: platformBody.position.y - platform.size / 2,
          angle: platformBody.angle,
        },
      } as GameState
    },
  }
}
