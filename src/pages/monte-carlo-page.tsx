import { GridView } from "@/components/grid-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  gridActionEnum,
  gridActionIcon,
  gridActionTransform,
  safeGetCellAction,
  useGridEnv,
  useGridPolicy,
  useGridReward,
} from "@/lib/grid-env";
import {
  explorationAnalysisDemo,
  monteCarloDemo,
  type MonteCarloIterInfo,
} from "@/lib/monte-carlo";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

function EpsilonGreedyOptimality() {
  const [env] = useGridEnv();
  const [reward] = useGridReward();
  const [epsilon, setEpsilon] = useState("0.0");
  const [runKey, setRunKey] = useState(0);

  const [iters, setIters] = useState<MonteCarloIterInfo[]>([]);
  const [activeIter, setActiveIter] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const result = await monteCarloDemo(env, reward, {
        epsilon: parseFloat(epsilon),
        isAlive: () => mounted,
      });
      if (!mounted) return;
      console.log(env);
      setIters(result);
      setActiveIter(Math.max(0, result.length - 1));
    })();
    return () => {
      mounted = false;
    };
  }, [env, reward, epsilon, runKey]);

  const policy = useMemo(
    () => (iters.length === 0 ? undefined : iters[activeIter]?.policy),
    [iters, activeIter],
  );
  const actionValue = useMemo(
    () => (iters.length === 0 ? undefined : iters[activeIter]?.actionValue),
    [iters, activeIter],
  );

  const cellBestValue = useMemo(() => {
    if (!actionValue) return [];
    return actionValue.map(row =>
      row.map(cell =>
        Math.max(...gridActionEnum.map(a => cell[a] ?? -Infinity)),
      ),
    );
  }, [actionValue]);

  return (
    <div className="m-2">
      <div className="flex my-2 gap-2 items-center">
        <label className="m-2">ε:</label>
        {["0.0", "0.05", "0.1", "0.2", "0.5"].map(option => (
          <Button
            key={option}
            variant={option === epsilon ? "default" : "link"}
            onClick={() => {
              setEpsilon(option);
              setRunKey(prev => prev + 1);
            }}
          >
            {option}
          </Button>
        ))}
      </div>
      <div className="mb-4 flex items-center justify-center">
        <div className="m-2">Iteration {activeIter}:</div>
        <div className="w-sm">
          <Slider
            value={[activeIter]}
            onValueChange={val => setActiveIter(val[0])}
            min={0}
            max={Math.max(0, iters.length - 1)}
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
              if (!policy || !actionValue) return null;
              const ActionIcon =
                gridActionIcon[safeGetCellAction(policy, r, c)];
              return (
                <span>
                  <ActionIcon />
                </span>
              );
            }}
          />

          <GridView
            className="my-2"
            env={env}
            cell={(r, c) => {
              return (
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[10px] opacity-80">
                        {cellBestValue[r]?.[c]?.toFixed(2) ?? ""}
                      </span>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="text-sm">
                      <div>
                        State ({r}, {c}) Action Values:
                      </div>
                      {gridActionEnum.map(action => (
                        <div key={action} className="flex items-center gap-2">
                          <span className="w-12 capitalize">{action}:</span>
                          <span>
                            {actionValue?.[r]?.[c]?.[action]?.toFixed(4) ??
                              "N/A"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}

function EpsilonExplorationAnalysis() {
  const [env] = useGridEnv();
  const [policy] = useGridPolicy();
  const [epsilon, setEpsilon] = useState("1.0");
  const [episodeLength, setEpisodeLength] = useState(100);
  const [runKey, setRunKey] = useState(0);

  const [stateActionCount, setStateActionCount] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    let mounted = true;
    explorationAnalysisDemo(
      env,
      policy,
      parseFloat(epsilon),
      episodeLength,
      () => mounted,
    ).then(({ stateActionCount }) => {
      if (!mounted) return;
      setStateActionCount(stateActionCount);
    });
    return () => {
      mounted = false;
    };
  }, [env, policy, epsilon, episodeLength, runKey]);

  const maxCount = useMemo(
    () => Object.values(stateActionCount).reduce((a, b) => Math.max(a, b), 0),
    [stateActionCount],
  );

  const chartData = useMemo(() => {
    const data: Array<{ state: string; [key: string]: string | number }> = [];
    for (let r = 0; r < env.rows; r++) {
      for (let c = 0; c < env.cols; c++) {
        const stateData: { state: string; [key: string]: string | number } = {
          state: `(${r},${c})`,
        };
        for (const action of gridActionEnum) {
          const key = `${r},${c},${action}`;
          const count = stateActionCount[key] ?? 0;
          stateData[action] = count;
        }
        data.push(stateData);
      }
    }
    return data;
  }, [env, stateActionCount]);

  return (
    <div className="m-2">
      <div className="flex my-2 gap-2 items-center">
        <label className="m-2">Episode Length:</label>
        {[1e2, 1e3, 1e4, 1e6].map(option => (
          <Button
            key={option}
            variant={option === episodeLength ? "default" : "link"}
            onClick={() => {
              setEpisodeLength(option);
              setRunKey(prev => prev + 1);
            }}
          >
            {option}
          </Button>
        ))}
      </div>
      <div className="flex my-2 gap-2 items-center">
        <label className="m-2">ε:</label>
        {["1.0", "0.5"].map(option => (
          <Button
            key={option}
            variant={option === epsilon ? "default" : "link"}
            onClick={() => {
              setEpsilon(option);
              setRunKey(prev => prev + 1);
            }}
          >
            {option}
          </Button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div className="flex flex-col items-center gap-4 my-2 w-fit min-w-full">
          <div className="text-xs text-muted-foreground">
            Use policy in "Bellman Equation" Page
          </div>
          <GridView
            className="m-4"
            env={env}
            cell={(r, c) => {
              return (
                <>
                  {gridActionEnum.map(action => {
                    const ActionIcon = gridActionIcon[action];
                    const curCount =
                      stateActionCount[`${r},${c},${action}`] ?? 0;
                    const opacity =
                      curCount > 0
                        ? 0.3 +
                          0.7 * Math.sqrt(curCount / Math.max(1, maxCount))
                        : 0;
                    return (
                      <span
                        className={cn(
                          "absolute text-xs",
                          gridActionTransform[action],
                        )}
                        style={{ opacity }}
                        key={action}
                      >
                        <ActionIcon />
                      </span>
                    );
                  })}
                </>
              );
            }}
          />

          <div className="w-full">
            <ChartContainer
              config={{
                idle: {
                  label: "Idle",
                  color: "var(--chart-1)",
                },
                right: {
                  label: "Right",
                  color: "var(--chart-2)",
                },
                down: {
                  label: "Down",
                  color: "var(--chart-3)",
                },
                left: {
                  label: "Left",
                  color: "var(--chart-4)",
                },
                up: {
                  label: "Up",
                  color: "var(--chart-5)",
                },
              }}
            >
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="state" tick={false} />
                <YAxis />
                <ChartLegend content={<ChartLegendContent />} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: "rgba(128, 128, 128, 0.2)" }}
                />
                <Bar
                  dataKey="idle"
                  stackId="a"
                  fill="var(--color-idle)"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="right"
                  stackId="a"
                  fill="var(--color-right)"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="down"
                  stackId="a"
                  fill="var(--color-down)"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="left"
                  stackId="a"
                  fill="var(--color-left)"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="up"
                  stackId="a"
                  fill="var(--color-up)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
export function MonteCarloPage() {
  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardContent>
          <Tabs defaultValue="optimality">
            <div className="overflow-x-auto">
              <TabsList className="w-fit min-w-full">
                <TabsTrigger value="optimality">
                  Optimality Analysis
                </TabsTrigger>
                <TabsTrigger value="exploration">
                  Exploration Analysis
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="optimality">
              <EpsilonGreedyOptimality />
            </TabsContent>

            <TabsContent value="exploration">
              <EpsilonExplorationAnalysis />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
