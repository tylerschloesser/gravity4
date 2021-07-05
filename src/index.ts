const canvas = document.querySelector<HTMLCanvasElement>('canvas')!

let h = (canvas.height = window.innerHeight)
let w = (canvas.width = window.innerWidth)

const context = canvas.getContext('2d')!

context.fillStyle = '#444'
context.fillRect(0, 0, w, h)

window.addEventListener('resize', () => {
  h = canvas.height = window.innerHeight
  w = canvas.width = window.innerWidth

  context.fillStyle = '#444'
  context.fillRect(0, 0, w, h)
})
