import { Dot, MoveDown, MoveLeft, MoveRight, MoveUp, type LucideIcon } from 'lucide-vue-next'
import { z } from 'zod'
import { applyMatrixToVector, identityMatrix, matrixAdd } from './tensor'
import { useZodStorage } from './zod-storage'

export const gridCellEnum = ['empty', 'forbidden', 'goal'] as const
export const GridCellSchema = z.enum(gridCellEnum)
export type GridCell = z.infer<typeof GridCellSchema>
export const gridActionEnum = ['stay', 'right', 'down', 'left', 'up'] as const
export const GridActionSchema = z.enum(gridActionEnum)
export type GridAction = z.infer<typeof GridActionSchema>
export const actionDeltas: Record<GridAction, { deltaR: number; deltaC: number }> = {
  stay: { deltaR: 0, deltaC: 0 },
  right: { deltaR: 0, deltaC: 1 },
  down: { deltaR: 1, deltaC: 0 },
  left: { deltaR: 0, deltaC: -1 },
  up: { deltaR: -1, deltaC: 0 },
}

export const GridRewardSchema = z
  .object({
    gamma: z.number().min(0.01).max(0.99),
    border: z.number(),
    cell: z.record(GridCellSchema, z.number()),
  })
  .refine(
    (data) => {
      return gridCellEnum.every((cellType) => cellType in data.cell)
    },
    {
      message: 'Reward mapping must include all cell types.',
    },
  )
export type GridReward = z.infer<typeof GridRewardSchema>
export const GridSizeIntSchema = z.number().int().min(1).max(10)
export type GridSizeIntItem = z.infer<typeof GridSizeIntSchema>
export const GridEnvSchema = z
  .object({
    rows: GridSizeIntSchema,
    cols: GridSizeIntSchema,
    cells: z.array(z.array(GridCellSchema)),
    reward: GridRewardSchema,
    policy: z.array(z.array(GridActionSchema)),
  })
  .refine(
    (data) => {
      return data.cells.length === data.rows && data.cells.every((row) => row.length === data.cols)
    },
    {
      error: 'Cells dimensions do not match rows and cols.',
    },
  )
  .refine(
    (data) => {
      return (
        data.policy.length === data.rows && data.policy.every((row) => row.length === data.cols)
      )
    },
    {
      error: 'Policy dimensions do not match rows and cols.',
    },
  )
export type GridEnv = z.infer<typeof GridEnvSchema>

export function createDefaultGridEnv(): GridEnv {
  return {
    rows: 5,
    cols: 5,
    cells: [
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'forbidden', 'forbidden', 'empty', 'empty'],
      ['empty', 'empty', 'forbidden', 'empty', 'empty'],
      ['empty', 'forbidden', 'goal', 'forbidden', 'empty'],
      ['empty', 'forbidden', 'empty', 'empty', 'empty'],
    ] as const,
    reward: {
      gamma: 0.9,
      border: -1,
      cell: {
        empty: 0,
        forbidden: -1,
        goal: 1,
      },
    },
    policy: Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => 'stay' as const)),
  }
}

export function getPolicyExamples(
  rows: number,
  cols: number,
): { name: string; policy: GridAction[][] }[] {
  const examples: { name: string; rows: number; cols: number; policy: GridAction[][] }[] = [
    {
      name: 'Policy 1',
      rows: 5,
      cols: 5,
      policy: [
        ['right', 'right', 'right', 'down', 'down'],
        ['up', 'up', 'right', 'down', 'down'],
        ['up', 'left', 'down', 'right', 'down'],
        ['up', 'right', 'stay', 'left', 'down'],
        ['up', 'right', 'up', 'left', 'left'],
      ] as const,
    },
    {
      name: 'Policy 2',
      rows: 5,
      cols: 5,
      policy: [
        ['right', 'right', 'right', 'right', 'down'],
        ['up', 'up', 'right', 'right', 'down'],
        ['up', 'left', 'down', 'right', 'down'],
        ['up', 'right', 'stay', 'left', 'down'],
        ['up', 'right', 'up', 'left', 'left'],
      ] as const,
    },
    {
      name: 'Policy 3',
      rows: 5,
      cols: 5,
      policy: Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => 'right' as const)),
    },
    {
      name: 'Policy 4',
      rows: 5,
      cols: 5,
      policy: [
        ['right', 'left', 'left', 'up', 'up'],
        ['down', 'stay', 'right', 'down', 'right'],
        ['left', 'right', 'down', 'left', 'stay'],
        ['stay', 'down', 'up', 'up', 'right'],
        ['stay', 'right', 'stay', 'right', 'stay'],
      ] as const,
    },
  ]
  return [
    {
      name: 'All Stay',
      rows,
      cols,
      policy: Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => 'stay' as const),
      ),
    },
    ...examples.filter((example) => example.rows === rows && example.cols === cols),
  ]
}

export const gridEnvStorage = useZodStorage('grid-env', GridEnvSchema, createDefaultGridEnv)

export const gridCellColor: Record<GridCell, string> = {
  empty: 'bg-white/5',
  forbidden: 'bg-yellow-600',
  goal: 'bg-indigo-600',
}

export const gridActionIcon: Record<GridAction, LucideIcon> = {
  stay: Dot,
  up: MoveUp,
  down: MoveDown,
  left: MoveLeft,
  right: MoveRight,
}

export function safeGetCell(env: GridEnv, r: number, c: number): GridCell {
  return env.cells[r]?.[c] ?? 'empty'
}
export function safeGetCellPolicy(env: GridEnv, r: number, c: number): GridAction {
  return env.policy[r]?.[c] ?? 'stay'
}

export function getActionResult(
  env: GridEnv,
  r: number,
  c: number,
  action: GridAction,
): { r: number; c: number; reward: number } {
  const { deltaR, deltaC } = actionDeltas[action]
  const newR = r + deltaR
  const newC = c + deltaC
  if (newR < 0 || newR >= env.rows || newC < 0 || newC >= env.cols) {
    return { r, c, reward: env.reward.border }
  }
  return { r: newR, c: newC, reward: env.reward.cell[safeGetCell(env, newR, newC)] }
}

export function getRewardTensor(env: GridEnv) {
  const rows = env.rows
  const cols = env.cols
  const rewardMatrix: number[] = []

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rewardMatrix.push(getActionResult(env, r, c, safeGetCellPolicy(env, r, c)).reward)
    }
  }

  return rewardMatrix
}

export function getTransitionTensor(env: GridEnv) {
  const rows = env.rows
  const cols = env.cols
  const stateCount = rows * cols
  const transitionTensor: number[][] = Array.from({ length: stateCount }, () =>
    Array.from({ length: stateCount }, () => 0),
  )
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const stateIndex = r * cols + c
      const action = safeGetCellPolicy(env, r, c)
      const { r: newR, c: newC } = getActionResult(env, r, c, action)
      const newStateIndex = newR * cols + newC
      transitionTensor[stateIndex]![newStateIndex] = 1
    }
  }
  return transitionTensor
}

export function closedFormSolution(env: GridEnv): number[] {
  //  v = (I - γ P)^(-1) R
  const gamma = env.reward.gamma
  const P = getTransitionTensor(env)
  const R = getRewardTensor(env)

  const I = identityMatrix(R.length)
  const A = matrixAdd(I, P, { alpha: 1, beta: -gamma })
  return applyMatrixToVector(A, R)
}
