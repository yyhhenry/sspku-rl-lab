export function range(start: number, end?: number, step?: number): number[] {
  if (end === undefined) {
    end = start;
    start = 0;
  }
  if (step === undefined) {
    step = 1;
  }
  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}
export function arr<T = number>(n: number, fn: (i: number) => T): T[] {
  const result: T[] = new Array(n);
  for (let i = 0; i < n; i++) {
    result[i] = fn(i);
  }
  return result;
}

export function mat<T = number>(
  rows: number,
  cols: number,
  fn: (r: number, c: number) => T,
): T[][] {
  return arr(rows, r => arr(cols, c => fn(r, c)));
}

export function checkMatrix<T = number>(matrix: T[][]): [number, number] {
  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;
  if (rows === 0) {
    throw new Error("Matrix must not be empty");
  }
  if (matrix.some(row => row.length !== cols)) {
    throw new Error("All rows must have the same length");
  }
  return [rows, cols];
}

export function displayMatrix(
  matrix: number[][],
  fractionDigits = 2,
  elementDelimiter = ", ",
  lineDelimiter = "\n",
): string {
  checkMatrix(matrix);
  return matrix
    .map(row => row.map(v => v.toFixed(fractionDigits)).join(elementDelimiter))
    .join(lineDelimiter);
}

export function matrixFromFlattened(
  flattened: number[],
  rows: number,
  cols: number,
): number[][] {
  if (flattened.length !== rows * cols) {
    throw new Error("Invalid flattened array length");
  }
  return mat(rows, cols, (r, c) => flattened[r * cols + c]);
}

export function identityMatrix(size: number): number[][] {
  return mat(size, size, (r, c) => (r === c ? 1 : 0));
}

export function matrixAdd(
  A: number[][],
  B: number[][],
  { alpha = 1, beta = 1 } = {},
): number[][] {
  const [rows, cols] = checkMatrix(A);
  const [rowsB, colsB] = checkMatrix(B);

  if (rows !== rowsB || cols !== colsB) {
    throw new Error("Matrices must have the same dimensions for addition");
  }

  return mat(rows, cols, (r, c) => alpha * A[r][c] + beta * B[r][c]);
}

export function InvertMatrix(matrix: number[][]): number[][] {
  const [n, m] = checkMatrix(matrix);
  if (n !== m) {
    throw new Error("Matrix must be square to calculate its inverse");
  }
  // Create an augmented matrix [A | I]
  const augmented: number[][] = mat(n, 2 * n, (r, c) => {
    if (c < n) {
      return matrix[r][c];
    }
    return r === c - n ? 1 : 0;
  });
  // Perform Gauss-Jordan elimination
  for (let i = 0; i < n; i++) {
    // Find the pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    // Swap the maximum row with the current row
    if (maxRow !== i) {
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    }
    // Make the pivot equal to 1
    const pivot = augmented[i][i];
    if (pivot === 0) {
      throw new Error("Matrix is singular");
    }
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= pivot;
    }
    // Eliminate the other rows
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i];
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
  }
  // Extract the inverse matrix
  return augmented.map(row => row.slice(n));
}

export function applyMatrixToVector(
  matrix: number[][],
  vector: number[],
): number[] {
  const [rows, cols] = checkMatrix(matrix);
  if (cols !== vector.length) {
    throw new Error("Incompatible matrix and vector dimensions");
  }
  return arr(rows, r =>
    matrix[r].reduce((sum, value, c) => sum + value * vector[c], 0),
  );
}
