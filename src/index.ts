import { fromEvent, Observable } from 'rxjs'
import { newGame } from './game'
import { newInput } from './input'
import { vec2 } from './math'
import { Viewport } from './types'

async function main() {
  const canvas = document.querySelector<HTMLCanvasElement>('canvas')!
  const context = canvas.getContext('2d')!

  const viewport$ = new Observable<Viewport>((subscriber) => {
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

  const input$ = await newInput(viewport$)

  await newGame({
    context,
    viewport$,
    input$,
  })

  console.log('game over')
}

try {
  main()
} catch (e) {
  console.error(e)
}
