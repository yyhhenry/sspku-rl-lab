import { z } from "zod";

export const gridCellEnum = ["empty", "forbidden", "goal"] as const;
export const GridCellSchema = z.enum(gridCellEnum);
export type GridCell = z.infer<typeof GridCellSchema>;
export const GridRewardSchema = z.object({
  gamma: z.number().min(0.01).max(0.99),
  border: z.number(),
  cell: z.object({
    empty: z.number(),
    forbidden: z.number(),
    goal: z.number(),
  }),
});
export type GridReward = z.infer<typeof GridRewardSchema>;
export const GridSizeIntSchema = z.number().int().min(1).max(10);
export type GridSizeIntItem = z.infer<typeof GridSizeIntSchema>;
export const GridEnvSchema = z.object({
  rows: GridSizeIntSchema,
  cols: GridSizeIntSchema,
  cells: z.array(z.array(GridCellSchema)),
  reward: GridRewardSchema,
});
export type GridEnv = z.infer<typeof GridEnvSchema>;

export function createDefaultGridEnv(): GridEnv {
  return {
    rows: 5,
    cols: 5,
    cells: [
      ["empty", "empty", "empty", "empty", "empty"],
      ["empty", "forbidden", "forbidden", "empty", "empty"],
      ["empty", "empty", "forbidden", "empty", "empty"],
      ["empty", "forbidden", "goal", "forbidden", "empty"],
      ["empty", "forbidden", "empty", "empty", "empty"],
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
  };
}

export const gridCellColor: Record<GridCell, string> = {
  empty: "bg-white/5",
  forbidden: "bg-yellow-600",
  goal: "bg-indigo-600",
};

export function safeGetCell(env: GridEnv, r: number, c: number): GridCell {
  return env.cells[r]?.[c] ?? "empty";
}
