import './styles.css';

const LOGICAL_W = 768;
const LOGICAL_H = 448;

const canvas = document.createElement("canvas");
canvas.width = LOGICAL_W;
canvas.height = LOGICAL_H;

const app = document.querySelector("#app");
if (!app) {
  throw new Error("#app not found");
}
app.appendChild(canvas);

const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("2d context unavailable");
}

function frame(_t: number): void {
  ctx!.fillStyle = "#16213e";
  ctx!.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

  ctx!.fillStyle = "#e94560";
  ctx!.font = "28px system-ui, sans-serif";
  ctx!.textAlign = "center";
  ctx!.textBaseline = "middle";
  ctx!.fillText("Two-Minute TD", LOGICAL_W / 2, LOGICAL_H / 2);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
