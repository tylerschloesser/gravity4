import { vec2 } from './math'
import { RenderArgs } from './types'

// resize the debug view. if it's in the bottom right,
// I don't want it constantly changing size
function adjustDebug() {
  const debug = document.querySelector<HTMLDivElement>('#debug')!
  const width = Math.round(debug.getBoundingClientRect().width)

  const cssVar = debug.style.getPropertyValue('--width')

  let prev: number | null = null
  if (cssVar) {
    prev = parseInt(cssVar.match(/(\d+)px/)![0])
  }

  const setWidth = (value: number) =>
    debug.style.setProperty('--width', `${value}px`)

  if (prev === null) {
    debug.style.opacity = '1'
    const saved = parseInt(localStorage.getItem('debug.width') || '0')
    setWidth(saved || width)
    return
  }

  const max = Math.max(width, prev!)
  if (max > prev!) {
    localStorage.setItem('debug.width', max.toString())
    setWidth(max)
  }
}

const DEBUG: [string, (args: RenderArgs) => string][] = [
  ['ball.p.x', (args) => args.state.ball.p.x.toFixed(2)],
  ['ball.p.y', (args) => args.state.ball.p.y.toFixed(2)],
  ['ball.v.x', (args) => args.state.ball.v.x.toFixed(2)],
  ['ball.v.y', (args) => args.state.ball.v.y.toFixed(2)],
  ['ball~speed', (args) => vec2.dist(args.state.ball.v).toFixed(2)],
  ['camera.av', (args) => args.state.camera.av.toFixed(3)],
  ['camera.angle', (args) => args.state.camera.angle.toFixed(3)],
  ['speed', (args) => args.state.speed.toFixed(3)],
  ['drag.v.x', (args) => args.input.drag.v.x.toFixed(2)],
  ['drag.v.y', (args) => args.input.drag.v.y.toFixed(2)],
  ['grav.x', (args) => args.state.debug.grav.x.toFixed(2)],
  ['grav.y', (args) => args.state.debug.grav.y.toFixed(2)],
]

export function renderDebug(args: RenderArgs) {
  DEBUG.forEach(([name, getValue]) => {
    const value = <HTMLTableCellElement>document.getElementById(name)!
    value.innerText = getValue(args)
  })
  adjustDebug()
}

export async function initRenderDebug() {
  const tbody = document.querySelector<HTMLTableElement>('#debug tbody')!
  DEBUG.forEach(([name]) => {
    const row = document.createElement('tr')
    const key = document.createElement('td')
    const value = document.createElement('td')
    value.id = name
    row.appendChild(key)
    row.appendChild(value)
    key.innerText = name
    tbody.appendChild(row)
  })
}
