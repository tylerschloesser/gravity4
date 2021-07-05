import { Observable } from 'rxjs'
import { newGame, ResizeEvent } from './game'

function main() {
  const canvas = document.querySelector<HTMLCanvasElement>('canvas')!
  const context = canvas.getContext('2d')!

  const resize$ = new Observable<ResizeEvent>((subscriber) => {
    new ResizeObserver((entries) => {
      const {
        contentRect: { width: w, height: h },
      } = entries[0]
      canvas.width = w
      canvas.height = h
      subscriber.next({ w, h })
    }).observe(canvas)
  })

  newGame({
    context,
    resize$,
  })
}

try {
  main()
} catch (e) {
  console.error(e)
}
