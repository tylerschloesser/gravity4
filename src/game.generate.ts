import { vec2 } from './math'
import { Ball, Circle, GameState } from './types'

export async function initBoxes() {
  const boxes: GameState['boxes'] = []

  // const GRID_SIZE = 1
  // const GAP = 60
  // const BOX_SIZE = 30
  // const GRID_CENTER = { x: (100 - BOX_SIZE) / 2, y: -65 }
  // for (let i = Math.ceil(GRID_SIZE / -2); i < Math.ceil(GRID_SIZE / 2); i++) {
  //   for (let j = Math.ceil(GRID_SIZE / -2); j < Math.ceil(GRID_SIZE / 2); j++) {
  //     boxes.push({
  //       p: vec2(
  //         i * BOX_SIZE + i * GAP + GRID_CENTER.x,
  //         j * BOX_SIZE + j * GAP + GRID_CENTER.y
  //       ),
  //       size: BOX_SIZE,
  //     })
  //   }
  // }
  return boxes
}

export async function initCircles() {
  const circles: Circle[] = [
    // {
    //   p: vec2(),
    //   r: 55,
    // },
  ]

  const GRID_SIZE = 5
  const GAP = 10
  const RADIUS = 55
  for (let i = Math.ceil(GRID_SIZE / -2); i < Math.ceil(GRID_SIZE / 2); i++) {
    for (let j = Math.ceil(GRID_SIZE / -2); j < Math.ceil(GRID_SIZE / 2); j++) {
      circles.push({
        p: vec2(i * RADIUS * 2 + i * GAP, j * RADIUS * 2 + j * GAP),
        r: RADIUS,
      })
    }
  }

  return circles
}

export async function initBall() {
  return <Ball>{ p: vec2(), v: vec2(), r: 7, angle: 0 }
}
