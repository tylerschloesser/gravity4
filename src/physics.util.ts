import { Drag } from './types'

export function isDragVyActive(drag: Drag | null) {
  if (!drag) {
    return false
  }
  return Math.abs(drag.v.y) > Math.abs(drag.v.x) * 2
}
