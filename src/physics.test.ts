import { vec2 } from './math'
import { computeDampen, computeGravity } from './physics'
import { Vec2 } from './types'

// TODO move this
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
      {
        cameraAngle: Math.PI / 2,
        scale: 1,
        expected: vec2(1, 0),
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

  describe('computeDampen', () => {
    const testCases = [
      {
        ballVelocity: vec2(0, 1),
        dampenSpeed: 1,
        maxSpeed: 1,
        expected: vec2(0, 0),
      },
    ]

    testCases.forEach(({ expected, ...args }) => {
      it(`returns ${vec2.toString(expected)} given ${JSON.stringify(
        args
      )}`, () => {
        expect(computeDampen(args)).toEqualVec2(expected)
      })
    })
  })
})
