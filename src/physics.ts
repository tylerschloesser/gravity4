import Box2DFactory from 'box2d-wasm'
import { GameState } from './types'

export async function newPhysics(state: GameState) {
  const box2d = await Box2DFactory()

  const { b2BodyDef, b2_dynamicBody, b2PolygonShape, b2Vec2, b2World } = box2d

  // in metres per second squared
  const gravity = new b2Vec2(0, 300)
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

  let groundBody: Box2D.b2Body
  let groundBodyDef: Box2D.b2BodyDef
  {
    console.log(state.platform)
    groundBodyDef = new box2d.b2BodyDef()
    const halfSize = state.platform.size / 2
    groundBodyDef.position.Set(
      state.platform.x + halfSize,
      state.platform.y + halfSize
    )

    groundBodyDef.set_type(box2d.b2_kinematicBody)
    groundBody = world.CreateBody(groundBodyDef)
    const groundBox = new b2PolygonShape()
    groundBox.SetAsBox(halfSize, halfSize)
    groundBody.CreateFixture(groundBox, 0)
  }

  for (let { x, y } of [
    {
      x: -5,
      y: 50,
    },
    {
      x: 105,
      y: 50,
    },
  ]) {
    const bd = new box2d.b2BodyDef()
    bd.position.Set(x, y)
    const body = world.CreateBody(bd)
    const shape = new b2PolygonShape()
    shape.SetAsBox(5, 50)
    body.CreateFixture(shape, 1)
  }
  {
    const bd = new box2d.b2BodyDef()
    bd.position.Set(50, -5)
    const body = world.CreateBody(bd)
    const shape = new b2PolygonShape()
    shape.SetAsBox(50, 5)
    body.CreateFixture(shape, 1)
  }

  const velocityIterations = 40
  const positionIterations = 40

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
        const av = 1000 * dx * (Math.PI / 180) * delta
        groundBody.SetAngularVelocity(av)
      }

      world.Step(delta / 1000, velocityIterations, positionIterations)

      const ballPosition = ballBody.GetPosition()
      const platPosition = groundBody.GetPosition()
      const halfSize = state.platform.size / 2

      return {
        ...state,
        ball: {
          ...state.ball,
          x: ballPosition.x,
          y: ballPosition.y,
          angle: ballBody.GetAngle(),
        },
        platform: {
          ...state.platform,
          x: platPosition.x - halfSize,
          y: platPosition.y - halfSize,
          angle: groundBody.GetAngle(),
        },
      }
    },
  }
}
