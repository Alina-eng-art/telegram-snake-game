const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

canvas.width = 400
canvas.height = 400

const grid = 20
let count = 0

let snake = {
  x: 160,
  y: 160,
  dx: grid,
  dy: 0,
  cells: [],
  maxCells: 4
}

let apple = {
  x: 320,
  y: 320
}

let enemies = [
  {x: 40, y: 40},
  {x: 360, y: 40}
]

let score = 0

function setDir(dir){
  if(dir === 'left'){ snake.dx = -grid; snake.dy = 0 }
  if(dir === 'right'){ snake.dx = grid; snake.dy = 0 }
  if(dir === 'up'){ snake.dy = -grid; snake.dx = 0 }
  if(dir === 'down'){ snake.dy = grid; snake.dx = 0 }
}

// клавиатура
document.addEventListener('keydown', e => {
  if(e.key === 'ArrowLeft') setDir('left')
  if(e.key === 'ArrowRight') setDir('right')
  if(e.key === 'ArrowUp') setDir('up')
  if(e.key === 'ArrowDown') setDir('down')
})

function loop(){
  requestAnimationFrame(loop)

  if(++count < 6) return
  count = 0

  ctx.clearRect(0,0,canvas.width,canvas.height)

  snake.x += snake.dx
  snake.y += snake.dy

  // границы
  if(snake.x < 0) snake.x = canvas.width - grid
  if(snake.x >= canvas.width) snake.x = 0
  if(snake.y < 0) snake.y = canvas.height - grid
  if(snake.y >= canvas.height) snake.y = 0

  snake.cells.unshift({x: snake.x, y: snake.y})

  if(snake.cells.length > snake.maxCells){
    snake.cells.pop()
  }

  // яблоко
  ctx.fillStyle = 'red'
  ctx.fillRect(apple.x, apple.y, grid-1, grid-1)

  // съел яблоко
  if(snake.x === apple.x && snake.y === apple.y){
    snake.maxCells++
    score++

    document.getElementById('score').innerText = "Score: " + score

    apple.x = Math.floor(Math.random()*20)*grid
    apple.y = Math.floor(Math.random()*20)*grid
  }

  // враги
  enemies.forEach(e => {
    // движение к игроку
    if(e.x < snake.x) e.x += grid
    else if(e.x > snake.x) e.x -= grid

    if(e.y < snake.y) e.y += grid
    else if(e.y > snake.y) e.y -= grid

    ctx.fillStyle = 'purple'
    ctx.fillRect(e.x, e.y, grid-1, grid-1)

    // смерть
    if(e.x === snake.x && e.y === snake.y){
      resetGame()
    }
  })

  // змейка
  ctx.fillStyle = 'lime'
  snake.cells.forEach((cell, index) => {
    ctx.fillRect(cell.x, cell.y, grid-1, grid-1)

    // сам в себя
    for(let i = index+1; i < snake.cells.length; i++){
      if(cell.x === snake.cells[i].x && cell.y === snake.cells[i].y){
        resetGame()
      }
    }
  })
}

function resetGame(){
  snake.x = 160
  snake.y = 160
  snake.cells = []
  snake.maxCells = 4
  snake.dx = grid
  snake.dy = 0

  score = 0
  document.getElementById('score').innerText = "Score: 0"
}

requestAnimationFrame(loop)
