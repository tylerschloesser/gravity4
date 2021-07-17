import { combineLatest, fromEvent, merge, Observable } from 'rxjs'
import { map, mapTo, scan, startWith, tap } from 'rxjs/operators'
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
      return [...acc, ...(next ? [next] : [])].filter(
        ({ time }) => time > now - 100
      )
    }, []),
    tap((buffer) => {
      //console.log(buffer)
    }),
    map((buffer) => {
      const first = buffer.length > 0 ? buffer[0] : null
      const last = buffer.length > 0 ? buffer[buffer.length - 1] : null

      if (!first || !first.down || !last?.down) {
        return {
          pos: last,
          down: last?.down ?? false,
          drag: null,
        }
      }
      if (!last) {
        return { pos: null, down: false, drag: null }
      }
      let dx = last.x - first.x
      let dy = last.y - first.y
      let dt = (last.time - first.time) / 1000 // per second

      let drag = null
      // dt might be 0, not sure why though
      if (dt > 0) {
        drag = { x: dx / dt, y: dy / dt }
      }

      return {
        pos: last,
        down: last.down,
        drag,
      }
    })
  )
}
