import { z } from 'zod'

// export type GridCellType = 'empty' | 'forbidden' | 'goal'
export const GridCellTypeSchema = z.enum(['empty', 'forbidden', 'goal'])
export type GridCellType = z.infer<typeof GridCellTypeSchema>

export const GridEnvSchema = z.object({
  rows: z.number().int().min(1),
  cols: z.number().int().min(1),
  cells: z.array(z.array(GridCellTypeSchema)),
})
export type GridEnv = z.infer<typeof GridEnvSchema>

export const GridRewardSchema = z.object({
  gamma: z.number().min(0).max(1),
  enterCell: z.map(GridCellTypeSchema, z.number()),
})
export type GridReward = z.infer<typeof GridRewardSchema>
