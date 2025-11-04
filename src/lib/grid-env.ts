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
      border: -10,
      cell: {
        empty: 0,
        forbidden: -1,
        goal: 1,
      },
    },
  }
}

export const gridEnvStorage = useZodStorage('grid-env', GridEnvSchema, createDefaultGridEnv)

export const gridCellColor: Record<GridCell, string> = {
  empty: 'bg-white/5',
  forbidden: 'bg-yellow-600',
  goal: 'bg-indigo-600',
}
