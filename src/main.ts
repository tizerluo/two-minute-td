import "./styles.css";
import { drawMap, MAP_H, MAP_W } from "./game/map";

const canvas = document.createElement("canvas");
canvas.width = MAP_W;
canvas.height = MAP_H;

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
  drawMap(ctx!);

  // Light title overlay (does not obscure the map much)
  ctx!.fillStyle = "rgba(233, 69, 96, 0.85)";
  ctx!.font = "18px system-ui, sans-serif";
  ctx!.textAlign = "left";
  ctx!.textBaseline = "top";
  ctx!.fillText("Two-Minute TD", 10, 8);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
