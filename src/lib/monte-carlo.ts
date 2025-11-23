import {
  gridActionEnum,
  type GridAction,
  type GridEnv,
  type GridPolicy,
  type GridReward,
} from "./grid-env";

export function epsilonGreedy(
  epsilon: number,
  greedyAction: GridAction,
): GridAction {
  // greedy: 1 - epsilon * (n - 1) / n
  // non-greedy: epsilon / n
  const n = gridActionEnum.length;
  const rand = Math.random();

  const otherActions: GridAction[] = gridActionEnum.filter(
    action => action !== greedyAction,
  );
  const index = Math.floor(rand / (epsilon / n));
  if (index >= n - 1) {
    return greedyAction;
  } else {
    return otherActions[index];
  }
}

export function gridEpisode(
  env: GridEnv,
  reward: GridReward,
  policy: GridPolicy,
  steps: number,
  epsilon: number,
  start: [number, number, GridAction],
) {
  throw new Error("Not implemented");
}
