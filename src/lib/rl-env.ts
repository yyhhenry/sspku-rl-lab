import { z } from 'zod'

export const gridCellEnum = ['empty', 'forbidden', 'goal'] as const
export const GridCellSchema = z.enum(gridCellEnum)
export type GridCell = z.infer<typeof GridCellSchema>

export const GridEnvSchema = z.object({
  rows: z.number().int().min(1),
  cols: z.number().int().min(1),
  cells: z.array(z.array(GridCellSchema)),
})
export type GridEnv = z.infer<typeof GridEnvSchema>

export const GridRewardSchema = z.object({
  gamma: z.number().min(0).max(1),
  cell: z.record(GridCellSchema, z.number()),
})
export type GridReward = z.infer<typeof GridRewardSchema>
