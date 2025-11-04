export function checkMatrix(matrix: number[][]): [number, number] {
  const rows = matrix.length
  const cols = matrix[0]?.length || 0
  if (rows === 0) {
    throw new Error('Matrix must not be empty')
  }
  if (matrix.some((row) => row.length !== cols)) {
    throw new Error('All rows must have the same length')
  }
  return [rows, cols]
}

export function displayVector(vector: number[], fractionDigits = 2) {
  return `[${vector.map((v) => v.toFixed(fractionDigits)).join(', ')}]`
}

export function displaySparseBoolMatrix(matrix: number[][]) {
  const [rows, cols] = checkMatrix(matrix)
  const items: string[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r]![c]! !== 0) {
        items.push(`(${r}, ${c})`)
      }
    }
  }
  return `SparseBoolMatrix(${rows}x${cols}) [${items.join(', ')}]`
}

export function createMatrix(
  rows: number,
  cols: number,
  fn: (r: number, c: number) => number,
): number[][] {
  return Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => fn(r, c)))
}

export function matrixFromFlattened(flattened: number[], rows: number, cols: number): number[][] {
  if (flattened.length !== rows * cols) {
    throw new Error('Invalid flattened array length')
  }
  return createMatrix(rows, cols, (r, c) => flattened[r * cols + c]!)
}

export function identityMatrix(size: number): number[][] {
  return createMatrix(size, size, (r, c) => (r === c ? 1 : 0))
}

export function matrixAdd(A: number[][], B: number[][], { alpha = 1, beta = 1 } = {}): number[][] {
  const [rows, cols] = checkMatrix(A)
  const [rowsB, colsB] = checkMatrix(B)

  if (rows !== rowsB || cols !== colsB) {
    throw new Error('Matrices must have the same dimensions for addition')
  }

  const result: number[][] = createMatrix(rows, cols, () => 0)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[r]![c] = alpha * A[r]![c]! + beta * B[r]![c]!
    }
  }
  return result
}
/**
 * Calculate the inverse of a square matrix using Gauss-Jordan elimination.
 *
 * May throw an error if the matrix is singular or not square.
 */
export function calcInverseMatrix(matrix: number[][]): number[][] {
  const [n, m] = checkMatrix(matrix)
  if (n !== m) {
    throw new Error('Matrix must be square to calculate its inverse')
  }
  // Create an augmented matrix [A | I]
  const augmented: number[][] = createMatrix(n, 2 * n, (r, c) => {
    if (c < n) {
      return matrix[r]![c]!
    }
    return r === c - n ? 1 : 0
  })
  // Perform Gauss-Jordan elimination
  for (let i = 0; i < n; i++) {
    // Find the pivot
    let maxRow = i
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k]![i]!) > Math.abs(augmented[maxRow]![i]!)) {
        maxRow = k
      }
    }
    // Swap the maximum row with the current row
    if (maxRow !== i) {
      ;[augmented[i], augmented[maxRow]] = [augmented[maxRow]!, augmented[i]!]
    }
    // Make the pivot equal to 1
    const pivot = augmented[i]![i]!
    if (pivot === 0) {
      throw new Error('Matrix is singular')
    }
    for (let j = 0; j < 2 * n; j++) {
      augmented[i]![j]! /= pivot
    }
    // Eliminate the other rows
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k]![i]!
        for (let j = 0; j < 2 * n; j++) {
          augmented[k]![j]! -= factor * augmented[i]![j]!
        }
      }
    }
  }
  // Extract the inverse matrix
  return augmented.map((row) => row.slice(n))
}

export function applyMatrixToVector(matrix: number[][], vector: number[]): number[] {
  const [rows, cols] = checkMatrix(matrix)
  if (cols !== vector.length) {
    throw new Error('Incompatible matrix and vector dimensions')
  }
  const result: number[] = new Array(rows)
  for (let r = 0; r < rows; r++) {
    result[r] = matrix[r]!.reduce((sum, value, c) => sum + value * vector[c]!, 0)
  }
  return result
}
