import { Dot, MoveDown, MoveLeft, MoveRight, MoveUp } from "lucide-react";
import { z } from "zod";
import { createZodStore } from "./zod-store";

// Grid Environment
export const gridCellEnum = ["empty", "forbidden", "goal"] as const;
export const GridCellSchema = z.enum(gridCellEnum);
export type GridCell = z.infer<typeof GridCellSchema>;

export const GridSizeIntSchema = z.number().int().min(1).max(10);
export type GridSizeIntItem = z.infer<typeof GridSizeIntSchema>;
export const GridEnvSchema = z.object({
  rows: GridSizeIntSchema,
  cols: GridSizeIntSchema,
  cells: z.array(z.array(GridCellSchema)),
});
export type GridEnv = z.infer<typeof GridEnvSchema>;

export function getGridExamples(): { name: string; env: GridEnv }[] {
  return [
    {
      name: "Tiny Grid",
      env: {
        rows: 2,
        cols: 2,
        cells: [
          ["empty", "goal"],
          ["forbidden", "empty"],
        ],
      },
    },
    {
      name: "Example 1",
      env: {
        rows: 5,
        cols: 5,
        cells: [
          ["empty", "empty", "empty", "empty", "empty"],
          ["empty", "forbidden", "forbidden", "empty", "empty"],
          ["empty", "empty", "forbidden", "empty", "empty"],
          ["empty", "forbidden", "goal", "forbidden", "empty"],
          ["empty", "forbidden", "empty", "empty", "empty"],
        ],
      },
    },
  ];
}

export function createDefaultGridEnv(): GridEnv {
  return getGridExamples()[0].env;
}

export const gridCellColor: Record<GridCell, string> = {
  empty: "bg-white/5",
  forbidden: "bg-yellow-600",
  goal: "bg-indigo-600",
};

export function safeGetCell(env: GridEnv, r: number, c: number): GridCell {
  return env.cells[r]?.[c] ?? "empty";
}

export const useGridEnv = createZodStore(
  "grid-env",
  GridEnvSchema,
  createDefaultGridEnv
);

// Grid Rewards
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

export function getGridRewardExamples(): {
  name: string;
  reward: GridReward;
}[] {
  return [
    {
      name: "Standard",
      reward: {
        gamma: 0.9,
        border: -1,
        cell: {
          empty: 0,
          forbidden: -1,
          goal: 1,
        },
      },
    },
  ];
}

export function createDefaultGridReward(): GridReward {
  return getGridRewardExamples()[0].reward;
}

export const useGridReward = createZodStore(
  "grid-reward",
  GridRewardSchema,
  createDefaultGridReward
);

// Grid Policy
export const gridActionEnum = ["stay", "right", "down", "left", "up"] as const;
export const GridActionSchema = z.enum(gridActionEnum);
export type GridAction = z.infer<typeof GridActionSchema>;
export const actionDeltas: Record<
  GridAction,
  { deltaR: number; deltaC: number }
> = {
  stay: { deltaR: 0, deltaC: 0 },
  right: { deltaR: 0, deltaC: 1 },
  down: { deltaR: 1, deltaC: 0 },
  left: { deltaR: 0, deltaC: -1 },
  up: { deltaR: -1, deltaC: 0 },
};
export const gridActionIcon: Record<GridAction, React.ElementType> = {
  stay: Dot,
  up: MoveUp,
  down: MoveDown,
  left: MoveLeft,
  right: MoveRight,
};

export const GridPolicySchema = z.object({
  actions: z.array(z.array(GridActionSchema)),
});
export type GridPolicy = z.infer<typeof GridPolicySchema>;
export function createDefaultGridPolicy(): GridPolicy {
  return { actions: [] };
}

export function getPolicyExamples(
  rows: number,
  cols: number
): { name: string; policy: GridPolicy }[] {
  const examples: {
    name: string;
    rows: number;
    cols: number;
    policy: GridPolicy;
  }[] = [
    {
      name: "Policy 1",
      rows: 5,
      cols: 5,
      policy: {
        actions: [
          ["right", "right", "right", "down", "down"],
          ["up", "up", "right", "down", "down"],
          ["up", "left", "down", "right", "down"],
          ["up", "right", "stay", "left", "down"],
          ["up", "right", "up", "left", "left"],
        ],
      },
    },
    {
      name: "Policy 2",
      rows: 5,
      cols: 5,
      policy: {
        actions: [
          ["right", "right", "right", "right", "down"],
          ["up", "up", "right", "right", "down"],
          ["up", "left", "down", "right", "down"],
          ["up", "right", "stay", "left", "down"],
          ["up", "right", "up", "left", "left"],
        ],
      },
    },
    {
      name: "Policy 3",
      rows: 5,
      cols: 5,
      policy: {
        actions: [
          ["right", "right", "right", "right", "right"],
          ["right", "right", "right", "right", "right"],
          ["right", "right", "right", "right", "right"],
          ["right", "right", "right", "right", "right"],
          ["right", "right", "right", "right", "right"],
        ],
      },
    },
    {
      name: "Policy 4",
      rows: 5,
      cols: 5,
      policy: {
        actions: [
          ["right", "left", "left", "up", "up"],
          ["down", "stay", "right", "down", "right"],
          ["left", "right", "down", "left", "stay"],
          ["stay", "down", "up", "up", "right"],
          ["stay", "right", "stay", "right", "stay"],
        ],
      },
    },
  ];
  return [
    {
      name: "All Stay",
      rows,
      cols,
      policy: {
        actions: Array.from({ length: rows }, () =>
          Array.from({ length: cols }, () => "stay" as const)
        ),
      },
    },
    ...examples.filter(
      example => example.rows === rows && example.cols === cols
    ),
  ];
}

export function safeGetCellAction(
  policy: GridPolicy,
  r: number,
  c: number
): GridAction {
  return policy.actions[r]?.[c] ?? "stay";
}

export const useGridPolicy = createZodStore(
  "grid-policy",
  GridPolicySchema,
  createDefaultGridPolicy
);

// Grid Transition and Reward Functions
export function getActionResult(
  env: GridEnv,
  reward: GridReward,
  r: number,
  c: number,
  action: GridAction
): { r: number; c: number; reward: number } {
  const { deltaR, deltaC } = actionDeltas[action];
  const newR = r + deltaR;
  const newC = c + deltaC;
  if (newR < 0 || newR >= env.rows || newC < 0 || newC >= env.cols) {
    return { r, c, reward: reward.border };
  }
  return {
    r: newR,
    c: newC,
    reward: reward.cell[safeGetCell(env, newR, newC)],
  };
}

export function getRewardTensor(
  env: GridEnv,
  reward: GridReward,
  policy: GridPolicy
) {
  const rows = env.rows;
  const cols = env.cols;
  const rewardMatrix: number[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const action = safeGetCellAction(policy, r, c);
      const actionReward = getActionResult(env, reward, r, c, action).reward;
      rewardMatrix.push(actionReward);
    }
  }

  return rewardMatrix;
}

export function getTransitionTensor(
  env: GridEnv,
  reward: GridReward,
  policy: GridPolicy
) {
  const rows = env.rows;
  const cols = env.cols;
  const stateCount = rows * cols;
  const transitionTensor: number[][] = Array.from({ length: stateCount }, () =>
    Array.from({ length: stateCount }, () => 0)
  );
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const stateIndex = r * cols + c;
      const action = safeGetCellAction(policy, r, c);
      const { r: newR, c: newC } = getActionResult(env, reward, r, c, action);
      const newStateIndex = newR * cols + newC;
      transitionTensor[stateIndex]![newStateIndex] = 1;
    }
  }
  return transitionTensor;
}
