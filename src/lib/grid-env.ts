import { z } from 'zod'
import { useZodStorage } from './zod-storage'

export const gridCellEnum = ['empty', 'forbidden', 'goal'] as const
export const GridCellSchema = z.enum(gridCellEnum)
export type GridCell = z.infer<typeof GridCellSchema>

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
  })
  .refine(
    (data) => {
      return data.cells.length === data.rows && data.cells.every((row) => row.length === data.cols)
    },
    {
      error: 'Cells dimensions do not match rows and cols.',
    },
  )
export type GridEnv = z.infer<typeof GridEnvSchema>

export function createDefaultGridEnv(): GridEnvWithPolicy {
  const rows = 5
  const cols = 5
  const cells = [
    ['empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'forbidden', 'forbidden', 'empty', 'empty'],
    ['empty', 'empty', 'forbidden', 'empty', 'empty'],
    ['empty', 'forbidden', 'goal', 'forbidden', 'empty'],
    ['empty', 'forbidden', 'empty', 'empty', 'empty'],
  ] as const

  const policy: GridPolicy = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 'stay'),
  )

  return {
    rows,
    cols,
    cells: cells as unknown as GridEnv['cells'],
    reward: {
      gamma: 0.9,
      border: -10,
      cell: {
        empty: 0,
        forbidden: -1,
        goal: 1,
      },
    },
    policy,
  }
}

// NOTE: gridEnvStorage is declared after the policy/schema definitions below to avoid TDZ/runtime init order issues

export const gridCellColor: Record<GridCell, string> = {
  empty: 'bg-white/5',
  forbidden: 'bg-yellow-600',
  goal: 'bg-indigo-600',
}

// Actions for manual policy (deterministic single action per cell)
export const gridActionEnum = ['stay', 'up', 'down', 'left', 'right'] as const
export const GridActionSchema = z.enum(gridActionEnum)
export type GridAction = z.infer<typeof GridActionSchema>

export const GridPolicySchema = z.array(z.array(GridActionSchema))

// policy must match rows/cols dimensions
export const GridEnvWithPolicySchema = GridEnvSchema.extend({
  policy: GridPolicySchema,
}).refine(
  (data) => {
    return data.policy.length === data.rows && data.policy.every((row) => row.length === data.cols)
  },
  {
    error: 'Policy dimensions do not match rows and cols.',
  },
)

export type GridPolicy = z.infer<typeof GridPolicySchema>
export type GridEnvWithPolicy = z.infer<typeof GridEnvWithPolicySchema>

export const gridActionColor: Record<GridAction, string> = {
  stay: 'bg-white/5',
  up: 'bg-sky-500',
  right: 'bg-green-500',
  down: 'bg-red-500',
  left: 'bg-yellow-500',
}

export const gridEnvStorage = useZodStorage(
  'grid-env',
  GridEnvWithPolicySchema,
  createDefaultGridEnv,
)
