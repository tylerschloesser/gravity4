import { vec2 } from './math'
import { computeGravity } from './physics'

describe('physics', () => {
  describe('computeGravity', () => {
    const testCases = [
      {
        cameraAngle: 0,
        scale: 1,
        expected: vec2(-0, -1),
      },
    ]

    testCases.forEach(({ cameraAngle, scale, expected }) => {
      const args = { cameraAngle, scale }
      it(`returns ${vec2.toString(expected)} given ${JSON.stringify(args)}`, () => {
        expect(computeGravity(args)).toEqual(expected)
      })
    })
  })
})
