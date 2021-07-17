import { RenderArgs } from './types'

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
  renderInput(args)
}
