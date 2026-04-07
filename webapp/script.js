const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 400;

const grid = 20;

let snake, dir, food, score, best, speed;
let gameLoop;
let started = false;

// 💥 эффекты
let shake = 0;
let flash = 0;

// 🔊 звук
const eatSound = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
const dieSound = new Audio("https://actions.google.com/sounds/v1/explosions/explosion.ogg");

// 🏆 рекорд
best = localStorage.getItem("snake_best") || 0;
document.getElementById("best").innerText = best;

// ▶️ старт
function startGame(){
  snake = [{x:10,y:10}];
  dir = {x:1,y:0};
  food = randomFood();
  score = 0;
  speed = 170;

  document.getElementById("score").innerText = score;

  started = true;

  clearInterval(gameLoop);
  gameLoop = setInterval(update, speed);
}

// 🍎 еда
function randomFood(){
  return {
    x: Math.floor(Math.random()*20),
    y: Math.floor(Math.random()*20)
  };
}

// 💀 смерть
function die(){
  clearInterval(gameLoop);
  started = false;

  // 💥 эффекты
  shake = 15;
  flash = 0.8;

  dieSound.currentTime = 0;
  dieSound.play();

  // тряска body
  document.body.classList.add("shake");
  setTimeout(()=> document.body.classList.remove("shake"), 300);

  // показать меню
  setTimeout(()=>{
    document.getElementById("menu").style.display = "flex";
  }, 300);
}

// 🔁 логика
function update(){
  let head = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y
  };

  // стены
  if(head.x<0 || head.y<0 || head.x>=20 || head.y>=20){
    return die();
  }

  // в себя
  for(let s of snake){
    if(s.x===head.x && s.y===head.y) return die();
  }

  snake.unshift(head);

  if(head.x===food.x && head.y===food.y){
    food = randomFood();
    score++;

    eatSound.currentTime = 0;
    eatSound.play();

    // ⚡ ускорение
    if(speed > 80){
      speed -= 4;
      clearInterval(gameLoop);
      gameLoop = setInterval(update, speed);
    }

    if(score > best){
      best = score;
      localStorage.setItem("snake_best", best);
      document.getElementById("best").innerText = best;
    }

  } else {
    snake.pop();
  }

  draw();
}

// 🎨 рисовка
function draw(){
  ctx.save();

  // 💥 тряска canvas
  if(shake > 0){
    ctx.translate((Math.random()-0.5)*10,(Math.random()-0.5)*10);
    shake--;
  }

  ctx.fillStyle = "#1e3a5f";
  ctx.fillRect(0,0,400,400);

  // 🍎 яблоко
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(food.x*20+10, food.y*20+10, 8, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = "green";
  ctx.fillRect(food.x*20+9, food.y*20+2, 3, 6);

  // 🐍 змея
  snake.forEach((s,i)=>{
    let r = 10 - i*0.2;
    if(r < 5) r = 5;

    ctx.fillStyle = i===0 ? "#00ff88" : "#00cc66";

    ctx.beginPath();
    ctx.arc(s.x*20+10, s.y*20+10, r, 0, Math.PI*2);
    ctx.fill();
  });

  // 👀 ЧЁРНЫЕ глаза
  let head = snake[0];
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(head.x*20+6, head.y*20+8, 2, 0, Math.PI*2);
  ctx.arc(head.x*20+14, head.y*20+8, 2, 0, Math.PI*2);
  ctx.fill();

  ctx.restore();

  // ⚡ вспышка
  if(flash > 0){
    ctx.fillStyle = `rgba(255,255,255,${flash})`;
    ctx.fillRect(0,0,400,400);
    flash -= 0.05;
  }

  document.getElementById("score").innerText = score;
}

// 📱 ФИКС СКРОЛЛА (ВАЖНО)
document.body.addEventListener("touchmove", e=>{
  e.preventDefault();
}, { passive:false });

// 📱 свайпы
let startX=0,startY=0;

canvas.addEventListener("touchstart", e=>{
  let t = e.touches[0];
  startX = t.clientX;
  startY = t.clientY;
});

canvas.addEventListener("touchend", e=>{
  let t = e.changedTouches[0];

  let dx = t.clientX - startX;
  let dy = t.clientY - startY;

  if(Math.abs(dx) > Math.abs(dy)){
    if(dx>0 && dir.x!==-1) dir={x:1,y:0};
    if(dx<0 && dir.x!==1) dir={x:-1,y:0};
  } else {
    if(dy>0 && dir.y!==-1) dir={x:0,y:1};
    if(dy<0 && dir.y!==1) dir={x:0,y:-1};
  }
});

// 🖥 клавиатура
document.addEventListener("keydown", e=>{
  if(!started) return;

  if(e.key==="ArrowUp" && dir.y!==1) dir={x:0,y:-1};
  if(e.key==="ArrowDown" && dir.y!==-1) dir={x:0,y:1};
  if(e.key==="ArrowLeft" && dir.x!==1) dir={x:-1,y:0};
  if(e.key==="ArrowRight" && dir.x!==-1) dir={x:1,y:0};
});

// ▶️ старт
document.getElementById("startBtn").onclick = ()=>{
  document.getElementById("menu").style.display = "none";
  startGame();
};
