import {
  createDefaultGridPolicy,
  getActionMove,
  gridActionEnum,
  rcToIndex,
  safeGetCellAction,
  type GridAction,
  type GridEnv,
  type GridPolicy,
} from "./grid-env";
import { arr, range } from "./tensor";

export interface GridEpisodeStep {
  r: number;
  c: number;
  action: GridAction;
}
export type GridEpisode = GridEpisodeStep[];

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
  episodeLength: number,
  epsilon: number,
  start: {
    r: number;
    c: number;
    action: GridAction;
  },
): GridEpisode {
  const episode = [start];
  let { r, c } = getActionMove(env, start.r, start.c, start.action);
  for (const _ of range(episodeLength)) {
    const greedyAction = safeGetCellAction(policy, r, c);
    const action = epsilonGreedy(epsilon, greedyAction);
    episode.push({ r, c, action });
    ({ r, c } = getActionMove(env, r, c, action));
  }
  return episode;
}

export function countStateActionInEpisode(
  env: GridEnv,
  episode: GridEpisode,
): number[] {
  const numActions = gridActionEnum.length;
  const actionIdx = Object.fromEntries(
    gridActionEnum.map((action, index) => [action, index]),
  );
  const count = arr(env.rows * env.cols * numActions, () => 0);
  for (const step of episode) {
    const pos = rcToIndex(env, step.r, step.c);
    const id = pos * numActions + actionIdx[step.action];
    count[id] += 1;
  }
  return count;
}

export function explorationAnalysisDemo(
  env: GridEnv,
  epsilon: number,
  episodeLength: number,
) {
  const start: GridEpisodeStep = { r: 0, c: 0, action: "idle" };
  const policy = createDefaultGridPolicy();
  const episode = gridEpisode(env, policy, episodeLength, epsilon, start);
  const count = countStateActionInEpisode(env, episode);
  return { episode, count };
}
