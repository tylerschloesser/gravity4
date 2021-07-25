import * as _ from 'lodash/fp'
import { Box, Circle, RenderArgs } from './types'
import { isCircleHit } from './util'

function renderBackground(args: RenderArgs) {
  const { context, viewport, state } = args

  const scale = viewport.x / 100

  context.translate(viewport.x / 2, viewport.y / 2)
  context.rotate(-args.state.camera.angle)
  context.translate(-state.ball.p.x * scale, -state.ball.p.y * scale)

  context.translate(-50, -50)
  context.lineWidth = 2
  context.strokeStyle = '#555'
  context.beginPath()
  for (let i = -20; i < 20 + 1; i++) {
    context.moveTo(-100 * scale * 2, i * 10 * scale)
    context.lineTo(100 * scale * 2, i * 10 * scale)

    context.moveTo(i * 10 * scale, -100 * scale * 2)
    context.lineTo(i * 10 * scale, 100 * scale * 2)
  }
  context.stroke()

  context.resetTransform()
}

function renderBox(box: Box, args: RenderArgs) {
  const { context, viewport, state } = args

  context.lineWidth = 3

  const scale = viewport.x / 100

  context.translate(viewport.x / 2, viewport.y / 2)
  context.rotate(-args.state.camera.angle)

  context.translate(
    box.p.x * scale + (box.size / 2) * scale,
    box.p.y * scale + (box.size / 2) * scale
  )
  context.translate(-state.ball.p.x * scale, -state.ball.p.y * scale)

  context.strokeStyle = 'red'

  context.strokeRect(
    (-box.size * scale) / 2,
    (-box.size * scale) / 2,
    box.size * scale,
    box.size * scale
  )

  context.resetTransform()
}

function renderBall(args: RenderArgs) {
  const { context, viewport, state } = args

  context.lineWidth = 3

  context.translate(viewport.x / 2, viewport.y / 2)
  const scale = viewport.x / 100
  context.strokeStyle = 'white'
  context.beginPath()
  context.arc(0, 0, state.ball.r * scale, 0, 2 * Math.PI)
  context.stroke()

  context.rotate(state.ball.angle)
  context.strokeStyle = 'green'
  context.beginPath()
  context.moveTo(0, 0)
  context.lineTo(state.ball.r * scale, 0)
  context.stroke()
  context.resetTransform()
}

function renderCircle(circle: Circle, args: RenderArgs) {
  const { context, viewport, state } = args

  context.lineWidth = 3

  const scale = viewport.x / 100

  context.translate(viewport.x / 2, viewport.y / 2)
  context.rotate(-args.state.camera.angle)

  const { p, r } = circle

  context.translate(p.x * scale, p.y * scale)
  context.translate(-state.ball.p.x * scale, -state.ball.p.y * scale)

  if (isCircleHit(state, circle)) {
    context.strokeStyle = 'blue'
  } else {
    context.strokeStyle = 'red'
  }

  context.beginPath()
  context.arc(0, 0, r * scale, 0, Math.PI * 2)
  context.stroke()

  context.resetTransform()
}

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
  ['camera.av', (args) => args.state.camera.av.toFixed(3)],
  ['camera.angle', (args) => args.state.camera.angle.toFixed(3)],
  ['speed', (args) => args.state.speed.toFixed(3)],
  ['drag.v.x', (args) => args.input.drag.v.x.toFixed(2)],
  ['drag.v.y', (args) => args.input.drag.v.y.toFixed(2)],
]

export function renderDebug(args: RenderArgs) {
  DEBUG.forEach(([name, getValue]) => {
    const value = <HTMLTableCellElement>document.getElementById(name)!
    value.innerText = getValue(args)
  })
  adjustDebug()
}

function renderSpeed(args: RenderArgs) {
  const { context, viewport, state } = args
  context.strokeStyle = 'blue'
  context.strokeRect(0, 0, viewport.x, Math.min(viewport.x, viewport.y) / 20)

  context.lineWidth = 3

  context.fillStyle = 'blue'
  context.fillRect(
    0,
    0,
    viewport.x * state.speed,
    Math.min(viewport.x, viewport.y) / 20
  )
}

function renderInit(args: RenderArgs) {
  const { context, viewport } = args
  context.clearRect(0, 0, viewport.x, viewport.y)

  context.fillStyle = '#444'
  context.fillRect(0, 0, viewport.x, viewport.y)
}

export function render(args: RenderArgs) {
  ;[
    renderInit,
    renderBackground,
    ...args.state.boxes.map((box) => _.curry(renderBox)(box)),
    ...args.state.circles.map((circle) => _.curry(renderCircle)(circle)),
    renderBall,
    renderSpeed,
    renderDebug,
  ].forEach((renderFn) => renderFn(args))
}

export async function newRender() {
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

  // TODO init render
  return render
}
