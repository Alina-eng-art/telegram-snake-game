const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 400;

const grid = 20;
let snake = [{x: 10, y: 10}];
let dir = {x: 1, y: 0};
let food = randomFood();

let score = 0;
let best = localStorage.getItem('snake_best') || 0;
document.getElementById('best').innerText = best;

let speed = 120;
let boost = false;
let time = 0;

// 🎮 управление
function setDir(d) {
  if (d === 'up') dir = {x:0,y:-1};
  if (d === 'down') dir = {x:0,y:1};
  if (d === 'left') dir = {x:-1,y:0};
  if (d === 'right') dir = {x:1,y:0};
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') setDir('up');
  if (e.key === 'ArrowDown') setDir('down');
  if (e.key === 'ArrowLeft') setDir('left');
  if (e.key === 'ArrowRight') setDir('right');

  if (e.key === ' ') boost = true;
});

document.addEventListener('keyup', e => {
  if (e.key === ' ') boost = false;
});

function randomFood() {
  return {
    x: Math.floor(Math.random() * grid),
    y: Math.floor(Math.random() * grid)
  };
}

function update() {
  let head = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y
  };

  // 💀 стены
  if (head.x < 0 || head.y < 0 || head.x >= grid || head.y >= grid) {
    return die();
  }

  // 💀 в себя
  for (let s of snake) {
    if (s.x === head.x && s.y === head.y) {
      return die();
    }
  }

  snake.unshift(head);

  // 🍎 еда
  if (head.x === food.x && head.y === food.y) {
    food = randomFood();
    score++;
    playEat();

    if (score > best) {
      best = score;
      localStorage.setItem('snake_best', best);
      document.getElementById('best').innerText = best;
    }

  } else {
    snake.pop();
  }
}

function draw() {
  time += 0.05;

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, 400, 400);

  // 🍎 ПУЛЬС ЯБЛОКА
  const pulse = Math.sin(time) * 2;

  ctx.beginPath();
  ctx.fillStyle = "red";
  ctx.arc(food.x*20+10, food.y*20+10, 8 + pulse, 0, Math.PI*2);
  ctx.fill();

  // 🐍 змея с эффектом хвоста
  snake.forEach((s, i) => {
    const alpha = 1 - i / snake.length;

    ctx.beginPath();
    ctx.fillStyle = `rgba(0,255,200,${alpha})`;
    ctx.arc(s.x*20+10, s.y*20+10, 9, 0, Math.PI*2);
    ctx.fill();
  });

  document.getElementById('score').innerText = score;
}

// 💀 смерть с эффектом
function die() {
  playDead();

  // 💥 эффект вспышки
  ctx.fillStyle = "red";
  ctx.fillRect(0,0,400,400);

  setTimeout(() => {
    snake = [{x:10,y:10}];
    dir = {x:1,y:0};
    score = 0;
  }, 200);
}

// 🔊 звук
function playEat() {
  new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg").play();
}

function playDead() {
  new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg").play();
}

// 🔁 цикл
function loop() {
  update();
  draw();

  setTimeout(loop, boost ? 60 : 120);
}

loop();
