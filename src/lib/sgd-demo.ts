import { arr } from "./tensor";

export interface Point2D {
  x: number;
  y: number;
}
export function randomUniform(a: number, b: number): number {
  return Math.random() * (b - a) + a;
}
export function randomChoice<T>(arr: T[]): T {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}
export function randomPointInSquare(size: number): Point2D {
  const halfSize = size / 2;
  return {
    x: randomUniform(-halfSize, halfSize),
    y: randomUniform(-halfSize, halfSize),
  };
}
export function randomPointInCircle(radius: number): Point2D {
  const r = radius * Math.sqrt(Math.random());
  const theta = randomUniform(0, 2 * Math.PI);
  return {
    x: r * Math.cos(theta),
    y: r * Math.sin(theta),
  };
}
export function randomPoints(
  n: number,
  size: number,
  mode: "square" | "circle" = "square",
): Point2D[] {
  return arr(n, () =>
    mode === "square" ? randomPointInSquare(size) : randomPointInCircle(size),
  );
}
export function l2Dist(a: Point2D, b: Point2D) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
export function avgPoint(points: Point2D[]) {
  return {
    x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
    y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
  };
}

export interface SGDIterInfo {
  w: Point2D;
  loss: number;
}

export function miniBatchSGDDemo(
  points: Point2D[],
  alphaFn: (k: number) => number,
  iterations: number,
  w: Point2D,
  batchSize: number = 1, // default to SGD
) {
  const E = avgPoint(points);
  const lossFn = (w: Point2D) => l2Dist(w, E);
  const iters: SGDIterInfo[] = [{ w, loss: lossFn(w) }];

  while (iters.length < iterations + 1) {
    const k = iters.length; // 1-based index
    const batch = arr(batchSize, () => randomChoice(points));
    const alpha = alphaFn(k);
    // w_new = w - alpha * (w - mean(batch))
    const meanBatch = {
      x: batch.reduce((sum, p) => sum + p.x, 0) / batch.length,
      y: batch.reduce((sum, p) => sum + p.y, 0) / batch.length,
    };
    w = {
      x: w.x - alpha * (w.x - meanBatch.x),
      y: w.y - alpha * (w.y - meanBatch.y),
    };
    const loss = lossFn(w);
    iters.push({ w, loss });
  }
  return iters;
}
