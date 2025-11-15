import { GridView } from "@/components/grid-view";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createDefaultGridPolicy,
  gridActionIcon,
  optimalPolicyIteration,
  optimalValueIteration,
  rcToIndex,
  safeGetCellAction,
  useGridEnv,
  useGridReward,
  type GridEnv,
  type GridPolicy,
  type GridReward,
} from "@/lib/grid-env";
import { arr } from "@/lib/tensor";
import { useEffect, useMemo, useState } from "react";

export function OptimalValueIteration({
  env,
  reward,
}: {
  env: GridEnv;
  reward: GridReward;
}) {
  const [itersView, setItersView] = useState<{
    activeIter: number;
    iters: { value: number[]; policy: GridPolicy; maxDiff: number }[];
  }>({
    activeIter: 0,
    iters: [
      {
        value: arr(env.rows * env.cols, () => 0),
        policy: createDefaultGridPolicy(),
        maxDiff: Infinity,
      },
    ],
  });
  useEffect(() => {
    const iters = optimalValueIteration(env, reward);
    setItersView({
      activeIter: iters.length - 1,
      iters,
    });
  }, [env, reward]);
  const policy = useMemo(() => {
    return (
      itersView.iters[itersView.activeIter]?.policy ?? createDefaultGridPolicy()
    );
  }, [itersView]);
  const valueTensor = useMemo(() => {
    return itersView.iters[itersView.activeIter]?.value ?? [];
  }, [itersView]);
  return (
    <div className="m-2">
      <div className="mb-4 flex items-center justify-center">
        <div className="m-2">Iteration {itersView.activeIter}:</div>
        <div className="w-sm">
          <Slider
            value={[itersView.activeIter]}
            onValueChange={val =>
              setItersView({ ...itersView, activeIter: val[0] })
            }
            min={0}
            max={itersView.iters.length - 1}
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
              const ActionIcon =
                gridActionIcon[safeGetCellAction(policy, r, c)];
              return <ActionIcon className="w-6 h-6" />;
            }}
          />
          <GridView
            className="my-2"
            env={env}
            cell={(r, c) => (
              <span className="text-xs">
                {valueTensor[rcToIndex(env, r, c)]?.toFixed(1) ?? ""}
              </span>
            )}
          />
        </div>
      </div>
    </div>
  );
}

export function OptimalPolicyIteration({
  env,
  reward,
  valueNumIters,
}: {
  env: GridEnv;
  reward: GridReward;
  valueNumIters?: number;
}) {
  const [itersView, setItersView] = useState<{
    activeIter: number;
    iters: { value: number[]; policy: GridPolicy; maxDiff: number }[];
  }>({
    activeIter: 0,
    iters: [
      {
        value: arr(env.rows * env.cols, () => 0),
        policy: createDefaultGridPolicy(),
        maxDiff: Infinity,
      },
    ],
  });
  useEffect(() => {
    const iters = optimalPolicyIteration(env, reward, {
      valueNumIters,
    });
    setItersView({
      activeIter: iters.length - 1,
      iters,
    });
  }, [env, reward, valueNumIters]);
  const valueTensor = useMemo(() => {
    return itersView.iters[itersView.activeIter]?.value ?? [];
  }, [itersView]);
  const policy = useMemo(() => {
    return (
      itersView.iters[itersView.activeIter]?.policy ?? createDefaultGridPolicy()
    );
  }, [itersView]);
  return (
    <div className="m-2">
      <div className="mb-4 flex items-center justify-center">
        <div className="m-2">Iteration {itersView.activeIter}:</div>
        <div className="w-sm">
          <Slider
            value={[itersView.activeIter]}
            onValueChange={val =>
              setItersView({ ...itersView, activeIter: val[0] })
            }
            min={0}
            max={itersView.iters.length - 1}
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
              const ActionIcon =
                gridActionIcon[safeGetCellAction(policy, r, c)];
              return <ActionIcon className="w-6 h-6" />;
            }}
          />
          <GridView
            className="my-2"
            env={env}
            cell={(r, c) => (
              <span className="text-xs">
                {valueTensor[rcToIndex(env, r, c)]?.toFixed(1) ?? ""}
              </span>
            )}
          />
        </div>
      </div>
    </div>
  );
}

export function OptimalityEquationPage() {
  const [gridEnv] = useGridEnv();
  const [gridReward] = useGridReward();
  const [valueNumIters, setValueNumIters] = useState(4);
  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex flex-col items-center gap-4 my-2 w-fit min-w-full">
              <span>TODO: Charts</span>

              <div className="my-2 flex items-center gap-4 justify-center">
                <label className="text-sm">
                  Truncated Policy Iteration "x":
                </label>
                <Select
                  value={valueNumIters?.toString() ?? "Infinity"}
                  onValueChange={val => setValueNumIters(Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Value Iteration Iterations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="80">80</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Separator className="my-4" />

          <div className="w-full">
            <Tabs defaultValue="value-iteration">
              <div className="overflow-x-auto">
                <TabsList className="w-fit min-w-full">
                  <TabsTrigger value="value-iteration">
                    Value Iteration
                  </TabsTrigger>
                  <TabsTrigger value="policy-iteration">
                    Policy Iteration
                  </TabsTrigger>
                  <TabsTrigger value="truncated-policy-iteration">
                    Truncated Policy Iteration
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="value-iteration">
                <OptimalValueIteration env={gridEnv} reward={gridReward} />
              </TabsContent>
              <TabsContent value="policy-iteration">
                <OptimalPolicyIteration env={gridEnv} reward={gridReward} />
              </TabsContent>
              <TabsContent value="truncated-policy-iteration">
                <OptimalPolicyIteration
                  env={gridEnv}
                  reward={gridReward}
                  valueNumIters={valueNumIters}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
