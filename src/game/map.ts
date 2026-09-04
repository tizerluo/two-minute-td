/** Grid + fixed S-shaped path for Two-Minute TD. */

export const COLS = 12;
export const ROWS = 7;
export const CELL = 64;

export const MAP_W = COLS * CELL; // 768
export const MAP_H = ROWS * CELL; // 448

export type Cell = { col: number; row: number };
export type Vec2 = { x: number; y: number };

/**
 * Ordered path cells forming an S (~20 cells).
 * Start: left side of row 1; End: right side of row 5.
 */
export const PATH_CELLS: readonly Cell[] = [
  { col: 0, row: 1 },
  { col: 1, row: 1 },
  { col: 2, row: 1 },
  { col: 3, row: 1 },
  { col: 4, row: 1 },
  { col: 5, row: 1 },
  { col: 6, row: 1 },
  { col: 6, row: 2 },
  { col: 6, row: 3 },
  { col: 5, row: 3 },
  { col: 4, row: 3 },
  { col: 3, row: 3 },
  { col: 2, row: 3 },
  { col: 2, row: 4 },
  { col: 2, row: 5 },
  { col: 3, row: 5 },
  { col: 4, row: 5 },
  { col: 5, row: 5 },
  { col: 6, row: 5 },
  { col: 7, row: 5 },
  { col: 8, row: 5 },
  { col: 9, row: 5 },
  { col: 10, row: 5 },
  { col: 11, row: 5 },
];

const pathKey = (col: number, row: number): string => `${col},${row}`;

const pathSet: ReadonlySet<string> = new Set(
  PATH_CELLS.map((c) => pathKey(c.col, c.row)),
);

export const START_CELL: Cell = PATH_CELLS[0]!;
export const END_CELL: Cell = PATH_CELLS[PATH_CELLS.length - 1]!;

/** Pixel centers of each path cell — future enemy waypoints. */
export const WAYPOINTS: readonly Vec2[] = PATH_CELLS.map(cellCenter);

export function inBounds(col: number, row: number): boolean {
  return col >= 0 && col < COLS && row >= 0 && row < ROWS;
}

export function isPathCell(col: number, row: number): boolean {
  return pathSet.has(pathKey(col, row));
}

/** Non-path cells inside the grid are buildable (placement comes later). */
export function isBuildable(col: number, row: number): boolean {
  return inBounds(col, row) && !isPathCell(col, row);
}

export function cellCenter(cell: Cell): Vec2 {
  return {
    x: cell.col * CELL + CELL / 2,
    y: cell.row * CELL + CELL / 2,
  };
}

export function cellOrigin(cell: Cell): Vec2 {
  return { x: cell.col * CELL, y: cell.row * CELL };
}

export function worldToCell(x: number, y: number): Cell | null {
  const col = Math.floor(x / CELL);
  const row = Math.floor(y / CELL);
  if (!inBounds(col, row)) return null;
  return { col, row };
}

const COLOR_BUILDABLE = "#1b3a4b";
const COLOR_BUILDABLE_ALT = "#1e4256";
const COLOR_PATH = "#3d5a80";
const COLOR_PATH_EDGE = "#98c1d9";
const COLOR_GRID = "rgba(255, 255, 255, 0.08)";
const COLOR_START = "#2a9d8f";
const COLOR_END = "#e76f51";

/** Draw grid, path, and start/end markers. */
export function drawMap(ctx: CanvasRenderingContext2D): void {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * CELL;
      const y = row * CELL;
      if (isPathCell(col, row)) {
        ctx.fillStyle = COLOR_PATH;
      } else {
        ctx.fillStyle =
          (col + row) % 2 === 0 ? COLOR_BUILDABLE : COLOR_BUILDABLE_ALT;
      }
      ctx.fillRect(x, y, CELL, CELL);
    }
  }

  // Path outline for clarity
  ctx.strokeStyle = COLOR_PATH_EDGE;
  ctx.lineWidth = 2;
  for (const cell of PATH_CELLS) {
    ctx.strokeRect(cell.col * CELL + 1, cell.row * CELL + 1, CELL - 2, CELL - 2);
  }

  // Grid lines
  ctx.strokeStyle = COLOR_GRID;
  ctx.lineWidth = 1;
  for (let c = 0; c <= COLS; c++) {
    const x = c * CELL + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, MAP_H);
    ctx.stroke();
  }
  for (let r = 0; r <= ROWS; r++) {
    const y = r * CELL + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(MAP_W, y);
    ctx.stroke();
  }

  drawMarker(ctx, START_CELL, COLOR_START, "S");
  drawMarker(ctx, END_CELL, COLOR_END, "E");
}

function drawMarker(
  ctx: CanvasRenderingContext2D,
  cell: Cell,
  fill: string,
  label: string,
): void {
  const { x, y } = cellCenter(cell);
  const r = CELL * 0.28;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "bold 16px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, y);
}
