import { Dot, MoveDown, MoveLeft, MoveRight, MoveUp } from "lucide-react";
import { z } from "zod";
import { arr, mat } from "./tensor";
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

export function randomGrid(rows: number, cols: number): GridEnv {
  const cells: GridCell[][] = mat(rows, cols, () =>
    Math.random() < 0.7 ? "empty" : "forbidden",
  );
  const goalPos = [
    Math.floor(Math.random() * rows),
    Math.floor(Math.random() * cols),
  ] as const;
  cells[goalPos[0]][goalPos[1]] = "goal";
  return { rows, cols, cells };
}

export function getGridExamples(
  curEnv?: GridEnv,
): { name: string; env: GridEnv }[] {
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
    ...(curEnv === undefined
      ? []
      : [
          {
            name: "Random Grid",
            env: randomGrid(curEnv.rows, curEnv.cols),
          },
        ]),
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
  return {
    rows: 5,
    cols: 5,
    cells: mat(5, 5, () => "empty"),
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

export const useGridEnv = createZodStore(
  "grid-env",
  GridEnvSchema,
  createDefaultGridEnv,
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
    {
      name: "Strict",
      reward: {
        gamma: 0.9,
        border: -1,
        cell: {
          empty: 0,
          forbidden: -10,
          goal: 1,
        },
      },
    },
  ];
}

export function createDefaultGridReward(): GridReward {
  return {
    gamma: 0.9,
    border: -1,
    cell: {
      empty: 0,
      forbidden: -1,
      goal: 1,
    },
  };
}

export const useGridReward = createZodStore(
  "grid-reward",
  GridRewardSchema,
  createDefaultGridReward,
);

// Grid Policy
export const gridActionEnum = ["idle", "right", "down", "left", "up"] as const;
export const GridActionSchema = z.enum(gridActionEnum);
export type GridAction = z.infer<typeof GridActionSchema>;
export const actionDeltas: Record<
  GridAction,
  { deltaR: number; deltaC: number }
> = {
  idle: { deltaR: 0, deltaC: 0 },
  right: { deltaR: 0, deltaC: 1 },
  down: { deltaR: 1, deltaC: 0 },
  left: { deltaR: 0, deltaC: -1 },
  up: { deltaR: -1, deltaC: 0 },
};
export const gridActionIcon: Record<GridAction, React.ElementType> = {
  idle: Dot,
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
  cols: number,
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
          ["up", "right", "idle", "left", "down"],
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
          ["up", "right", "idle", "left", "down"],
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
  ];
  return [
    {
      name: "Idle Only",
      rows,
      cols,
      policy: {
        actions: mat(rows, cols, () => "idle" as const),
      },
    },
    {
      name: "Random",
      rows,
      cols,
      policy: {
        actions: mat(
          rows,
          cols,
          () =>
            gridActionEnum[Math.floor(Math.random() * gridActionEnum.length)],
        ),
      },
    },
    ...examples.filter(
      example => example.rows === rows && example.cols === cols,
    ),
  ];
}

export function safeGetCellAction(
  policy: GridPolicy,
  r: number,
  c: number,
): GridAction {
  return policy.actions[r]?.[c] ?? "idle";
}

export const useGridPolicy = createZodStore(
  "grid-policy",
  GridPolicySchema,
  createDefaultGridPolicy,
);

// Grid Transition and Reward Functions
export function getActionReward(
  env: GridEnv,
  reward: GridReward,
  r: number,
  c: number,
  action: GridAction,
): number {
  const { deltaR, deltaC } = actionDeltas[action];
  const newR = r + deltaR;
  const newC = c + deltaC;
  if (newR < 0 || newR >= env.rows || newC < 0 || newC >= env.cols) {
    return reward.border;
  }
  const cell = safeGetCell(env, newR, newC);
  return reward.cell[cell];
}
export function getActionMove(
  env: GridEnv,
  r: number,
  c: number,
  action: GridAction,
): { r: number; c: number } {
  const { deltaR, deltaC } = actionDeltas[action];
  const newR = r + deltaR;
  const newC = c + deltaC;
  if (newR < 0 || newR >= env.rows || newC < 0 || newC >= env.cols) {
    return { r, c };
  }
  return { r: newR, c: newC };
}

export function indexToRC(
  env: GridEnv,
  index: number,
): { r: number; c: number } {
  return {
    r: Math.floor(index / env.cols),
    c: index % env.cols,
  };
}

export function rcToIndex(env: GridEnv, r: number, c: number): number {
  return r * env.cols + c;
}

export function getRewardTensor(
  env: GridEnv,
  reward: GridReward,
  policy: GridPolicy,
) {
  const rows = env.rows;
  const cols = env.cols;
  return arr(rows * cols, i => {
    const { r, c } = indexToRC(env, i);
    const action = safeGetCellAction(policy, r, c);
    return getActionReward(env, reward, r, c, action);
  });
}

export function getTransitionTensor(
  env: GridEnv,
  policy: GridPolicy,
): number[][] {
  const rows = env.rows;
  const cols = env.cols;
  const stateCount = rows * cols;
  const transitionTensor: number[][] = mat(stateCount, stateCount, () => 0);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const stateIndex = rcToIndex(env, r, c);
      const action = safeGetCellAction(policy, r, c);
      const { r: newR, c: newC } = getActionMove(env, r, c, action);
      const newStateIndex = rcToIndex(env, newR, newC);
      transitionTensor[stateIndex][newStateIndex] = 1;
    }
  }
  return transitionTensor;
}

// Bellman Optimality Equation

export function getStateValueIters(
  env: GridEnv,
  reward: GridReward,
  policy: GridPolicy,
  options?: {
    numIters: number;
    tolerance: number;
  },
): { value: number[]; maxDiff: number }[] {
  const { numIters = Infinity, tolerance = 0.001 } = options ?? {};
  const rewardTensor = getRewardTensor(env, reward, policy);
  const nextMove = arr(env.rows * env.cols, i => {
    const { r, c } = indexToRC(env, i);
    const action = safeGetCellAction(policy, r, c);
    const { r: newR, c: newC } = getActionMove(env, r, c, action);
    return rcToIndex(env, newR, newC);
  });
  const iters: { value: number[]; maxDiff: number }[] = [
    { value: rewardTensor, maxDiff: Infinity },
  ];
  for (let i = 0; i < numIters; i++) {
    const prev = iters[iters.length - 1]!.value;
    const next = rewardTensor.map(
      (val, idx) => val + reward.gamma * prev[nextMove[idx]],
    );
    const maxDiff = next.reduce((maxDiff, val, idx) => {
      return Math.max(maxDiff, Math.abs(val - prev[idx]));
    }, 0);
    iters.push({ value: next, maxDiff });
    if (maxDiff < tolerance) {
      break;
    }
  }
  return iters;
}

export function getStateValue(
  env: GridEnv,
  reward: GridReward,
  policy: GridPolicy,
  options?: {
    numIters: number;
    tolerance: number;
  },
): number[] {
  const iters = getStateValueIters(env, reward, policy, options);
  return iters[iters.length - 1]!.value;
}

export function optimalValueIteration(
  env: GridEnv,
  reward: GridReward,
  options?: {
    numIters: number;
    tolerance: number;
  },
): { value: number[]; maxDiff: number }[] {
  const { numIters = Infinity, tolerance = 0.001 } = options ?? {};
  const idlePolicy = createDefaultGridPolicy();
  const idleRewardTensor = getRewardTensor(env, reward, idlePolicy);

  const iters: { value: number[]; maxDiff: number }[] = [
    {
      value: idleRewardTensor.map(val => val / (1 - reward.gamma)),
      maxDiff: Infinity,
    },
  ];

  while (
    iters.length < numIters &&
    iters[iters.length - 1].maxDiff > tolerance
  ) {
    const prev = iters[iters.length - 1].value;
    const next = prev.map((_, idx) => {
      const { r, c } = indexToRC(env, idx);
      return gridActionEnum
        .map(action => {
          const { r: newR, c: newC } = getActionMove(env, r, c, action);
          const val = getActionReward(env, reward, r, c, action);
          const newStateIndex = rcToIndex(env, newR, newC);
          return val + reward.gamma * prev[newStateIndex];
        })
        .reduce((maxVal, val) => Math.max(maxVal, val), -Infinity);
    });
    const maxDiff = next.reduce((maxDiff, val, idx) => {
      return Math.max(maxDiff, Math.abs(val - prev[idx]));
    }, 0);
    iters.push({ value: next, maxDiff });
  }
  return iters;
}

export function optimalPolicyIteration(
  env: GridEnv,
  reward: GridReward,
  options?: {
    numIters: number;
    valueNumIters: number;
    valueTolerance: number;
  },
): { value: number[]; policy: GridPolicy }[] {
  const {
    numIters = Infinity,
    valueNumIters = Infinity,
    valueTolerance = 0.001,
  } = options ?? {};
  const valueOptions = {
    numIters: valueNumIters,
    tolerance: valueTolerance,
  };
  const getValue = (policy: GridPolicy) => {
    return getStateValue(env, reward, policy, valueOptions);
  };
  const idlePolicy = createDefaultGridPolicy();
  const iters: { value: number[]; policy: GridPolicy }[] = [
    { value: getValue(idlePolicy), policy: idlePolicy },
  ];

  while (iters.length < numIters) {
    const prev = iters[iters.length - 1].value;
    const prevPolicy = iters[iters.length - 1].policy;
    const newPolicy: GridPolicy = {
      actions: mat(env.rows, env.cols, (r, c) => {
        const best = gridActionEnum
          .map(action => {
            const { r: newR, c: newC } = getActionMove(env, r, c, action);
            const val = getActionReward(env, reward, r, c, action);
            const newStateIndex = rcToIndex(env, newR, newC);
            return {
              value: val + reward.gamma * prev[newStateIndex],
              action,
            };
          })
          .reduce((best, curr) => (curr.value > best.value ? curr : best), {
            value: -Infinity,
            action: "idle" as GridAction,
          });
        return best.action;
      }),
    };
    iters.push({
      value: getValue(newPolicy),
      policy: newPolicy,
    });
    if (
      arr(env.rows * env.cols, i => i).every(i => {
        const { r, c } = indexToRC(env, i);
        return (
          safeGetCellAction(prevPolicy, r, c) ===
          safeGetCellAction(newPolicy, r, c)
        );
      })
    ) {
      // No policy change
      break;
    }
  }
  return iters;
}
