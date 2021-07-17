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
    fromEvent<PointerEvent>(window, 'pointerleave').pipe(mapTo(null)),
    merge(
      fromEvent<PointerEvent>(window, 'pointermove'),
      fromEvent<PointerEvent>(window, 'pointerup'),
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
  ).pipe(
    startWith<Pointer | null>(null),
    // scan<Pointer | null, { prev: Pointer | null; next: Pointer | null }>(
    //   (acc, next) => ({
    //     prev: acc?.next ?? null,
    //     next,
    //   }),
    //   { prev: null, next: null }
    // ),
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
    map(([pointer, key]) => {
      //let drag: { x: number, y: number } | null = null
      return pointer ? {
        ...pointer,
        down: pointer.down || key,
      } : null
    }),

    // TODO remove
    map((pointer) => ({
      pos: pointer ? { x: pointer.x, y: pointer.y } : null,
      down: pointer?.down ?? false,
    }))
  )
}
