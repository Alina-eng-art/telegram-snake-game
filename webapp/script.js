const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

canvas.width = 400
canvas.height = 400

const grid = 20

// 🐍 картинки
const snakeHead = new Image()
snakeHead.src = "https://i.imgur.com/7QZ7Z6F.png"

const appleImg = new Image()
appleImg.src = "https://i.imgur.com/1bX5QH6.png"

// ===== ЗМЕЯ =====
let snake = {
  x: 200,
  y: 200,
  dx: grid,
  dy: 0,
  cells: [],
  maxCells: 4
}

// 🍎 яблоко
let apple = {
  x: 100,
  y: 100
}

let score = 0

// ===== УПРАВЛЕНИЕ =====
function setDir(dir) {
  if (dir === 'left' && snake.dx === 0) {
    snake.dx = -grid
    snake.dy = 0
  }
  if (dir === 'right' && snake.dx === 0) {
    snake.dx = grid
    snake.dy = 0
  }
  if (dir === 'up' && snake.dy === 0) {
    snake.dy = -grid
    snake.dx = 0
  }
  if (dir === 'down' && snake.dy === 0) {
    snake.dy = grid
    snake.dx = 0
  }
}

// клавиатура
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') setDir('left')
  if (e.key === 'ArrowRight') setDir('right')
  if (e.key === 'ArrowUp') setDir('up')
  if (e.key === 'ArrowDown') setDir('down')
})

// 📱 фикс для Telegram кнопок
document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("touchstart", (e) => {
    e.preventDefault()
  })
})

// ===== ИГРА =====
function loop() {
  requestAnimationFrame(loop)

  // движение
  snake.x += snake.dx
  snake.y += snake.dy

  // границы
  if (snake.x < 0) snake.x = canvas.width - grid
  if (snake.x >= canvas.width) snake.x = 0
  if (snake.y < 0) snake.y = canvas.height - grid
  if (snake.y >= canvas.height) snake.y = 0

  snake.cells.unshift({ x: snake.x, y: snake.y })

  if (snake.cells.length > snake.maxCells) {
    snake.cells.pop()
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 🍎 яблоко
  ctx.drawImage(appleImg, apple.x, apple.y, grid, grid)

  // 🐍 змейка
  snake.cells.forEach((cell, index) => {

    if (index === 0) {
      ctx.drawImage(snakeHead, cell.x, cell.y, grid, grid)
    } else {
      ctx.fillStyle = "lime"
      ctx.fillRect(cell.x, cell.y, grid-2, grid-2)
    }

    // съел яблоко
    if (cell.x === apple.x && cell.y === apple.y) {
      snake.maxCells++
      score++
      document.getElementById("score").innerText = "Score: " + score

      apple.x = Math.floor(Math.random() * 20) * grid
      apple.y = Math.floor(Math.random() * 20) * grid
    }

    // в себя
    for (let i = index + 1; i < snake.cells.length; i++) {
      if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
        resetGame()
      }
    }
  })
}

// ===== СБРОС =====
function resetGame() {
  snake.x = 200
  snake.y = 200
  snake.cells = []
  snake.maxCells = 4
  snake.dx = grid
  snake.dy = 0

  score = 0
  document.getElementById("score").innerText = "Score: 0"
}

// 🚀 запуск
loop()
