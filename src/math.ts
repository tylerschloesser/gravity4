import * as _ from 'lodash/fp'
import { Vec2 } from './types'

export const vec2 = (x: number = 0, y: number = 0) => <Vec2>{ x, y }

vec2.rotate = _.curry((theta: number, { x, y }: Vec2) =>
  vec2(
    Math.cos(theta) * x - Math.sin(theta) * y,
    Math.sin(theta) * x + Math.cos(theta) * y
  )
)

vec2.normalize = (v: Vec2) => {
  const dist = vec2.dist(v)
  return vec2(v.x / dist, v.y / dist)
}

vec2.scale = _.curry((scalar: number, { x, y }: Vec2) =>
  vec2(x * scalar, y * scalar)
)

vec2.dist = ({ x, y }: Vec2) => Math.sqrt(x * x + y * y)

vec2.copy = ({ x, y }: Vec2) => vec2(x, y)

// TODO refactor this so it can be curried
vec2.add = (a: Vec2, b: Vec2) => vec2(a.x + b.x, a.y + b.y)

vec2.sub = _.curry((b: Vec2, a: Vec2) => vec2(a.x - b.x, a.y - b.y))
