import { combineLatest, fromEvent, merge, Observable } from 'rxjs'
import { map, mapTo, mergeWith, startWith } from 'rxjs/operators'
import { newGame, CanvasSize } from './game'

function main() {
  const canvas = document.querySelector<HTMLCanvasElement>('canvas')!
  const context = canvas.getContext('2d')!

  const resize$ = new Observable<CanvasSize>((subscriber) => {
    new ResizeObserver((entries) => {
      const {
        contentRect: { width: w, height: h },
      } = entries[0]
      canvas.width = w
      canvas.height = h
      subscriber.next({ w, h })
    }).observe(canvas)
  })

  const pointer$ = merge(
    fromEvent<PointerEvent>(canvas, 'pointerleave').pipe(mapTo(null)),
    merge(
      fromEvent<PointerEvent>(canvas, 'pointermove'),
      fromEvent<PointerEvent>(canvas, 'pointerup'),
      fromEvent<PointerEvent>(canvas, 'pointerdown'),
      fromEvent<PointerEvent>(canvas, 'pointerenter')
    ).pipe(
      map(({ offsetX: x, offsetY: y, pressure }) => ({
        x,
        y,
        down: pressure > 0,
      }))
    )
  ).pipe(startWith(null))

  newGame({
    context,
    resize$,
    pointer$,
  })
}

try {
  main()
} catch (e) {
  console.error(e)
}
