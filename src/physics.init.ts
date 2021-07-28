import Box2DFactory from 'box2d-wasm'
import { updatePhysics } from './physics'
import { SCALE } from './physics.constants'
import { GameState, Physics } from './types'

export async function initPhysics(state: GameState) {
  const box2d = await Box2DFactory()

  const { b2BodyDef, b2_dynamicBody, b2PolygonShape, b2World } = box2d

  const gravity = new box2d.b2Vec2(0, 0)
  const world = new b2World(gravity)

  let ballBody: Box2D.b2Body

  {
    const circle = new box2d.b2CircleShape()
    circle.set_m_radius(state.ball.r * SCALE)
    const bd = new b2BodyDef()
    bd.set_type(b2_dynamicBody)
    bd.position.Set(state.ball.p.x * SCALE, state.ball.p.y * SCALE)

    ballBody = world.CreateBody(bd)
    ballBody.CreateFixture(circle, 1)
  }

  state.boxes.forEach((box) => {
    let def: Box2D.b2BodyDef = new box2d.b2BodyDef()

    const halfSize = (box.size / 2) * SCALE
    def.position.Set(box.p.x * SCALE + halfSize, box.p.y * SCALE + halfSize)

    def.set_type(box2d.b2_kinematicBody)
    const shape = new b2PolygonShape()
    shape.SetAsBox(halfSize, halfSize)

    let body: Box2D.b2Body = world.CreateBody(def)
    body.CreateFixture(shape, 0)
  })

  return <Physics>{
    update: ({ delta, input, state }) =>
      updatePhysics({
        box2d,
        world,
        ballBody,
        state,
        delta,
        input,
      }),
  }
}
