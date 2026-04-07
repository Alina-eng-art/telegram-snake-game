const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 400;

const grid = 20;

let snake = [{x:10,y:10}];
let dir = {x:1,y:0};
let food = randomFood();

let score = 0;
let best = localStorage.getItem('snake_best') || 0;
document.getElementById('best').innerText = best;

let gameOver = false;

// 🔊 звук (без лагов)
const eatSound = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");

// 🍎 еда
function randomFood(){
  return {
    x: Math.floor(Math.random()*grid),
    y: Math.floor(Math.random()*grid)
  };
}

//
// 📱 СВАЙП (ФИКС — НЕ ЗАКРЫВАЕТ TELEGRAM)
//
let startX = 0;
let startY = 0;

canvas.addEventListener("touchstart", e => {
  e.preventDefault(); // 🔥 ВАЖНО
  const t = e.touches[0];
  startX = t.clientX;
  startY = t.clientY;
});

canvas.addEventListener("touchmove", e => {
  e.preventDefault(); // 🔥 фикс закрытия
});

canvas.addEventListener("touchend", e => {
  e.preventDefault();

  const t = e.changedTouches[0];
  let dx = t.clientX - startX;
  let dy = t.clientY - startY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && dir.x !== -1) dir = {x:1,y:0};
    else if (dx < 0 && dir.x !== 1) dir = {x:-1,y:0};
  } else {
    if (dy > 0 && dir.y !== -1) dir = {x:0,y:1};
    else if (dy < 0 && dir.y !== 1) dir = {x:0,y:-1};
  }
});

//
// 🖥 КЛАВИАТУРА (СТРЕЛКИ)
//
document.addEventListener("keydown", e => {
  if(e.key === "ArrowUp" && dir.y !== 1) dir = {x:0,y:-1};
  if(e.key === "ArrowDown" && dir.y !== -1) dir = {x:0,y:1};
  if(e.key === "ArrowLeft" && dir.x !== 1) dir = {x:-1,y:0};
  if(e.key === "ArrowRight" && dir.x !== -1) dir = {x:1,y:0};
});

//
// 🔁 ЛОГИКА
//
function update(){
  if(gameOver) return;

  let head = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y
  };

  // 💀 стены
  if(head.x<0 || head.y<0 || head.x>=grid || head.y>=grid){
    return die();
  }

  // 💀 в себя
  for(let s of snake){
    if(s.x===head.x && s.y===head.y) return die();
  }

  snake.unshift(head);

  if(head.x===food.x && head.y===food.y){
    food = randomFood();
    score++;

    eatSound.currentTime = 0;
    eatSound.play();

    if(score > best){
      best = score;
      localStorage.setItem('snake_best', best);
      document.getElementById('best').innerText = best;
    }

  } else {
    snake.pop();
  }
}

//
// 🎨 РИСОВКА (КРАСИВО)
//
function draw(){
  // фон
  ctx.fillStyle = "#0b0b0b";
  ctx.fillRect(0,0,400,400);

  // сетка
  ctx.strokeStyle = "#111";
  for(let i=0;i<400;i+=20){
    ctx.beginPath();
    ctx.moveTo(i,0);
    ctx.lineTo(i,400);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0,i);
    ctx.lineTo(400,i);
    ctx.stroke();
  }

  // 🍎 яблоко (красивое)
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(food.x*20+10, food.y*20+10, 8, 0, Math.PI*2);
  ctx.fill();

  // 🐍 змея (градиент)
  snake.forEach((s,i)=>{
    let size = 10 - i*0.2;
    if(size < 5) size = 5;

    ctx.fillStyle = i === 0 ? "#00ffcc" : "#00aa88";

    ctx.beginPath();
    ctx.arc(s.x*20+10, s.y*20+10, size, 0, Math.PI*2);
    ctx.fill();
  });

  // текст
  document.getElementById('score').innerText = score;

  // 💀 GAME OVER UI
  if(gameOver){
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0,0,400,400);

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("GAME OVER", 100, 180);

    ctx.font = "18px Arial";
    ctx.fillText("Tap to restart", 120, 220);
  }
}

//
// 💀 СМЕРТЬ (БЕЗ ALERT)
//
function die(){
  gameOver = true;
}

//
// 🔄 РЕСТАРТ
//
canvas.addEventListener("click", () => {
  if(gameOver){
    snake = [{x:10,y:10}];
    dir = {x:1,y:0};
    score = 0;
    food = randomFood();
    gameOver = false;
  }
});

//
// 🔁 LOOP
//
function loop(){
  update();
  draw();
  setTimeout(loop, 120);
}

loop();
