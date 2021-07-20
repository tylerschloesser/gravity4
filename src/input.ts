import { combineLatest, fromEvent, merge, Observable } from 'rxjs'
import {
  map,
  mapTo,
  scan,
  startWith,
  tap,
  withLatestFrom,
} from 'rxjs/operators'
import { CanvasSize, Input } from './types'

interface Pointer {
  x: number
  y: number
  down: boolean
  time: number
}

export async function newInput(
  size$: Observable<CanvasSize>
): Promise<Observable<Input>> {
  const pointer$ = merge(
    merge(fromEvent<PointerEvent>(window, 'pointerleave')).pipe(mapTo(null)),
    merge(
      fromEvent<PointerEvent>(window, 'pointerup'),
      fromEvent<PointerEvent>(window, 'pointermove'),
      fromEvent<PointerEvent>(window, 'pointerdown'),
      fromEvent<PointerEvent>(window, 'pointerenter')
    ).pipe(
      map((e) => {
        let down = e.pressure > 0
        switch (e.type) {
          case 'pointerup':
            down = false
            break
          case 'pointerdown':
            down = true
            break
        }
        return {
          x: e.offsetX,
          y: e.offsetY,
          down,
          time: e.timeStamp,
          type: e.type, // for debugging
        }
      })
    )
  ).pipe(startWith<Pointer | null>(null))

  const key$ = merge(
    fromEvent<KeyboardEvent>(window, 'keydown').pipe(
      map(({ key }) => ({ key, down: true }))
    ),
    fromEvent<KeyboardEvent>(window, 'keyup').pipe(
      map(({ key }) => ({ key, down: false }))
    )
  ).pipe(
    scan((acc, { key, down }) => {
      if (key === ' ') {
        return down
      }
      return acc
    }, false),
    startWith(false)
  )

  return combineLatest([pointer$, key$]).pipe(
    tap(([pointer, key]) => {
      //console.log(pointer, key)
    }),
    map(([pointer, key]) =>
      pointer
        ? {
            ...pointer,
            down: pointer.down || key,
          }
        : null
    ),
    scan<Pointer | null, Pointer[]>((acc, next) => {
      const now = performance.now()
      return [...(next ? [next] : []), ...acc].filter(
        ({ time }) => time > now - 100
      )
    }, []),
    map((buffer) => {
      // TODO smooth this out over a longer period of time
      const next: Pointer | null = buffer[0] ?? null
      //const prev: Pointer | null = buffer[1] ?? null
      const last: Pointer | null = buffer[buffer.length - 1] ?? null

      if (!last || !last.down || !next?.down) {
        return {
          pos: next,
          down: next?.down ?? false,
          drag: null,
          drag2: null,
        }
      }
      if (!next) {
        return { pos: null, down: false, drag: null, drag2: null }
      }
      let dx = next.x - last.x
      let dy = next.y - last.y

      let dt = next.time - last.time
      const correction = ((100 - dt) / 100) * dx
      let drag2 = {
        dx: Math.round(dx + correction),
        correction,
        time: next.time,
      }

      dt = dt / 1000

      let drag = null
      // dt might be 0, not sure why though
      if (dt > 0) {
        drag = { x: dx / dt, y: dy / dt }
      }

      return {
        pos: next,
        down: next.down,
        drag,
        drag2,
      }
    })
  )
}
