import { vec2 } from './math'

describe('math', () => {
  describe('vec2', () => {
    it('returns default vec2', () => {
      expect(vec2()).toEqualVec2({ x: 0, y: 0 })
    })
  })
})
