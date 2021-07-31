import { vec2 } from './math'
import { computeGravity } from './physics'
import { Vec2 } from './types'

declare global {
  namespace jest {
    interface Matchers<R> {
      toEqualVec2(actual: Vec2): R
    }
  }
}

// TODO move this
expect.extend({
  toEqualVec2(received: Vec2, actual: Vec2) {
    if (
      Math.abs(received.x - actual.x) < Number.EPSILON &&
      Math.abs(received.y - actual.y) < Number.EPSILON
    ) {
      return {
        message: () =>
          `expected ${vec2.toString(received)} not to equal ${vec2.toString(
            actual
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

describe('physics', () => {
  describe('computeGravity', () => {
    const testCases = [
      {
        cameraAngle: 0,
        scale: 1,
        expected: vec2(-0, -1),
      },
      {
        cameraAngle: 0,
        scale: 2,
        expected: vec2(-0, -2),
      },
      {
        cameraAngle: Math.PI,
        scale: 1,
        expected: vec2(-0, 1),
      },
    ]

    testCases.forEach(({ cameraAngle, scale, expected }) => {
      const args = { cameraAngle, scale }
      it(`returns ${vec2.toString(expected)} given ${JSON.stringify(
        args
      )}`, () => {
        expect(computeGravity(args)).toEqualVec2(expected)
      })
    })
  })
})
