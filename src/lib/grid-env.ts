import { Dot, MoveDown, MoveLeft, MoveRight, MoveUp, type LucideIcon } from 'lucide-vue-next'
import { z } from 'zod'
import { useZodStorage } from './zod-storage'

export const gridCellEnum = ['empty', 'forbidden', 'goal'] as const
export const GridCellSchema = z.enum(gridCellEnum)
export type GridCell = z.infer<typeof GridCellSchema>
export const gridActionEnum = ['stay', 'right', 'down', 'left', 'up'] as const
export const GridActionSchema = z.enum(gridActionEnum)
export type GridAction = z.infer<typeof GridActionSchema>

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
      border: -10,
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
  ]
  return examples.filter((example) => example.rows === rows && example.cols === cols)
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
