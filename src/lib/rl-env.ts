import { z } from 'zod'
import { useZodStorageWithDefault } from './zod-storage'

export const gridCellEnum = ['empty', 'forbidden', 'goal'] as const
export const GridCellSchema = z.enum(gridCellEnum)
export type GridCell = z.infer<typeof GridCellSchema>

export const GridRewardSchema = z.object({
  gamma: z.number().min(0).max(1),
  cell: z.record(GridCellSchema, z.number()),
})
export type GridReward = z.infer<typeof GridRewardSchema>

export const GridEnvSchema = z
  .object({
    rows: z.number().int().min(1),
    cols: z.number().int().min(1),
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
  .refine((data) => data.reward.gamma >= 0 && data.reward.gamma <= 1, {
    message: 'Reward gamma must be between 0 and 1.',
  })
  .refine(
    (data) => {
      const cellTypes = Object.keys(data.reward.cell)
      return (
        gridCellEnum.every((cellType) => cellTypes.includes(cellType)) &&
        Object.keys(data.reward.cell).length === gridCellEnum.length
      )
    },
    {
      message: 'Reward mapping must include all cell types.',
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
    ],
    reward: {
      gamma: 0.9,
      cell: {
        empty: 0,
        forbidden: -1,
        goal: 1,
      },
    },
  }
}

export const gridEnvStorage = useZodStorageWithDefault(
  'grid-env',
  GridEnvSchema,
  createDefaultGridEnv,
)
