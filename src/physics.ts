import Matter from 'matter-js'
import { Engine, Bodies, Composite, World, Constraint, Body } from 'matter-js'

import Box2DFactory from 'box2d-wasm'

export interface GameState {
  ball: { x: number; y: number; r: number; angle: number }
  platform: { x: number; y: number; size: number; angle: number }
}

async function newPhysicsMatterJs(state: GameState) {
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

async function newPhysicsBox2d(state: GameState) {
  const box2d = await Box2DFactory()
  console.log(box2d)

  const { b2BodyDef, b2_dynamicBody, b2PolygonShape, b2Vec2, b2World } = box2d

  // in metres per second squared
  const gravity = new b2Vec2(0, 10)
  const world = new b2World(gravity)

  const sideLengthMetres = 1
  const square = new b2PolygonShape()
  square.SetAsBox(sideLengthMetres / 2, sideLengthMetres / 2)

  const zero = new b2Vec2(0, 0)

  const bd = new b2BodyDef()
  bd.set_type(b2_dynamicBody)
  bd.set_position(zero)

  const body = world.CreateBody(bd)
  body.CreateFixture(square, 1)
  body.SetTransform(zero, 0)
  body.SetLinearVelocity(zero)
  body.SetAwake(true)
  body.SetEnabled(true)

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
      world.Step(delta / 1000, 1, 1)

      const { x, y } = body.GetPosition()
      return {
        ...state,
        ball: {
          ...state.ball,
          x,
          y,
        },
      }
    },
  }
}

//export const newPhysics = newPhysicsMatterJs
export const newPhysics = newPhysicsBox2d
