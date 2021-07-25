import { fromEvent, Observable } from 'rxjs'
import { distinctUntilChanged } from 'rxjs/operators'
import { newGame } from './game'
import { newInput } from './input'
import { vec2 } from './math'
import { CanvasSize } from './types'

async function main() {
  const canvas = document.querySelector<HTMLCanvasElement>('canvas')!
  const context = canvas.getContext('2d')!

  const size$ = new Observable<CanvasSize>((subscriber) => {
    new ResizeObserver((entries) => {
      const {
        contentRect: { width: w, height: h },
      } = entries[0]
      canvas.width = w
      canvas.height = h
      subscriber.next(vec2(w, h))
    }).observe(canvas)
  })

  fromEvent<PointerEvent>(document, 'touchmove', {
    passive: false,
  }).subscribe((e) => {
    // disable bounce on iOS (passive: false is required)
    e.preventDefault()
  })

  const input$ = await newInput(size$)

  await newGame({
    context,
    size$,
    input$,
  })

  console.log('game over')
}

try {
  main()
} catch (e) {
  console.error(e)
}
