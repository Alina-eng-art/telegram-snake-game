const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 400;

const gridSize = 40;
const cols = 10;
const rows = 10;

let grid = Array(rows).fill().map(()=>Array(cols).fill(0));
let score = 0;

const scoreEl = document.getElementById('score');
const nextBlocksDiv = document.getElementById('next-blocks');

const shapes = [
  [[1,1],[1,1]],
  [[1,1,1]],
  [[1],[1],[1]],
  [[1,1],[0,1]],
  [[1,0],[1,1]],
  [[1,1,1],[0,1,0]]
];

const colors = ['#ff3c3c','#00ffcc','#0099ff','#ffd700','#ff6600','#cc00ff'];

let blocks = [];
let current = null;
let mouse = {x:0,y:0,offX:0,offY:0};

function genBlocks(){
  blocks = Array(3).fill().map(()=>{
    const i = Math.floor(Math.random()*shapes.length);
    return {shape:shapes[i], color:colors[i]};
  });
  drawBlocks();
}

function drawBlocks(){
  nextBlocksDiv.innerHTML='';
  blocks.forEach((b,i)=>{
    const c = document.createElement('canvas');
    c.width=80; c.height=80;
    c.dataset.index=i;

    const cx = c.getContext('2d');
    cx.fillStyle = b.color;

    b.shape.forEach((row,r)=>{
      row.forEach((val,c2)=>{
        if(val) cx.fillRect(c2*20,r*20,18,18);
      });
    });

    nextBlocksDiv.appendChild(c);
  });
}

function draw(){
  ctx.clearRect(0,0,400,400);

  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      if(grid[r][c]){
        ctx.fillStyle = grid[r][c];
        ctx.fillRect(c*40,r*40,38,38);
      }
    }
  }

  if(current){
    ctx.fillStyle=current.color;

    const gx = Math.floor((mouse.x-mouse.offX)/40);
    const gy = Math.floor((mouse.y-mouse.offY)/40);

    current.shape.forEach((row,r)=>{
      row.forEach((val,c)=>{
        if(val){
          ctx.globalAlpha=0.7;
          ctx.fillRect((gx+c)*40,(gy+r)*40,38,38);
          ctx.globalAlpha=1;
        }
      });
    });
  }
}

function canPlace(b,x,y){
  for(let r=0;r<b.shape.length;r++){
    for(let c=0;c<b.shape[r].length;c++){
      if(b.shape[r][c]){
        let X=x+c,Y=y+r;
        if(X<0||X>=10||Y<0||Y>=10||grid[Y][X]) return false;
      }
    }
  }
  return true;
}

function place(b,x,y){
  b.shape.forEach((row,r)=>{
    row.forEach((val,c)=>{
      if(val){
        grid[y+r][x+c]=b.color;
        score++;
      }
    });
  });
  scoreEl.innerText="Очки: "+score;
}

function drop(){
  if(!current) return;

  let gx=Math.floor((mouse.x-mouse.offX)/40);
  let gy=Math.floor((mouse.y-mouse.offY)/40);

  if(canPlace(current,gx,gy)){
    place(current,gx,gy);
    blocks.splice(current.index,1);
    if(blocks.length===0) genBlocks();
    drawBlocks();
  }

  current=null;
}

nextBlocksDiv.addEventListener('mousedown',start);
nextBlocksDiv.addEventListener('touchstart',start);

function start(e){
  const t=e.target;
  if(t.tagName==='CANVAS'){
    const i=parseInt(t.dataset.index);
    current={...blocks[i], index:i};

    const rect=t.getBoundingClientRect();
    const p=e.touches?e.touches[0]:e;

    mouse.offX=p.clientX-rect.left;
    mouse.offY=p.clientY-rect.top;
  }
}

canvas.addEventListener('mousemove',move);
canvas.addEventListener('touchmove',move);

function move(e){
  if(!current) return;
  const rect=canvas.getBoundingClientRect();
  const p=e.touches?e.touches[0]:e;

  mouse.x=p.clientX-rect.left;
  mouse.y=p.clientY-rect.top;
}

canvas.addEventListener('mouseup',drop);
canvas.addEventListener('touchend',drop);

function loop(){
  draw();
  requestAnimationFrame(loop);
}

genBlocks();
loop();
