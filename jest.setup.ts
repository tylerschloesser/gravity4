import { vec2 } from './src/math'
import { Vec2 } from './src/types'

declare global {
  namespace jest {
    interface Matchers<R> {
      toEqualVec2(actual: Vec2): R
    }
  }
}

expect.extend({
  toEqualVec2(received: Vec2, actual: Vec2) {
    if (
      Math.abs(received.x - actual.x) < Number.EPSILON &&
      Math.abs(received.y - actual.y) < Number.EPSILON
    ) {
      return {
        message: () =>
          `expected ${vec2.toString(received)} not to equal ${vec2.toString(
            actual,
          )}`,
        pass: true,
      }
    }
    return {
      message: () =>
        `expected ${vec2.toString(received)} to equal ${vec2.toString(actual)}`,
      pass: false,
    }
  },
})
