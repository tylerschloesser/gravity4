import { fromEvent, merge, Observable } from 'rxjs'
import { map, mapTo, mergeMap, startWith, withLatestFrom } from 'rxjs/operators'
import { Input } from './types'

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
    startWith(null),
  )

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

  return pointer$.pipe(withLatestFrom(key$), map(([pointer, key]) => ({
    pos: pointer ? { x: pointer.x, y: pointer.y } : null,
    down: pointer?.down || key,
  })))
}
