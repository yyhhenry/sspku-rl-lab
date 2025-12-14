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
import { applyMatrixToVector, arr, mat, range } from "./tensor";

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

export function generateEpisode(
  env: GridEnv,
  policy: GridPolicy,
  episodeLength: number,
  epsilon: number,
  start: GridEpisodeStep,
): GridEpisode {
  const episode = [start];
  let { r, c } = getActionMove(env, start.r, start.c, start.action);
  range(episodeLength).forEach(() => {
    const greedyAction = safeGetCellAction(policy, r, c);
    const action = epsilonGreedy(epsilon, greedyAction);
    episode.push({ r, c, action });
    ({ r, c } = getActionMove(env, r, c, action));
  });
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

export function demoExplorationAnalysis(
  env: GridEnv,
  policy: GridPolicy,
  epsilon: number,
  episodeLength: number,
) {
  const start: GridEpisodeStep = { r: 0, c: 0, action: "idle" };
  const episode = generateEpisode(env, policy, episodeLength, epsilon, start);
  const stateActionCount = countStateAction(env, episode);
  return { episode, stateActionCount };
}

export interface MonteCarloIterInfo {
  policy: GridPolicy;
  actionValue: Record<GridAction, number>[][];
  maxError: number;
}

export function demoMonteCarlo(
  env: GridEnv,
  reward: GridReward,
  {
    epsilon = 0.2,
    episodeLength = 100,
    numIters = 200,
  }: {
    epsilon?: number;
    episodeLength?: number;
    numIters?: number;
  } = {},
): MonteCarloIterInfo[] {
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

  while (iters.length < numIters + 1) {
    const lastIter = iters[iters.length - 1];
    const randomState = {
      r: Math.floor(Math.random() * env.rows),
      c: Math.floor(Math.random() * env.cols),
      action: gridActionEnum[Math.floor(Math.random() * gridActionEnum.length)],
    };
    const episode = generateEpisode(
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
    iters.push({ policy: newPolicy, actionValue: newValue, maxError });
  }

  return iters;
}

export interface QLearningStepInfo {
  step: number;
  stateValue: number[][];
  policy: GridPolicy;
  error?: number;
}

export function demoQLearning(
  env: GridEnv,
  reward: GridReward,
  episodes: GridEpisode[],
  {
    alpha = 0.1,
    saveEvery = 10000,
    preciseValue,
  }: {
    alpha?: number;
    saveEvery?: number;
    preciseValue?: number[][];
  } = {},
) {
  const steps: QLearningStepInfo[] = [];
  const actionValue = mat(
    env.rows,
    env.cols,
    () =>
      Object.fromEntries(gridActionEnum.map(action => [action, 0])) as Record<
        GridAction,
        number
      >,
  );
  let stepCount = 0;
  const saveStep = () => {
    const policy: GridPolicy = {
      actions: mat(env.rows, env.cols, (r, c) => {
        return gridActionEnum.reduce((bestAction, action) => {
          const bestQ = actionValue[r][c][bestAction];
          const actionQ = actionValue[r][c][action];
          return actionQ > bestQ ? action : bestAction;
        }, gridActionEnum[0]);
      }),
    };
    const stateValue = mat(
      env.rows,
      env.cols,
      (r, c) => actionValue[r][c][safeGetCellAction(policy, r, c)],
    );
    const error = preciseValue
      ? arr(env.rows * env.cols, i => {
          const { r, c } = indexToRC(env, i);
          return Math.abs(stateValue[r][c] - preciseValue[r][c]);
        }).reduce((a, b) => a + b, 0) /
        (env.rows * env.cols)
      : undefined;
    steps.push({ step: stepCount, stateValue, policy, error });
  };
  saveStep();
  for (const episode of episodes) {
    for (let t = 0; t < episode.length - 1; t++) {
      const { r, c, action } = episode[t];
      const { r: nextR, c: nextC } = episode[t + 1];
      const rewardValue = getActionReward(env, reward, r, c, action);
      const maxNextQ = Math.max(
        ...gridActionEnum.map(action => actionValue[nextR][nextC][action]),
      );
      const tdTarget = rewardValue + reward.gamma * maxNextQ;
      const tdError = tdTarget - actionValue[r][c][action];
      actionValue[r][c][action] += alpha * tdError;
      stepCount += 1;
      if (stepCount % saveEvery === 0) {
        saveStep();
      }
    }
  }
  return steps;
}

export function binaryFeatures(
  r: number,
  c: number,
  maxDegree: number,
): number[] {
  const features: number[] = [];
  for (let dr = 0; dr <= maxDegree; dr++) {
    for (let dc = 0; dc <= maxDegree - dr; dc++) {
      features.push((r + 1) ** dr * (c + 1) ** dc); // 1-based
    }
  }
  return features;
}

export function demoTDLinearGroundTruth(
  env: GridEnv,
  reward: GridReward,
  {
    maxDiff = 1e-6,
  }: {
    maxDiff?: number;
  } = {},
) {
  const transitionMatrix = mat(
    env.rows * env.cols,
    env.rows * env.cols,
    () => 1 / gridActionEnum.length,
  );
  const rewardVector = arr(env.rows * env.cols, idx => {
    const { r, c } = indexToRC(env, idx);
    return (
      gridActionEnum
        .map(action => getActionReward(env, reward, r, c, action))
        .reduce((a, b) => a + b, 0) / gridActionEnum.length
    );
  });

  let valueTensor = arr(env.rows * env.cols, () => 0);
  while (true) {
    const newValueTensor = applyMatrixToVector(
      transitionMatrix,
      valueTensor,
    ).map((v, i) => rewardVector[i] + reward.gamma * v);
    const maxDiffValue = arr(env.rows * env.cols, i =>
      Math.abs(newValueTensor[i] - valueTensor[i]),
    ).reduce((a, b) => Math.max(a, b), 0);
    if (maxDiffValue < maxDiff) {
      break;
    }
    valueTensor = newValueTensor;
  }
  return mat(env.rows, env.cols, (r, c) => {
    const idx = r * env.cols + c;
    return valueTensor[idx];
  });
}

export function getTDLinearValue(
  r: number,
  c: number,
  weights: number[],
  maxDegree: number,
) {
  const features = binaryFeatures(r, c, maxDegree);
  return features.reduce((sum, f, i) => sum + f * weights[i], 0);
}

export function demoTDLinear(
  env: GridEnv,
  reward: GridReward,
  groundTruth: number[][],
  {
    alpha = 5e-3,
    maxDegree = 3,
    numEpisodes = 500,
    episodeLength = 500,
  }: {
    alpha?: number;
    maxDegree?: number;
    numEpisodes?: number;
    episodeLength?: number;
  } = {},
) {
  const weights = binaryFeatures(0, 0, maxDegree).map(() => 0);

  const getValue = (r: number, c: number) =>
    getTDLinearValue(r, c, weights, maxDegree);
  const getRootMeanSquareError = () => {
    const meanSqr =
      arr(env.rows * env.cols, idx => {
        const { r, c } = indexToRC(env, idx);
        const pred = getValue(r, c);
        const truth = groundTruth[r][c];
        return (pred - truth) ** 2;
      }).reduce((a, b) => a + b, 0) /
      (env.rows * env.cols);

    return Math.sqrt(meanSqr);
  };

  const iters = [
    {
      weights: [...weights],
      error: getRootMeanSquareError(),
    },
  ];

  const randomStart = () => {
    const r = Math.floor(Math.random() * env.rows);
    const c = Math.floor(Math.random() * env.cols);
    const action =
      gridActionEnum[Math.floor(Math.random() * gridActionEnum.length)];
    return { r, c, action };
  };
  const newEpisode = () => {
    // policy is never used since epsilon=1.0
    return generateEpisode(
      env,
      createDefaultGridPolicy(),
      episodeLength,
      1.0,
      randomStart(),
    );
  };

  for (const episode of arr(numEpisodes, newEpisode)) {
    for (let t = 0; t < episode.length - 1; t++) {
      const { r, c } = episode[t];
      const { r: nextR, c: nextC } = episode[t + 1];
      const rewardValue = getActionReward(env, reward, r, c, episode[t].action);
      const tdTarget = rewardValue + reward.gamma * getValue(nextR, nextC);
      const tdError = tdTarget - getValue(r, c);
      const features = binaryFeatures(r, c, maxDegree);
      for (let i = 0; i < weights.length; i++) {
        weights[i] += alpha * tdError * features[i];
      }
    }
    iters.push({
      weights: [...weights],
      error: getRootMeanSquareError(),
    });
  }
  return iters;
}
