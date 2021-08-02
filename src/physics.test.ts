import { vec2 } from './math'
import { computeDampen, computeGravity, computeHitAngle } from './physics'

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

    testCases.forEach(({ expected, ...args }) => {
      const expectedStr = vec2.toString(expected)
      const argsStr = JSON.stringify(args)
      it(`returns ${expectedStr} given ${argsStr}`, () => {
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
      {
        ballVelocity: vec2(0, 2),
        dampenSpeed: 1,
        maxSpeed: 1,
        expected: vec2(0, -1),
      },
      {
        ballVelocity: vec2(4, 0),
        dampenSpeed: 2,
        maxSpeed: 3,
        expected: vec2(-2, 0),
      },
    ]

    testCases.forEach(({ expected, ...args }) => {
      const expectedStr = vec2.toString(expected)
      const argsStr = JSON.stringify(args)
      it(`returns ${expectedStr} given ${argsStr}`, () => {
        expect(computeDampen(args)).toEqualVec2(expected)
      })
    })
  })

  describe('computeHitAngle', () => {
    const testCases = [
      // TODO figure out what to do here
      {
        circlePosition: vec2(0, 1),
        ballPosition: vec2(0, 1),
        expected: NaN,
      },
    ]

    testCases.forEach(({ expected, ...args }) => {
      const expectedStr = expected.toString()
      const argsStr = JSON.stringify(args)
      it(`returns ${expectedStr} given ${argsStr}`, () => {
        expect(computeHitAngle(args)).toEqual(expected)
      })
    })
  })
})
