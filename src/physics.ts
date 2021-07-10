import Box2DFactory from 'box2d-wasm'
import { GameState } from './types'

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

  const velocityIterations = 40
  const positionIterations = 40

  return {
    update: ({
      delta,
      angle,
      size,
    }: {
      delta: number
      angle: number
      size: { w: number; h: number }
    }) => {
      //const grav = new box2d.b2Transform(new b2Vec2(0, 1), angle).p
      const grav = new b2Vec2(-1 * Math.sin(angle), Math.cos(angle))

      //grav.op_sub(ballBody.GetPosition())
      grav.Normalize()
      grav.op_mul(500)

      grav.op_mul(ballBody.GetMass())
      ballBody.ApplyForce(grav, ballBody.GetPosition(), true)

      world.Step(delta / 1000, velocityIterations, positionIterations)

      const ballPosition = ballBody.GetPosition()

      return {
        ...state,
        ball: {
          ...state.ball,
          x: ballPosition.x,
          y: ballPosition.y,
          angle: ballBody.GetAngle(),
        },
      }
    },
  }
}
