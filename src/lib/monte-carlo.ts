import {
  createDefaultGridPolicy,
  getActionMove,
  getActionReward,
  gridActionEnum,
  indexToRC,
  safeGetCellAction,
  type GridAction,
  type GridEnv,
  type GridPolicy,
  type GridReward,
} from "./grid-env";
import { arr, mat, range } from "./tensor";

export function asyncImmediate() {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), 0);
  });
}

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
  isAlive?: () => boolean,
): Promise<GridEpisode> {
  const episode = [start];
  let { r, c } = getActionMove(env, start.r, start.c, start.action);
  for (const step of range(episodeLength)) {
    const greedyAction = safeGetCellAction(policy, r, c);
    const action = epsilonGreedy(epsilon, greedyAction);
    episode.push({ r, c, action });
    ({ r, c } = getActionMove(env, r, c, action));
    if ((step + 1) % 10000 === 0) {
      await asyncImmediate();
      if (isAlive !== undefined && !isAlive()) {
        break;
      }
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
  isAlive?: () => boolean,
) {
  const start: GridEpisodeStep = { r: 0, c: 0, action: "idle" };
  const episode = await generateEpisode(
    env,
    policy,
    episodeLength,
    epsilon,
    start,
    isAlive,
  );
  const stateActionCount = countStateAction(env, episode);
  return { episode, stateActionCount };
}

export interface MonteCarloIterInfo {
  policy: GridPolicy;
  actionValue: Record<GridAction, number>[][];
  maxError: number;
}

export async function monteCarloDemo(
  env: GridEnv,
  reward: GridReward,
  {
    epsilon = 0.2,
    episodeLength = 1000,
    maxIters = 100,
    tolerance = 0.01,
    minIters = 10,
    stableRounds = 10,
    isAlive,
  }: {
    epsilon?: number;
    episodeLength?: number;
    maxIters?: number;
    tolerance?: number;
    minIters?: number;
    stableRounds?: number;
    isAlive?: () => boolean;
  } = {},
): Promise<MonteCarloIterInfo[]> {
  const counters = mat(
    env.rows,
    env.cols,
    () =>
      Object.fromEntries(
        gridActionEnum.map(action => [action, { sum: 0, n: 0 }]),
      ) as Record<GridAction, { sum: number; n: number }>,
  );

  const avg = ({ sum, n }: { sum: number; n: number }) =>
    n === 0 ? 0 : sum / n;

  const getCellValue = (r: number, c: number) => {
    const cell = counters[r][c];
    return Object.fromEntries(
      gridActionEnum.map(action => [action, avg(cell[action])]),
    ) as Record<GridAction, number>;
  };

  const idlePolicy = createDefaultGridPolicy();
  const iters: MonteCarloIterInfo[] = [
    {
      policy: idlePolicy,
      actionValue: mat(env.rows, env.cols, getCellValue),
      maxError: Infinity,
    },
  ];

  let stableCount = 0;

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
      iters.length === 1 ? 1 : epsilon,
      randomState,
      isAlive,
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

      const cell = counters[step.r][step.c];
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
    const newValue = mat(env.rows, env.cols, getCellValue);
    const maxError = arr(env.rows * env.cols, i => {
      const { r, c } = indexToRC(env, i);
      return gridActionEnum.reduce((maxActError, action) => {
        const lastAvg = lastIter.actionValue[r][c][action];
        const newAvg = newValue[r][c][action];
        return Math.max(maxActError, Math.abs(newAvg - lastAvg));
      }, 0);
    }).reduce((a, b) => Math.max(a, b), 0);
    const allTouched = range(env.rows).every(r =>
      range(env.cols).every(c => {
        const cell = counters[r][c];
        return gridActionEnum.every(action => cell[action].n > 0);
      }),
    );
    iters.push({ policy: newPolicy, actionValue: newValue, maxError });
    const stableNow = allTouched && maxError < tolerance;
    stableCount = stableNow ? stableCount + 1 : 0;
    const enoughIters = iters.length >= minIters;
    if (enoughIters && stableCount >= stableRounds) {
      // Stop when stable condition holds for consecutive rounds after minIters
      break;
    }
    await asyncImmediate();
    if (isAlive !== undefined && !isAlive()) {
      break;
    }
  }

  return iters;
}
