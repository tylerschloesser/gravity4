import * as _ from 'lodash/fp'
import { initRenderDebug, renderDebug } from './render.debug'
import { Box, Circle, RenderArgs } from './types'
import { isCircleHit } from './util'

function renderBackground(args: RenderArgs) {
  const { context } = args
  const { scale } = transformWorld(args)

  //context.translate(-50 * scale, -50 * scale)

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
}

function renderBox(box: Box, args: RenderArgs) {
  const { context } = args

  const { scale } = transformWorld(args)

  context.translate(
    box.p.x * scale + (box.size / 2) * scale,
    -box.p.y * scale + (box.size / 2) * scale,
  )

  context.lineWidth = 3
  context.strokeStyle = 'red'
  context.strokeRect(
    (-box.size * scale) / 2,
    (-box.size * scale) / 2,
    box.size * scale,
    box.size * scale,
  )
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

  context.strokeStyle = 'green'
  context.beginPath()
  context.moveTo(0, 0)
  context.lineTo(0, -state.ball.r * scale)
  context.stroke()

  // const { gravity } = args.state
  // context.rotate(Math.PI * 2 - args.state.camera.angle - Math.PI / 2)

  // context.rotate(Math.PI * 2 - Math.atan2(gravity.y, gravity.x))
  // context.strokeStyle = 'pink'
  // context.beginPath()
  // context.moveTo(0, 0)
  // context.lineTo(state.ball.r * scale, 0)
  // context.stroke()
}

function renderCircle(circle: Circle, args: RenderArgs) {
  const { context, state } = args

  const { scale } = transformWorld(args)

  const { p, r } = circle
  context.translate(p.x * scale, -p.y * scale)

  const hit = isCircleHit(state, circle)
  context.strokeStyle = hit ? 'blue' : 'red'
  context.lineWidth = 3
  context.beginPath()
  context.arc(0, 0, r * scale, 0, Math.PI * 2)

  if (hit) {
    context.moveTo(0, 0)
    context.lineTo(
      (state.ball.p.x - p.x) * scale,
      -(state.ball.p.y - p.y) * scale,
    )
  }
  context.stroke()
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
    Math.min(viewport.x, viewport.y) / 20,
  )
}

function renderInit(args: RenderArgs) {
  const { context, viewport } = args
  context.clearRect(0, 0, viewport.x, viewport.y)

  context.fillStyle = '#444'
  context.fillRect(0, 0, viewport.x, viewport.y)
}

function transformWorld(args: RenderArgs) {
  const { context, viewport, state } = args
  const scale = viewport.x / 100
  context.translate(viewport.x / 2, viewport.y / 2)

  // Camera angle is counterclockwise rotation. We want to rotate the world
  // in the opposite direct. However, canvas rotation is applied clockwise,
  // so using the angle as-is gives us the desired behavior.
  let rotation = args.state.camera.angle

  // ball faces up on the screen
  rotation += Math.PI / 2

  context.rotate(rotation)

  context.translate(state.ball.p.x * scale, -state.ball.p.y * scale)

  return { scale }
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
  ].forEach((fn) => {
    fn(args)
    args.context.resetTransform()
  })
}

export async function initRender() {
  await initRenderDebug()
  return render
}
