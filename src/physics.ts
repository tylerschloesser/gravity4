import { Engine, Bodies, Composite, World, Constraint, Body } from 'matter-js'

export interface GameState {
  ball: { x: number; y: number; r: number; angle: number }
  platform: { x: number; y: number; size: number; angle: number }
}

export function newPhysics(state: GameState) {
  const engine = Engine.create()
  engine.gravity = {
    x: 0,
    y: 1,
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
    friction: 0.1,
    //restitution: 1,
    //force: { y: 0.1, x: 0 },
  })
  const platformBody = Bodies.rectangle(
    platform.x + platform.size / 2,
    platform.y + platform.size / 2,
    platform.size,
    platform.size,
    {
      angle: platform.angle,
      isStatic: true,
    }
  )

  Composite.add(engine.world, ballBody)
  Composite.add(engine.world, platformBody)

  return {
    update: ({
      delta,
      pointer,
      size,
    }: {
      delta: number
      pointer: { dx: number; dy: number; down: boolean } | null
      size: { w: number; h: number }
    }) => {
      if (pointer?.down) {
        const dx = pointer.dx / size.w
        Body.rotate(platformBody, 10 * dx * (Math.PI / 180) * delta)
        Body.setAngularVelocity(platformBody, 10 * dx * (Math.PI / 180) * delta)
      }

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
