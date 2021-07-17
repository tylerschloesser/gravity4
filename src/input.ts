import { fromEvent, merge, Observable } from 'rxjs'
import { map, mapTo, scan, startWith, withLatestFrom } from 'rxjs/operators'
import { Input } from './types'

interface Pointer {
  x: number
  y: number
  down: boolean
  time: number
}

export async function newInput(): Promise<Observable<Input>> {
  const pointer$ = merge(
    merge(fromEvent<PointerEvent>(window, 'pointerleave')).pipe(mapTo(null)),
    merge(
      fromEvent<PointerEvent>(window, 'pointerup').pipe(
        map((e) => ({
          ...e,
          pressure: 0,
        }))
      ),
      fromEvent<PointerEvent>(window, 'pointermove'),
      fromEvent<PointerEvent>(window, 'pointerdown'),
      fromEvent<PointerEvent>(window, 'pointerenter')
    ).pipe(
      map((e) => ({
        x: e.offsetX,
        y: e.offsetY,
        down: e.pressure > 0,
        time: e.timeStamp,
      }))
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

  return pointer$.pipe(
    withLatestFrom(key$),
    map(([pointer, key]) =>
      pointer
        ? {
            ...pointer,
            down: pointer.down || key,
          }
        : null
    ),
    scan<Pointer | null, { prev: Pointer | null; next: Pointer | null }>(
      (acc, next) => ({
        prev: acc?.next ?? null,
        next,
      }),
      { prev: null, next: null }
    ),
    map(({ prev, next }) => {
      if (!prev || !prev.down || !next?.down) {
        return {
          pos: next,
          down: next?.down ?? false,
          drag: null,
        }
      }
      if (!next) {
        return { pos: null, down: false, drag: null }
      }
      let dx = next.x - prev.x
      let dy = next.y - prev.y
      let dt = (next.time - prev.time) / 1000 // per second

      // TODO i've seen this be 0, but idk how...
      if (dt === 0) {
        dt = 1
        dx = dy = 0
      }

      return {
        pos: next,
        down: next.down,
        drag: { x: dx / dt, y: dy / dt },
      }
    })
  )
}
