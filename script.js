// 🔥 TELEGRAM INIT
const tg = window.Telegram?.WebApp;
tg?.expand();
tg?.disableVerticalSwipes?.();

// CANVAS
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// размер
function resizeCanvas() {
  const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;
  canvas.width = size;
  canvas.height = size;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const BASE_SIZE = 400;

// GAME VARS
let snake, dir, food, score, best, speed;
let gameLoop;
let started = false;

// эффекты
let flash = 0;
let boomPower = 0;
let boomX = 200;
let boomY = 200;

// звуки
const eatSound = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
const dieSound = new Audio("https://actions.google.com/sounds/v1/explosions/explosion.ogg");

let soundUnlocked = false;
function unlockSound(){
  if(soundUnlocked) return;
  eatSound.play().then(()=> eatSound.pause()).catch(()=>{});
  dieSound.play().then(()=> dieSound.pause()).catch(()=>{});
  soundUnlocked = true;
}

// вибрация
function vibrate(pattern){
  if(navigator.vibrate){
    navigator.vibrate(pattern);
  }
}

// TELEGRAM USER
const user = tg?.initDataUnsafe?.user || {};
const user_id = user.id || "guest_" + Math.random();
const playerName = user.first_name || "Player";
const avatar = user.photo_url || "";

// рекорд
best = localStorage.getItem("snake_best") || 0;
document.getElementById("best").innerText = best;

// 🔥🔥🔥 ВОТ ГЛАВНЫЙ ФИКС
document.addEventListener("DOMContentLoaded", () => {

  const startBtn = document.getElementById("startBtn");
  const topBtn = document.getElementById("topBtn");
  const closeBtn = document.getElementById("closeRating");

  if(startBtn){
    startBtn.addEventListener("click", () => {
      unlockSound();
      document.getElementById("menu").style.display = "none";
      startGame();
    });
  }

  if(topBtn){
    topBtn.addEventListener("click", openRating);
  }

  if(closeBtn){
    closeBtn.addEventListener("click", () => {
      document.getElementById("ratingModal").classList.add("hidden");
    });
  }

  document.body.addEventListener("touchstart", unlockSound, { once:true });
  document.body.addEventListener("click", unlockSound, { once:true });

});

// API
const API = "https://snake-server-5swh.onrender.com";

function sendScore(score){
  fetch(API + "/score", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      user_id,
      name: playerName,
      score,
      avatar
    })
  }).catch(()=>{});
}

function loadLeaderboard(){
  fetch(API + "/scores")
    .then(res => res.json())
    .then(data => {

      const div = document.getElementById("ratingList");
      div.innerHTML = "";

      data.forEach((p,i)=>{

        let cls = "";
        if(i===0) cls="gold";
        else if(i===1) cls="silver";
        else if(i===2) cls="bronze";

        div.innerHTML += `
        <div class="player ${cls}">
          <div class="player-left">
            <img class="avatar"
              src="${p.avatar || 'https://ui-avatars.com/api/?name='+p.name}">
            <span>#${i+1} ${p.name}</span>
          </div>
          <span>${p.score}</span>
        </div>
        `;
      });
    })
    .catch(()=>{});
}

function openRating(){
  document.getElementById("ratingModal").classList.remove("hidden");
  loadLeaderboard();
}

// 🎮 GAME
function startGame(){
  snake = [{x:10,y:10}];
  dir = {x:1,y:0};
  food = randomFood();
  score = 0;

  speed = 240;

  flash = 0;
  boomPower = 0;

  document.getElementById("score").innerText = score;

  started = true;

  clearInterval(gameLoop);
  gameLoop = setInterval(update, speed);
}

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

  let head = snake[0];
  boomX = head.x * 20 + 10;
  boomY = head.y * 20 + 10;

  flash = 1;
  boomPower = 20;

  dieSound.currentTime = 0;
  dieSound.play().catch(()=>{});

  vibrate([200,100,200]);

  document.body.classList.add("shake-screen");
  setTimeout(()=>{
    document.body.classList.remove("shake-screen");
  }, 400);

  sendScore(score);

  setTimeout(()=>{
    openRating();
    document.getElementById("menu").style.display = "flex";
  }, 400);
}

// логика
function update(){
  let head = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y
  };

  if(head.x<0 || head.y<0 || head.x>=20 || head.y>=20){
    return die();
  }

  for(let s of snake){
    if(s.x===head.x && s.y===head.y) return die();
  }

  snake.unshift(head);

  if(head.x===food.x && head.y===food.y){
    food = randomFood();
    score++;

    eatSound.currentTime = 0;
    eatSound.play().catch(()=>{});

    vibrate(50);

    if(speed > 140){
      speed -= 2;
    } else if(speed > 110){
      speed -= 1;
    } else if(speed > 90){
      speed -= 0.3;
    }

    clearInterval(gameLoop);
    gameLoop = setInterval(update, speed);

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

// 🎨 РИСОВКА
function draw(){
  const scale = canvas.width / BASE_SIZE;

  ctx.fillStyle = "#1e3a5f";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(food.x*20*scale+10*scale, food.y*20*scale+10*scale, 8*scale, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = "green";
  ctx.fillRect(food.x*20*scale+9*scale, food.y*20*scale+2*scale, 3*scale, 6*scale);

  for(let i = snake.length - 1; i >= 0; i--){
    let s = snake[i];

    let wave = Math.sin((Date.now()/100) + i) * 2;

    let x = s.x * 20 * scale + 10 * scale + wave;
    let y = s.y * 20 * scale + 10 * scale;

    let radius = (10 - i * 0.2) * scale;
    if(radius < 5*scale) radius = 5*scale;

    let gradient = ctx.createRadialGradient(x, y, 2, x, y, radius);
    gradient.addColorStop(0, "#00ff88");
    gradient.addColorStop(1, "#007744");

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI*2);
    ctx.fill();
  }

  let head = snake[0];
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(head.x*20*scale+6*scale, head.y*20*scale+8*scale, 2*scale, 0, Math.PI*2);
  ctx.arc(head.x*20*scale+14*scale, head.y*20*scale+8*scale, 2*scale, 0, Math.PI*2);
  ctx.fill();

  if(boomPower > 0){
    ctx.beginPath();
    ctx.arc(boomX*scale, boomY*scale, boomPower * 4 * scale, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,120,0,${boomPower/25})`;
    ctx.fill();
    boomPower -= 0.7;
  }

  if(flash > 0){
    ctx.fillStyle = `rgba(255,255,255,${flash})`;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    flash -= 0.07;
  }

  document.getElementById("score").innerText = score;
}

// управление
document.addEventListener("keydown", e=>{
  if(!started) return;

  if(e.key==="ArrowUp" && dir.y!==1) dir={x:0,y:-1};
  if(e.key==="ArrowDown" && dir.y!==-1) dir={x:0,y:1};
  if(e.key==="ArrowLeft" && dir.x!==1) dir={x:-1,y:0};
  if(e.key==="ArrowRight" && dir.x!==-1) dir={x:1,y:0};
});
