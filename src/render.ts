import { RenderArgs } from './types'

function renderPlatform(args: RenderArgs) {
  const { context, pointer, size, state } = args
  const { w, h } = size

  const scale = w / 100

  context.translate(
    state.platform.x * scale + (state.platform.size / 2) * scale,
    state.platform.y * scale + (state.platform.size / 2) * scale
  )

  context.translate(
    -state.ball.x * scale + w / 2,
    -state.ball.y * scale + h / 2
  )

  context.rotate(state.platform.angle)

  context.strokeStyle = 'red'

  context.strokeRect(
    (-state.platform.size * scale) / 2,
    (-state.platform.size * scale) / 2,
    state.platform.size * scale,
    state.platform.size * scale
  )

  context.resetTransform()
}

function renderPointer(args: RenderArgs) {
  const { context, pointer, size, state } = args
  const { w, h } = size
  if (pointer) {
    context.strokeStyle = 'white'
    if (pointer.down) {
      context.strokeStyle = 'blue'
    }
    context.beginPath()
    context.arc(pointer.x, pointer.y, 50, 0, 2 * Math.PI)
    context.stroke()
  }
}

function renderBall(args: RenderArgs) {
  const { context, pointer, size, state } = args
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
  const { context, pointer, size, state } = args
  const { w, h } = size
  context.clearRect(0, 0, w, h)

  context.fillStyle = '#444'
  context.fillRect(0, 0, w, h)

  context.lineWidth = 3

  renderPlatform(args)
  renderBall(args)
  renderPointer(args)
}
