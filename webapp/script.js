const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== ИГРОК =====
const player = {
  x: 100,
  y: 300,
  w: 40,
  h: 60,
  dx: 0,
  dy: 0,
  speed: 5,
  jump: -12,
  gravity: 0.5,
  onGround: false,
  hp: 100,
  attacking: false
};

// ===== ВРАГ =====
const enemy = {
  x: 500,
  y: 300,
  w: 40,
  h: 60,
  hp: 100
};

// ===== ЗЕМЛЯ =====
const ground = {
  y: 350,
  h: 50
};

// ===== УПРАВЛЕНИЕ =====
const keys = {};

// клавиатура
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// кнопки
document.getElementById('left').ontouchstart = () => keys['a'] = true;
document.getElementById('left').ontouchend = () => keys['a'] = false;

document.getElementById('right').ontouchstart = () => keys['d'] = true;
document.getElementById('right').ontouchend = () => keys['d'] = false;

document.getElementById('jump').ontouchstart = () => {
  if(player.onGround){
    player.dy = player.jump;
    player.onGround = false;
  }
};

document.getElementById('attack').ontouchstart = () => attack();

// ===== АТАКА =====
function attack(){
  player.attacking = true;

  // проверка удара
  if(
    player.x < enemy.x + enemy.w &&
    player.x + player.w + 30 > enemy.x &&
    player.y < enemy.y + enemy.h &&
    player.y + player.h > enemy.y
  ){
    enemy.hp -= 10;
  }

  setTimeout(() => player.attacking = false, 200);
}

// ===== ФИЗИКА =====
function update(){

  // движение
  if(keys['a']) player.dx = -player.speed;
  else if(keys['d']) player.dx = player.speed;
  else player.dx = 0;

  // прыжок
  if(keys['w'] && player.onGround){
    player.dy = player.jump;
    player.onGround = false;
  }

  // гравитация
  player.dy += player.gravity;

  player.x += player.dx;
  player.y += player.dy;

  // земля
  if(player.y + player.h >= ground.y){
    player.y = ground.y - player.h;
    player.dy = 0;
    player.onGround = true;
  }

  // враг атакует
  if(
    player.x < enemy.x + enemy.w &&
    player.x + player.w > enemy.x &&
    player.y < enemy.y + enemy.h &&
    player.y + player.h > enemy.y
  ){
    player.hp -= 0.2;
  }

  // рестарт
  if(player.hp <= 0){
    player.hp = 100;
    enemy.hp = 100;
    player.x = 100;
  }

  if(enemy.hp <= 0){
    enemy.hp = 100;
    enemy.x = Math.random() * (canvas.width - 100);
  }
}

// ===== РЕНДЕР =====
function draw(){

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // земля
  ctx.fillStyle = '#654321';
  ctx.fillRect(0, ground.y, canvas.width, ground.h);

  // игрок
  ctx.fillStyle = player.attacking ? 'yellow' : '#00cfff';
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // враг
  ctx.fillStyle = 'red';
  ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);

  // HP игрока
  ctx.fillStyle = 'white';
  ctx.fillText("❤️ " + Math.floor(player.hp), player.x, player.y - 10);

  // HP врага
  ctx.fillStyle = 'white';
  ctx.fillText("👹 " + Math.floor(enemy.hp), enemy.x, enemy.y - 10);
}

// ===== LOOP =====
function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
