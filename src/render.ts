import { Drag2, RenderArgs } from './types'

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

function renderInput(args: RenderArgs) {
  const { context, input, size, state } = args
  const { w, h } = size
  if (w <= 600) {
    // assume mobile
    return
  }
  if (input.pos) {
    context.strokeStyle = 'white'
    if (input.down) {
      context.strokeStyle = 'blue'
    }
    context.beginPath()
    context.arc(input.pos.x, input.pos.y, 50, 0, 2 * Math.PI)
    context.stroke()
  }
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

// resize the debug view. if it's in the bottom right,
// I don't want it constantly changing size
function adjustDebug() {
  const debug = document.querySelector<HTMLDivElement>('#debug')!
  const width = debug.getBoundingClientRect().width
  const prev = parseInt(localStorage.getItem('debug.width') || '0')
  const max = Math.max(width, prev)
  if (max > prev || !debug.style.getPropertyValue('--width')) {
    localStorage.setItem('debug.width', max.toString())
    debug.style.setProperty('--width', `${max}px`)
  }
}

export function renderDebug(args: RenderArgs) {
  const { state } = args
  const av = state.angularVelocity.toFixed(3)
  document.querySelector('#av')!.innerHTML = av
  const speed = state.speed.toFixed(3)
  document.querySelector('#speed')!.innerHTML = speed
  const drag2 = JSON.stringify(
    Object.entries(
      args.input.drag2 || ({ dx: 0, dy: 0, correction: 0, time: 0 } as Drag2)
    ).reduce(
      (acc, [k, v]) => ({
        ...acc,
        [k]: (v as number).toFixed(2),
      }),
      {}
    ),
    null,
    2
  )
  document.querySelector('#drag2')!.innerHTML = drag2

  adjustDebug()
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
  renderBall(args)
  //renderInput(args)

  renderDebug(args)
}
