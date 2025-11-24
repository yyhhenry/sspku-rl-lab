import {
  getActionMove,
  gridActionEnum,
  safeGetCellAction,
  type GridAction,
  type GridEnv,
  type GridPolicy,
} from "./grid-env";
import { range } from "./tensor";

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
  policy: GridPolicy,
  steps: number,
  epsilon: number,
  start: {
    r: number;
    c: number;
    action: GridAction;
  },
) {
  const episode = [start];
  let { r, c } = getActionMove(env, start.r, start.c, start.action);
  for (const _ of range(steps)) {
    const greedyAction = safeGetCellAction(policy, r, c);
    const action = epsilonGreedy(epsilon, greedyAction);
    episode.push({ r, c, action });
    ({ r, c } = getActionMove(env, r, c, action));
  }
  return episode;
}
