import { GridView } from "@/components/grid-view";
import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getPolicyExamples,
  getRewardTensor,
  getTransitionTensor,
  gridActionEnum,
  gridActionIcon,
  safeGetCellAction,
  useGridEnv,
  useGridPolicy,
  useGridReward,
  type GridEnv,
  type GridPolicy,
  type GridReward,
} from "@/lib/grid-env";
import {
  applyMatrixToVector,
  checkMatrix,
  displayMatrix,
  identityMatrix,
  InvertMatrix,
  matrixAdd,
} from "@/lib/tensor";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface BellmanEquationProps {
  env: GridEnv;
  reward: GridReward;
  policy: GridPolicy;
}

function PolicyCommonData({ env, reward, policy }: BellmanEquationProps) {
  const rewardTensor = useMemo(
    () => getRewardTensor(env, reward, policy),
    [env, reward, policy]
  );

  const md = useMemo(() => {
    return [
      `$v_\\pi = r_\\pi + \\gamma P_\\pi v_\\pi$`,
      `Here, $v_\\pi$ is the value function under policy $\\pi$, $r_\\pi$ is the expected immediate reward vector under policy $\\pi$, $P_\\pi$ is the state transition matrix under policy $\\pi$, and $\\gamma$ is the discount factor. Where:`,
      `$\\gamma = ${reward.gamma}$`,
      `$(r_\\pi)^T =$`,
      `${displayMatrix([rewardTensor])}`,
    ].join("\n\n");
  }, [reward, rewardTensor]);

  return (
    <div className="m-2">
      <Markdown content={md} />
    </div>
  );
}

function ClosedFormSolution({ env, reward, policy }: BellmanEquationProps) {
  const rewardTensor = useMemo(
    () => getRewardTensor(env, reward, policy),
    [env, reward, policy]
  );

  const transitionTensor = useMemo(
    () => getTransitionTensor(env, reward, policy),
    [env, reward, policy]
  );

  const inverseTensor = useMemo(() => {
    // Compute (I - γ P)^(-1)
    const gamma = reward.gamma;
    const [n, cols] = checkMatrix(transitionTensor);
    if (n !== cols) {
      throw new Error("Transition tensor must be square");
    }
    const I = identityMatrix(n);
    const I_minus_gamma_P = matrixAdd(I, transitionTensor, {
      alpha: 1,
      beta: -gamma,
    });
    try {
      return InvertMatrix(I_minus_gamma_P);
    } catch {
      toast.error(
        "Failed to compute inverse matrix. The policy may lead to a singular transition matrix."
      );
      return I;
    }
  }, [reward, transitionTensor]);

  const valueTensor = useMemo(() => {
    return applyMatrixToVector(inverseTensor, rewardTensor);
  }, [inverseTensor, rewardTensor]);

  const md = useMemo(() => {
    return [
      "$v_\\pi = (I - \\gamma P_\\pi)^{-1} r_\\pi$",
      `$v_\\pi = $`,
      `${displayMatrix([valueTensor], 4, " ")}`,
    ].join("\n\n");
  }, [valueTensor]);

  return (
    <div className="m-2">
      <div className="overflow-x-auto">
        <div className="flex flex-col items-center gap-4 my-2 w-fit min-w-full">
          <GridView
            className="my-2"
            env={env}
            cell={(r, c) => {
              return (
                <span className="text-xs">
                  {valueTensor[r * env.cols + c]?.toFixed(1) ?? ""}
                </span>
              );
            }}
          />
        </div>
      </div>
      <Markdown content={md} />
    </div>
  );
}

function IterativeSolution({ env, reward, policy }: BellmanEquationProps) {
  const rewardTensor = useMemo(
    () => getRewardTensor(env, reward, policy),
    [env, reward, policy]
  );

  const transitionTensor = useMemo(
    () => getTransitionTensor(env, reward, policy),
    [env, reward, policy]
  );

  const [iters, setIters] = useState<{
    activeIter: number;
    iters: { value: number[]; maxDiff: number }[];
  }>({
    activeIter: 0,
    iters: [{ value: rewardTensor, maxDiff: Infinity }],
  });

  useEffect(() => {
    const iters: { value: number[]; maxDiff: number }[] = [
      { value: rewardTensor, maxDiff: Infinity },
    ];
    while (iters.length < 100 && iters[iters.length - 1]!.maxDiff > 0.001) {
      const prev = iters[iters.length - 1]!.value;
      const next = applyMatrixToVector(transitionTensor, prev).map(
        (val, idx) => (rewardTensor[idx] ?? 0) + reward.gamma * val
      );
      const maxDiff = next.reduce((maxErr, val, idx) => {
        const err = Math.abs(val - (prev[idx] ?? 0));
        return err > maxErr ? err : maxErr;
      }, 0);
      iters.push({ value: next, maxDiff });
    }
    setIters({
      activeIter: iters.length - 1,
      iters,
    });
  }, [rewardTensor, transitionTensor, reward]);

  const valueTensor = useMemo(() => {
    return iters.iters[iters.activeIter]?.value ?? rewardTensor;
  }, [iters, rewardTensor]);

  const md = useMemo(() => {
    const k = iters.activeIter;
    return [
      "$v_{k+1} = r_\\pi + \\gamma P_\\pi v_k$",
      k === 0
        ? ""
        : `$max{\\|v_{${k}} - v_{${k - 1}}\\|} = ${(
            iters.iters[k]?.maxDiff ?? 0
          ).toFixed(6)}$`,
      `$v_{${iters.activeIter}} = $`,
      `${displayMatrix([valueTensor], 4, " ")}`,
    ].join("\n\n");
  }, [valueTensor, iters]);

  return (
    <div className="m-2">
      <div className="mb-4 flex items-center justify-center">
        <div className="m-2">Iteration {iters.activeIter}:</div>
        <div className="w-sm">
          <Slider
            value={[iters.activeIter]}
            onValueChange={val => setIters({ ...iters, activeIter: val[0] })}
            min={0}
            max={iters.iters.length - 1}
            step={1}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="flex flex-col items-center gap-4 my-2 w-fit min-w-full">
          <GridView
            className="my-2"
            env={env}
            cell={(r, c) => {
              return (
                <span className="text-xs">
                  {valueTensor[r * env.cols + c]?.toFixed(1) ?? ""}
                </span>
              );
            }}
          />
        </div>
      </div>
      <Markdown content={md} />
    </div>
  );
}

export function BellmanEquationsPage() {
  const [gridEnv] = useGridEnv();
  const [gridReward] = useGridReward();
  const [gridPolicy, setGridPolicy] = useGridPolicy();

  const cyclePolicy = (r: number, c: number) => {
    const action = safeGetCellAction(gridPolicy, r, c);
    const actionIdx = gridActionEnum.findIndex(v => v === action);
    const newAction = gridActionEnum[(actionIdx + 1) % gridActionEnum.length];
    const newActions = Array.from({ length: gridEnv.rows }, (_, row) =>
      Array.from({ length: gridEnv.cols }, (_, col) =>
        row === r && col === c
          ? newAction
          : safeGetCellAction(gridPolicy, row, col)
      )
    );
    setGridPolicy({ ...gridPolicy, actions: newActions });
  };
  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-muted-foreground">Examples:</span>
            {getPolicyExamples(gridEnv.rows, gridEnv.cols).map(
              (example, idx) => (
                <Button
                  variant="link"
                  key={idx}
                  onClick={() => setGridPolicy(example.policy)}
                >
                  {example.name}
                </Button>
              )
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex flex-col items-center gap-4 my-2 w-fit min-w-full">
              <GridView
                env={gridEnv}
                onClick={cyclePolicy}
                cell={(r, c) => {
                  const ActionIcon =
                    gridActionIcon[safeGetCellAction(gridPolicy, r, c)];

                  return <ActionIcon className="w-6 h-6 cursor-pointer" />;
                }}
              />
              <span className="flex items-center flex-wrap gap-1 mt-2 text-xs text-muted-foreground">
                <span>Click to cycle:</span>
                {gridActionEnum.map(action => {
                  const ActionIcon = gridActionIcon[action];
                  return (
                    <span
                      key={action}
                      className="flex items-center gap-1 border px-2 py-1 rounded"
                    >
                      <ActionIcon className="w-4 h-4" />
                      <span>{action}</span>
                    </span>
                  );
                })}
              </span>
            </div>
          </div>
          <Separator className="my-4" />

          <div className="w-full">
            <Tabs defaultValue="common-data">
              <div className="overflow-x-auto">
                <TabsList className="w-fit min-w-full">
                  <TabsTrigger value="common-data">Common Data</TabsTrigger>
                  <TabsTrigger value="closed-form">
                    Closed-form Solution
                  </TabsTrigger>
                  <TabsTrigger value="iterative">
                    Iterative Solution
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="common-data">
                <PolicyCommonData
                  env={gridEnv}
                  reward={gridReward}
                  policy={gridPolicy}
                />
              </TabsContent>
              <TabsContent value="closed-form">
                <ClosedFormSolution
                  env={gridEnv}
                  reward={gridReward}
                  policy={gridPolicy}
                />
              </TabsContent>
              <TabsContent value="iterative">
                <IterativeSolution
                  env={gridEnv}
                  reward={gridReward}
                  policy={gridPolicy}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
