import {
  getActionMove,
  gridActionEnum,
  safeGetCellAction,
  type GridAction,
  type GridEnv,
  type GridPolicy,
} from "./grid-env";
import { range } from "./tensor";

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

export async function generateEpisode(
  env: GridEnv,
  policy: GridPolicy,
  episodeLength: number,
  epsilon: number,
  start: {
    r: number;
    c: number;
    action: GridAction;
  },
): Promise<GridEpisode> {
  const episode = [start];
  let { r, c } = getActionMove(env, start.r, start.c, start.action);
  for (const step of range(episodeLength)) {
    const greedyAction = safeGetCellAction(policy, r, c);
    const action = epsilonGreedy(epsilon, greedyAction);
    episode.push({ r, c, action });
    ({ r, c } = getActionMove(env, r, c, action));
    if (step % 1000 === 0) {
      await Promise.resolve();
    }
  }
  return episode;
}

export function countStateAction(
  env: GridEnv,
  episode: GridEpisode,
): Record<string, number> {
  const asKey = (step: GridEpisodeStep) => `${step.r},${step.c},${step.action}`;

  const stateActionCount: Record<string, number> = {};
  for (const r of range(env.rows)) {
    for (const c of range(env.cols)) {
      for (const action of gridActionEnum) {
        stateActionCount[asKey({ r, c, action })] = 0;
      }
    }
  }
  for (const step of episode) {
    stateActionCount[asKey(step)] += 1;
  }

  return stateActionCount;
}

export async function explorationAnalysisDemo(
  env: GridEnv,
  policy: GridPolicy,
  epsilon: number,
  episodeLength: number,
) {
  const start: GridEpisodeStep = { r: 0, c: 0, action: "idle" };
  const episode = await generateEpisode(
    env,
    policy,
    episodeLength,
    epsilon,
    start,
  );
  const stateActionCount = countStateAction(env, episode);
  return { episode, stateActionCount };
}
