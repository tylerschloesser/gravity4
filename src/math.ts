import { Vec2 } from './types'

export const vec2 = (x: number = 0, y: number = 0) => <Vec2>{ x, y }

export const rotateVec2 = ({ x, y }: Vec2, theta: number) =>
  vec2(
    Math.cos(theta) * x - Math.sin(theta) * y,
    Math.sin(theta) * x + Math.cos(theta) * y
  )

export const normalizeVec2 = ({ x, y }: Vec2) => {
  const dist = Math.sqrt(x * x + y * y)
  return vec2(x / dist, y / dist)
}

export const scaleVec2 = ({ x, y }: Vec2, scalar: number) =>
  vec2(x * scalar, y * scalar)
