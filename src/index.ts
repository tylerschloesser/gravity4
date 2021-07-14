import {fromEvent, merge, Observable} from 'rxjs'
import {map, mapTo, startWith} from 'rxjs/operators'
import {newGame} from './game'
import {CanvasSize, Key} from './types'
import { newInput } from './input'

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
      subscriber.next({ w, h })
    }).observe(canvas)
  })

  fromEvent<PointerEvent>(document, 'touchmove', {
    passive: false,
  }).subscribe((e) => {
    // disable bounce on iOS (passive: false is required)
    e.preventDefault()
  })

  const key$: Observable<Key> = merge(
    fromEvent<KeyboardEvent>(window, 'keydown').pipe(
      map(({ key }) => ({ key, down: true }))
    ),
    fromEvent<KeyboardEvent>(window, 'keyup').pipe(
      map(({ key }) => ({ key, down: false }))
    )
  ).pipe(startWith({ key: ' ', down: false }))

  key$.subscribe((v) => console.log(v))

  const input$ = await newInput()

  await newGame({
    context,
    size$,
    input$,
    key$,
  })

  console.log('game over')
}

try {
  main()
} catch (e) {
  console.error(e)
}
