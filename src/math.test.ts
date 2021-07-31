import { vec2 } from './math'

describe('math', () => {
  describe('vec2', () => {
    it('returns default vec2', () => {
      expect(vec2()).toEqualVec2({ x: 0, y: 0 })
    })
    it('returns vec2', () => {
      expect(vec2(1, 2)).toEqualVec2({ x: 1, y: 2 })
    })
  })

  describe('vec2.rotate', () => {
    const v = vec2(0, 1)
    it('rotates by 0 degrees', () => {
      expect(vec2.rotate(0)(v)).toEqualVec2(v)
    })

    it('rotates by 90 degrees', () => {
      expect(vec2.rotate(Math.PI / 2)(v)).toEqualVec2(vec2(-1, 0))
    })

    it('rotates by -90 degrees', () => {
      expect(vec2.rotate(-Math.PI / 2)(v)).toEqualVec2(vec2(1, 0))
    })

    it('rotates by 180 degrees', () => {
      expect(vec2.rotate(Math.PI)(v)).toEqualVec2(vec2(0, -1))
    })

    it("doesn't affect length", () => {
      const scaled = vec2.scale(2, v)
      expect(vec2.rotate(0)(scaled)).toEqualVec2(scaled)
    })
  })

  describe('vec2.normalize', () => {
    it('normalizes', () => {
      expect(vec2.normalize(vec2(0, 2))).toEqualVec2(vec2(0, 1))
    })

    it('normalizes another', () => {
      expect(vec2.normalize(vec2(-100, 0))).toEqualVec2(vec2(-1, 0))
    })
  })

  describe('vec2.scale', () => {})
})
