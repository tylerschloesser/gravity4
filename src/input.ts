import { fromEvent, merge, Observable } from 'rxjs'
import { map, mapTo, scan, startWith, withLatestFrom } from 'rxjs/operators'
import { Input } from './types'

interface Pointer {
  x: number
  y: number
  down: boolean
}

export async function newInput(): Promise<Observable<Input>> {
  const pointer$ = merge(
    fromEvent<PointerEvent>(window, 'pointerleave').pipe(mapTo(null)),
    merge(
      fromEvent<PointerEvent>(window, 'pointermove'),
      fromEvent<PointerEvent>(window, 'pointerup'),
      fromEvent<PointerEvent>(window, 'pointerdown'),
      fromEvent<PointerEvent>(window, 'pointerenter')
    ).pipe(
      map(({ offsetX: x, offsetY: y, pressure }) => ({
        x,
        y,
        down: pressure > 0,
      }))
    )
  ).pipe(
    startWith<Pointer | null>(null),
    scan<Pointer | null, { prev: Pointer | null; next: Pointer | null }>(
      (acc, next) => ({
        prev: acc?.next ?? null,
        next,
      }),
      { prev: null, next: null }
    ),
  )

  // TODO move drag to obvservable here

  const key$ = merge(
    fromEvent<KeyboardEvent>(window, 'keydown').pipe(
      map(({ key }) => ({ key, down: true }))
    ),
    fromEvent<KeyboardEvent>(window, 'keyup').pipe(
      map(({ key }) => ({ key, down: false }))
    )
  ).pipe(
    startWith({ key: ' ', down: false }),
    map(({ down }) => down)
  )

  return pointer$.pipe(
    withLatestFrom(key$),
    map(([pointer, key]) => ({
      pos: pointer.next ? { x: pointer.next.x, y: pointer.next.y } : null,
      down: pointer.next?.down || key,
    }))
  )
}
