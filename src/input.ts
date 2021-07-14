import { fromEvent, merge, Observable } from 'rxjs'
import { map, mapTo, startWith } from 'rxjs/operators'
import { Input } from './types'

export async function newInput(): Promise<Observable<Input>> {
  return merge(
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
    map((pointer) => ({
      pos: pointer,
      down: pointer?.down ?? false,
    }))
  )
}
