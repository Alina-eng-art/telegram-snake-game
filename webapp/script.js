const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 400;

let snake, dir, food, score, best;
let gameLoop;

// TELEGRAM
const tg = window.Telegram?.WebApp;
tg?.expand();

const user = tg?.initDataUnsafe?.user || {};
const user_id = user.id || "guest_" + Math.random();
const playerName = user.first_name || "Player";
const avatar = user.photo_url || "";

// BEST
best = localStorage.getItem("snake_best") || 0;
document.getElementById("best").innerText = best;

// UI

document.getElementById("closeRating").onclick = () => {
document.getElementById("ratingModal").classList.add("hidden");
};

function openRating() {
  document.getElementById("ratingModal").classList.remove("hidden");
  loadLeaderboard();
}

// API
const API = "https://snake-server-5swh.onrender.com";

function sendScore(score) {
  fetch(API + "/score", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ user_id, name: playerName, score, avatar })
  });
}

function loadLeaderboard() {
  fetch(API + "/scores")
    .then(res => res.json())
    .then(data => {

      const div = document.getElementById("ratingList");
      div.innerHTML = "";

      data.forEach((p, i) => {
        let cls = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";

        div.innerHTML += `
        <div class="player ${cls}">
          <div class="player-left">
            <img class="avatar" src="${p.avatar || 'https://ui-avatars.com/api/?name='+p.name}">
            <span>#${i+1} ${p.name}</span>
          </div>
          <span>${p.score}</span>
        </div>`;
      });
    });
}

// GAME
function startGame(){
  snake = [{x:10,y:10}];
  dir = {x:1,y:0};
  food = randomFood();
  score = 0;

  clearInterval(gameLoop);
  gameLoop = setInterval(update, 150);
}

function randomFood(){
  return {x: Math.floor(Math.random()*20), y: Math.floor(Math.random()*20)};
}

function update(){
  let head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

  if(head.x<0||head.y<0||head.x>=20||head.y>=20) return die();

  for(let s of snake){
    if(s.x===head.x && s.y===head.y) return die();
  }

  snake.unshift(head);

  if(head.x===food.x && head.y===food.y){
    food = randomFood();
    score++;

    if(score > best){
      best = score;
      localStorage.setItem("snake_best", best);
      document.getElementById("best").innerText = best;
    }

  } else snake.pop();

  draw();
}

function die(){
  clearInterval(gameLoop);
  sendScore(score);
  openRating();
  document.getElementById("menu").style.display = "flex";
}

function draw(){
  ctx.fillStyle = "#1e3a5f";
  ctx.fillRect(0,0,400,400);

  ctx.fillStyle = "red";
  ctx.fillRect(food.x*20, food.y*20, 20,20);

  ctx.fillStyle = "#00ff88";
  snake.forEach(s=>{
    ctx.fillRect(s.x*20, s.y*20, 20,20);
  });

  document.getElementById("score").innerText = score;
}

// controls
document.addEventListener("keydown", e=>{
  if(e.key==="ArrowUp") dir={x:0,y:-1};
  if(e.key==="ArrowDown") dir={x:0,y:1};
  if(e.key==="ArrowLeft") dir={x:-1,y:0};
  if(e.key==="ArrowRight") dir={x:1,y:0};
});

document.getElementById("startBtn").onclick = ()=>{
  document.getElementById("menu").style.display = "none";
  startGame();
};

// фикс кнопки ТОП
window.addEventListener("load", () => {
  const topBtn = document.getElementById("topBtn");

  if(topBtn){
    topBtn.onclick = () => {
      openRating();
    };
  }
});