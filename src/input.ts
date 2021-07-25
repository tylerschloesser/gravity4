import { combineLatest, fromEvent, merge, Observable, of, timer } from 'rxjs'
import {
  map,
  mapTo,
  scan,
  startWith,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators'
import { vec2 } from './math'
import { CanvasSize, Drag, Input } from './types'

interface Pointer {
  x: number
  y: number
  down: boolean
  time: number
  type: Event['type']
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

  // time window (in ms) to capture pointer events
  const slide$ = of(100)

  // size$ is only here so that we guarantee that size$ has
  // emitted an event which will be used later on via withLatestFrom
  return combineLatest([pointer$, key$, size$]).pipe(
    map(([pointer, key]) =>
      pointer
        ? {
            ...pointer,
            down: pointer.down || key,
          }
        : null
    ),

    // clear input after 100ms of inactivity, otherwise if you
    // swipe and hold, drag will remain despite input not changing.
    //
    // TODO there's probably a cleaner rxjs way to do this
    //
    switchMap((value) => merge(of(value), timer(100).pipe(mapTo(null)))),

    withLatestFrom(slide$),
    scan<[Pointer | null, number], Pointer[]>((acc, [next, slide]) => {
      const now = performance.now()
      return [...(next ? [next] : []), ...acc].filter(
        ({ time }) => time > now - slide
      )
    }, []),
    withLatestFrom(size$),
    map(([buffer, size]) => {
      const next: Pointer | null = buffer[0] ?? null
      const last: Pointer | null = buffer[buffer.length - 1] ?? null
      let drag: Drag = { v: vec2() }

      // TODO events between next and last are not necessarily all down events

      if (!last || !last.down || !next?.down) {
        return {
          blah: null,
          down: next?.down ?? false,
          drag,
        }
      }
      if (!next) {
        return { down: false, drag }
      }
      let dx = next.x - last.x
      let dy = next.y - last.y

      let dt = next.time - last.time

      if (dt > 0) {
        // relative dx/dy
        //
        const rdx = dx / Math.min(size.w, size.h)
        const rdy = dy / Math.min(size.w, size.h)

        const vx = rdx / (dt / 1000)
        const vy = rdy / (dt / 1000)

        drag = { v: vec2(vx, vy) }
      }

      return <Input>{
        down: next.down,
        drag,
      }
    })
  )
}
