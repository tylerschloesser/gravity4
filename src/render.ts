import { Circle, Drag, RenderArgs } from './types'

function renderBox(args: RenderArgs, i: number) {
  const { context, input, size, state } = args
  const { w, h } = size
  const box = state.boxes[i]

  const scale = w / 100

  context.translate(w / 2, h / 2)
  context.rotate(-args.state.angle)

  context.translate(
    box.x * scale + (box.size / 2) * scale,
    box.y * scale + (box.size / 2) * scale
  )
  context.translate(-state.ball.x * scale, -state.ball.y * scale)

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
  const { context, size, state } = args
  const { w, h } = size

  context.translate(w / 2, h / 2)
  const scale = w / 100
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

function renderCircle(args: RenderArgs, circle: Circle) {
  const { context, input, size, state } = args
  const { w, h } = size

  const scale = w / 100

  context.translate(w / 2, h / 2)
  context.rotate(-args.state.angle)

  const { p, r } = circle

  context.translate(
    p.x * scale,
    p.y * scale,
  )
  context.translate(-state.ball.x * scale, -state.ball.y * scale)

  context.strokeStyle = 'red'

  context.beginPath()
  context.arc(0, 0, r, 0, Math.PI * 2)
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
  ['av', (args) => args.state.angularVelocity.toFixed(3)],
  ['speed', (args) => args.state.speed.toFixed(3)],
  ['drag.vx', (args) => args.input.drag.vx.toFixed(2)],
  ['drag.vy', (args) => args.input.drag.vy.toFixed(2)],
]

export function renderDebug(args: RenderArgs) {
  DEBUG.forEach(([name, getValue]) => {
    const value = <HTMLTableCellElement>document.getElementById(name)!
    value.innerText = getValue(args)
  })
  adjustDebug()
}

function renderSpeed(args: RenderArgs) {
  const { context, size, state } = args
  context.strokeStyle = 'blue'
  context.strokeRect(0, 0, size.w, Math.min(size.h, size.w) / 20)

  context.fillStyle = 'blue'
  context.fillRect(0, 0, size.w * state.speed, Math.min(size.h, size.w) / 20)
}

export function render(args: RenderArgs) {
  const { context, size } = args
  const { w, h } = size
  context.clearRect(0, 0, w, h)

  context.fillStyle = '#444'
  context.fillRect(0, 0, w, h)

  context.lineWidth = 3

  args.state.boxes.forEach((_, i) => {
    renderBox(args, i)
  })
  args.state.circles.forEach((circle) => {
    renderCircle(args, circle)
  })
  renderBall(args)
  renderSpeed(args)

  renderDebug(args)
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
