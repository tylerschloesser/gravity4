import * as _ from 'lodash/fp'
import { Vec2 } from './types'

export const vec2 = (x: number = 0, y: number = 0) => <Vec2>{ x, y }

vec2.rotate = _.curry((theta: number, { x, y }: Vec2) =>
  vec2(
    Math.cos(theta) * x - Math.sin(theta) * y,
    Math.sin(theta) * x + Math.cos(theta) * y
  )
)

vec2.normalize = ({ x, y }: Vec2) => {
  const dist = Math.sqrt(x * x + y * y)
  return vec2(x / dist, y / dist)
}

vec2.scale = _.curry((scalar: number, { x, y }: Vec2) =>
  vec2(x * scalar, y * scalar)
)
