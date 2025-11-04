export function displayVector(vector: number[], fractionDigits = 2) {
  return `[${vector.map((v) => v.toFixed(fractionDigits)).join(', ')}]`
}

export function displaySparseBoolMatrix(matrix: number[][]) {
  const rows = matrix.length
  const cols = matrix[0]?.length || 0
  const items: string[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const value = matrix[r]![c]!
      if (value !== 0) {
        items.push(`(${r}, ${c})`)
      }
    }
  }
  return `SparseBoolMatrix(${rows}x${cols}) [${items.join(', ')}]`
}
