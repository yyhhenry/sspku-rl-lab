import {
  Dot,
  MoveDown,
  MoveLeft,
  MoveRight,
  MoveUp,
  type LucideIcon,
} from "lucide-react";
import { z } from "zod";
import { safeGetCell, type GridEnv } from "./grid-env";
import { applyMatrixToVector, identityMatrix, matrixAdd } from "./tensor";
import { createZodStore } from "./zod-store";

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
export const gridActionIcon: Record<GridAction, LucideIcon> = {
  stay: Dot,
  up: MoveUp,
  down: MoveDown,
  left: MoveLeft,
  right: MoveRight,
};

export const GridPolicySchema = z.object({
  policy: z.array(z.array(GridActionSchema)),
});
export type GridPolicy = z.infer<typeof GridPolicySchema>;
export function createDefaultGridPolicy(): GridPolicy {
  return { policy: [] };
}

export function getPolicyExamples(
  rows: number,
  cols: number
): { name: string; policy: GridAction[][] }[] {
  const examples: {
    name: string;
    rows: number;
    cols: number;
    policy: GridAction[][];
  }[] = [
    {
      name: "Policy 1",
      rows: 5,
      cols: 5,
      policy: [
        ["right", "right", "right", "down", "down"],
        ["up", "up", "right", "down", "down"],
        ["up", "left", "down", "right", "down"],
        ["up", "right", "stay", "left", "down"],
        ["up", "right", "up", "left", "left"],
      ] as const,
    },
    {
      name: "Policy 2",
      rows: 5,
      cols: 5,
      policy: [
        ["right", "right", "right", "right", "down"],
        ["up", "up", "right", "right", "down"],
        ["up", "left", "down", "right", "down"],
        ["up", "right", "stay", "left", "down"],
        ["up", "right", "up", "left", "left"],
      ] as const,
    },
    {
      name: "Policy 3",
      rows: 5,
      cols: 5,
      policy: Array.from({ length: 5 }, () =>
        Array.from({ length: 5 }, () => "right" as const)
      ),
    },
    {
      name: "Policy 4",
      rows: 5,
      cols: 5,
      policy: [
        ["right", "left", "left", "up", "up"],
        ["down", "stay", "right", "down", "right"],
        ["left", "right", "down", "left", "stay"],
        ["stay", "down", "up", "up", "right"],
        ["stay", "right", "stay", "right", "stay"],
      ] as const,
    },
  ];
  return [
    {
      name: "All Stay",
      rows,
      cols,
      policy: Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => "stay" as const)
      ),
    },
    ...examples.filter(
      example => example.rows === rows && example.cols === cols
    ),
  ];
}

export function safeGetCellPolicy(
  policy: GridPolicy,
  r: number,
  c: number
): GridAction {
  return policy.policy[r]?.[c] ?? "stay";
}

export function getActionResult(
  env: GridEnv,
  r: number,
  c: number,
  action: GridAction
): { r: number; c: number; reward: number } {
  const { deltaR, deltaC } = actionDeltas[action];
  const newR = r + deltaR;
  const newC = c + deltaC;
  if (newR < 0 || newR >= env.rows || newC < 0 || newC >= env.cols) {
    return { r, c, reward: env.reward.border };
  }
  return {
    r: newR,
    c: newC,
    reward: env.reward.cell[safeGetCell(env, newR, newC)],
  };
}

export function getRewardTensor(env: GridEnv, policy: GridPolicy) {
  const rows = env.rows;
  const cols = env.cols;
  const rewardMatrix: number[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const action = safeGetCellPolicy(policy, r, c);
      const actionReward = getActionResult(env, r, c, action).reward;
      rewardMatrix.push(actionReward);
    }
  }

  return rewardMatrix;
}

export function getTransitionTensor(env: GridEnv, policy: GridPolicy) {
  const rows = env.rows;
  const cols = env.cols;
  const stateCount = rows * cols;
  const transitionTensor: number[][] = Array.from({ length: stateCount }, () =>
    Array.from({ length: stateCount }, () => 0)
  );
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const stateIndex = r * cols + c;
      const action = safeGetCellPolicy(policy, r, c);
      const { r: newR, c: newC } = getActionResult(env, r, c, action);
      const newStateIndex = newR * cols + newC;
      transitionTensor[stateIndex]![newStateIndex] = 1;
    }
  }
  return transitionTensor;
}

export function closedFormSolution(env: GridEnv, policy: GridPolicy): number[] {
  //  v = (I - γ P)^(-1) R
  const gamma = env.reward.gamma;
  const P = getTransitionTensor(env, policy);
  const R = getRewardTensor(env, policy);

  const I = identityMatrix(R.length);
  const A = matrixAdd(I, P, { alpha: 1, beta: -gamma });
  return applyMatrixToVector(A, R);
}

export const useGridPolicy = createZodStore(
  "grid-policy",
  GridPolicySchema,
  createDefaultGridPolicy
);
