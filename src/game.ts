
interface Game {

}

interface InitGame {
  w: number
  h: number
  context: CanvasRenderingContext2D
}

export function newGame({ context, w, h }: InitGame): Game {

  context.fillStyle = '#444'
  context.fillRect(0, 0, w, h)

  return {}
}
