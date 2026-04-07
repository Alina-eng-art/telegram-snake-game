const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 400;

const grid = 20;

// 🐍 игрок
let snake = [{x: 10, y: 10}];
let dir = {x: 1, y: 0};

// 🤖 враг
let enemy = [{x: 5, y: 5}];
let enemyDir = {x: 1, y: 0};

let food = randomFood();

let score = 0;
let best = localStorage.getItem('snake_best') || 0;
document.getElementById('best').innerText = best;

let boost = false;
let time = 0;

// 🎨 СКИНЫ
let skin = "neon"; // neon / fire

// 🔊 ЗВУК (фикс лага)
const eatSound = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
eatSound.volume = 0.3;

const deadSound = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");

// 🎮 управление
function setDir(d) {
  if (d === 'up' && dir.y !== 1) dir = {x:0,y:-1};
  if (d === 'down' && dir.y !== -1) dir = {x:0,y:1};
  if (d === 'left' && dir.x !== 1) dir = {x:-1,y:0};
  if (d === 'right' && dir.x !== -1) dir = {x:1,y:0};
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

// 🤖 враг двигается к еде
function moveEnemy() {
  let head = enemy[0];

  if (head.x < food.x) enemyDir = {x:1,y:0};
  else if (head.x > food.x) enemyDir = {x:-1,y:0};
  else if (head.y < food.y) enemyDir = {x:0,y:1};
  else if (head.y > food.y) enemyDir = {x:0,y:-1};

  let newHead = {
    x: head.x + enemyDir.x,
    y: head.y + enemyDir.y
  };

  enemy.unshift(newHead);
  enemy.pop();
}

// 🔁 логика
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
    if (s.x === head.x && s.y === head.y) return die();
  }

  // 💀 враг
  for (let e of enemy) {
    if (e.x === head.x && e.y === head.y) return die();
  }

  snake.unshift(head);

  // 🍎 еда
  if (head.x === food.x && head.y === food.y) {
    food = randomFood();
    score++;

    eatSound.currentTime = 0;
    eatSound.play();

    if (score > best) {
      best = score;
      localStorage.setItem('snake_best', best);
      document.getElementById('best').innerText = best;
    }

  } else {
    snake.pop();
  }

  moveEnemy();
}

// 🎨 отрисовка
function draw() {
  time += 0.1;

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0,0,400,400);

  // 🍎 яблоко
  ctx.beginPath();
  ctx.fillStyle = "red";
  ctx.arc(food.x*20+10, food.y*20+10, 8 + Math.sin(time)*2, 0, Math.PI*2);
  ctx.fill();

  // 🐍 ЗМЕЯ (волна)
  snake.forEach((s, i) => {
    const wave = Math.sin(time + i * 0.5) * 3;

    let color;

    if (skin === "neon") {
      color = `hsl(${(time*50 + i*10)%360}, 100%, 50%)`;
    } else {
      color = `rgb(255, ${100+i*5}, 0)`; // fire
    }

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(s.x*20+10, s.y*20+10 + wave, 9, 0, Math.PI*2);
    ctx.fill();
  });

  // 🤖 враг
  enemy.forEach((e, i) => {
    ctx.beginPath();
    ctx.fillStyle = "purple";
    ctx.arc(e.x*20+10, e.y*20+10, 8, 0, Math.PI*2);
    ctx.fill();
  });

  document.getElementById('score').innerText = score;
}

// 💥 смерть
function die() {
  deadSound.currentTime = 0;
  deadSound.play();

  // вспышка
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      ctx.fillStyle = i % 2 ? "red" : "black";
      ctx.fillRect(0,0,400,400);
    }, i * 50);
  }

  setTimeout(() => {
    snake = [{x:10,y:10}];
    enemy = [{x:5,y:5}];
    score = 0;
  }, 300);
}

// 🏆 онлайн рейтинг (заготовка)
async function sendScore() {
  try {
    await fetch('https://your-server.com/score', {
      method: 'POST',
      body: JSON.stringify({score})
    });
  } catch(e) {
    console.log('offline mode');
  }
}

// 🔁 цикл
function loop() {
  update();
  draw();

  setTimeout(loop, boost ? 60 : 120);
}

loop();
