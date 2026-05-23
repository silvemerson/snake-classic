const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const hiEl = document.getElementById("hiscore");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayMsg = document.getElementById("overlay-msg");
const startBtn = document.getElementById("start-btn");
const speedSel = document.getElementById("speed");

const COLS = 20, ROWS = 20;
const CW = canvas.width / COLS;
const CH = canvas.height / ROWS;

let snake, dir, nextDir, food, score, hiScore = 0;
let running = false, paused = false, loop;

// ── drawing ──────────────────────────────────────────────────────────────────

function drawBg() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath(); ctx.moveTo(x * CW, 0); ctx.lineTo(x * CW, canvas.height); ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath(); ctx.moveTo(0, y * CH); ctx.lineTo(canvas.width, y * CH); ctx.stroke();
  }
}

function drawFood() {
  const cx = food.x * CW + CW / 2;
  const cy = food.y * CH + CH / 2;
  const r = CW * 0.36;
  ctx.fillStyle = "#F0997B";
  ctx.beginPath(); ctx.arc(cx, cy, r + 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#D85A30";
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath(); ctx.arc(cx - r * 0.28, cy - r * 0.28, r * 0.32, 0, Math.PI * 2); ctx.fill();
}

function roundRect(x, y, w, h, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function drawSnake() {
  const pad = 2;
  const len = snake.length;
  for (let i = len - 1; i >= 0; i--) {
    const s = snake[i];
    let color;
    if (i === 0)            color = "#0F6E56";
    else if (i < len * 0.4) color = "#1D9E75";
    else                    color = "#5DCAA5";
    roundRect(s.x * CW + pad, s.y * CH + pad, CW - pad * 2, CH - pad * 2, 4, color);
  }
  // eyes
  const h = snake[0];
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  const eyeR = 2.2;
  let e1, e2;
  if      (dir.x === 1)  { e1 = [h.x*CW+CW*0.78, h.y*CH+CH*0.28]; e2 = [h.x*CW+CW*0.78, h.y*CH+CH*0.72]; }
  else if (dir.x === -1) { e1 = [h.x*CW+CW*0.22, h.y*CH+CH*0.28]; e2 = [h.x*CW+CW*0.22, h.y*CH+CH*0.72]; }
  else if (dir.y === -1) { e1 = [h.x*CW+CW*0.28, h.y*CH+CH*0.22]; e2 = [h.x*CW+CW*0.72, h.y*CH+CH*0.22]; }
  else                   { e1 = [h.x*CW+CW*0.28, h.y*CH+CH*0.78]; e2 = [h.x*CW+CW*0.72, h.y*CH+CH*0.78]; }
  for (const [ex, ey] of [e1, e2]) {
    ctx.beginPath(); ctx.arc(ex, ey, eyeR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(ex + 0.5, ey + 0.5, eyeR * 0.45, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
  }
}

function draw() {
  drawBg();
  drawFood();
  drawSnake();
}

// ── game logic ────────────────────────────────────────────────────────────────

function randFood() {
  let pos;
  do {
    pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

function initGame() {
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score = 0;
  scoreEl.textContent = score;
  food = randFood();
}

function step() {
  dir = { ...nextDir };
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) return gameOver();
  if (snake.some(s => s.x === head.x && s.y === head.y)) return gameOver();
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    if (score > hiScore) { hiScore = score; hiEl.textContent = hiScore; }
    food = randFood();
  } else {
    snake.pop();
  }
  draw();
}

function gameOver() {
  clearInterval(loop);
  running = false;
  overlayTitle.textContent = "💀 FIM DE JOGO";
  overlayMsg.textContent = `Score: ${score}  |  Recorde: ${hiScore}`;
  startBtn.textContent = "↺ JOGAR DE NOVO";
  overlay.style.display = "flex";
}

function startGame() {
  overlay.style.display = "none";
  initGame();
  running = true;
  paused = false;
  const speed = parseInt(speedSel.value);
  clearInterval(loop);
  loop = setInterval(step, speed);
  draw();
}

// ── input ─────────────────────────────────────────────────────────────────────

const KEYS = {
  ArrowUp:    { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
  ArrowDown:  { x: 0, y:  1 }, s: { x: 0, y:  1 }, S: { x: 0, y:  1 },
  ArrowLeft:  { x:-1, y:  0 }, a: { x:-1, y:  0 }, A: { x:-1, y:  0 },
  ArrowRight: { x: 1, y:  0 }, d: { x: 1, y:  0 }, D: { x: 1, y:  0 },
};

document.addEventListener("keydown", e => {
  if (KEYS[e.key]) {
    const nd = KEYS[e.key];
    if (!(nd.x === -dir.x && nd.y === -dir.y)) nextDir = nd;
    if (e.key.startsWith("Arrow")) e.preventDefault();
  }
  if ((e.key === "p" || e.key === "P") && running) {
    paused = !paused;
    paused ? clearInterval(loop) : (loop = setInterval(step, parseInt(speedSel.value)));
  }
});

// d-pad (mobile)
document.getElementById("btn-up").addEventListener("click",    () => { if(!(dir.y === 1))  nextDir={x:0,y:-1}; });
document.getElementById("btn-down").addEventListener("click",  () => { if(!(dir.y === -1)) nextDir={x:0,y:1};  });
document.getElementById("btn-left").addEventListener("click",  () => { if(!(dir.x === 1))  nextDir={x:-1,y:0}; });
document.getElementById("btn-right").addEventListener("click", () => { if(!(dir.x === -1)) nextDir={x:1,y:0};  });

startBtn.addEventListener("click", startGame);

// draw static board on load
drawBg();
