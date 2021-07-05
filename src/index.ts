const canvas = document.querySelector<HTMLCanvasElement>('canvas')!

const h = (canvas.height = window.innerHeight)
const w = (canvas.width = window.innerWidth)

const context = canvas.getContext('2d')!

context.fillStyle = '#444'
context.fillRect(0, 0, w, h)
