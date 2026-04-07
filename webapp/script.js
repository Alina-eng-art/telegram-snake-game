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

let touchStartX = 0;
let touchStartY = 0;

const eatSound = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");

// 🍎
function randomFood(){
  return {
    x: Math.floor(Math.random()*grid),
    y: Math.floor(Math.random()*grid)
  };
}

// 📱 СВАЙП УПРАВЛЕНИЕ
canvas.addEventListener("touchstart", e => {
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
});

canvas.addEventListener("touchend", e => {
  const t = e.changedTouches[0];
  let dx = t.clientX - touchStartX;
  let dy = t.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && dir.x !== -1) dir = {x:1,y:0};
    else if (dx < 0 && dir.x !== 1) dir = {x:-1,y:0};
  } else {
    if (dy > 0 && dir.y !== -1) dir = {x:0,y:1};
    else if (dy < 0 && dir.y !== 1) dir = {x:0,y:-1};
  }
});

// 💣 способность
function explode(){
  if(score < 3) return;

  score -= 3;
  snake.pop();
  snake.pop();
}

// ⚡ телепорт
function teleport(){
  if(score < 5) return;

  score -= 5;
  snake[0] = randomFood();
}

// 🔁 логика
function update(){
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

// 🎨 рисовка
function draw(){
  ctx.fillStyle = "#000";
  ctx.fillRect(0,0,400,400);

  // яблоко
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(food.x*20+10, food.y*20+10, 8, 0, Math.PI*2);
  ctx.fill();

  // змея
  snake.forEach((s,i)=>{
    ctx.beginPath();
    ctx.fillStyle = `hsl(${i*20},100%,50%)`;
    ctx.arc(s.x*20+10, s.y*20+10, 9, 0, Math.PI*2);
    ctx.fill();
  });

  document.getElementById('score').innerText = score;
}

// 💀 смерть
function die(){
  alert("💀 Game Over");

  snake = [{x:10,y:10}];
  dir = {x:1,y:0};
  score = 0;
}

// 🔁 цикл
function loop(){
  update();
  draw();
  setTimeout(loop, 120);
}

loop();
