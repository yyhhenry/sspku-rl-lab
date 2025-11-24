import {
  createDefaultGridPolicy,
  getActionMove,
  getActionReward,
  getStateValue,
  gridActionEnum,
  safeGetCellAction,
  type GridAction,
  type GridEnv,
  type GridPolicy,
  type GridReward,
} from "./grid-env";
import { arr, mat, range } from "./tensor";

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

export interface MonteCarloIterInfo {
  policy: GridPolicy;
  value: number[];
  maxError: number;
}

export async function monteCarloDemo(
  env: GridEnv,
  reward: GridReward,
  {
    epsilon = 0.2,
    episodeLength = 1000,
    maxIters = Infinity,
    tolerance = 1e-4,
  }: {
    epsilon?: number;
    episodeLength?: number;
    maxIters?: number;
    tolerance?: number;
  } = {},
) {
  const idlePolicy = createDefaultGridPolicy();

  const iters: MonteCarloIterInfo[] = [
    {
      policy: idlePolicy,
      value: getStateValue(env, reward, idlePolicy),
      maxError: Infinity,
    },
  ];

  const cellCounter = mat(
    env.rows,
    env.cols,
    () =>
      Object.fromEntries(
        gridActionEnum.map(action => [action, { sum: 0, n: 0 }]),
      ) as Record<GridAction, { sum: number; n: number }>,
  );

  const avg = ({ sum, n }: { sum: number; n: number }) =>
    n === 0 ? -Infinity : sum / n;

  while (iters.length < maxIters) {
    const lastIter = iters[iters.length - 1];
    const randomState = {
      r: Math.floor(Math.random() * env.rows),
      c: Math.floor(Math.random() * env.cols),
      action: gridActionEnum[Math.floor(Math.random() * gridActionEnum.length)],
    };
    const episode = await generateEpisode(
      env,
      lastIter.policy,
      episodeLength,
      epsilon,
      randomState,
    );
    const newPolicy = {
      actions: mat(env.rows, env.cols, (r, c) =>
        safeGetCellAction(lastIter.policy, r, c),
      ),
    };
    let g = 0;
    for (let t = episode.length - 1; t >= 0; t--) {
      const step = episode[t];
      g =
        g * reward.gamma +
        getActionReward(env, reward, step.r, step.c, step.action);

      const cell = cellCounter[step.r][step.c];
      cell[step.action].n += 1;
      cell[step.action].sum += g;

      newPolicy.actions[step.r][step.c] = gridActionEnum.reduce(
        (bestAction, action) => {
          const bestAvg = avg(cell[bestAction]);
          const actionAvg = avg(cell[action]);
          return actionAvg > bestAvg ? action : bestAction;
        },
        gridActionEnum[0],
      );
    }
    const newValue = getStateValue(env, reward, newPolicy);
    const maxError = arr(env.rows * env.cols, i =>
      Math.abs(newValue[i] - lastIter.value[i]),
    ).reduce((a, b) => Math.max(a, b), 0);
    iters.push({ policy: newPolicy, value: newValue, maxError });
    if (maxError < tolerance) {
      break;
    }
    await Promise.resolve();
  }

  return iters;
}
