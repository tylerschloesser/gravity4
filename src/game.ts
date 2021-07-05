
interface Game {

}

interface InitGame {
  w: number
  h: number
  context: CanvasRenderingContext2D
}

export function newGame(init: InitGame): Game {
  return {}
}
