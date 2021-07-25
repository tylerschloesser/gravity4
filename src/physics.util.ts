import { Drag } from './types'

export function isVyMax(drag: Drag | null) {
  if (!drag) {
    return false
  }
  return Math.abs(drag.v.y) > Math.abs(drag.v.x)
}
