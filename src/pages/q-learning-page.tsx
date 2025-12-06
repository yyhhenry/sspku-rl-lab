import { GridView } from "@/components/grid-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  createDefaultGridPolicy,
  gridActionEnum,
  gridActionIcon,
  gridActionTransform,
  optimalValueIteration,
  safeGetCellAction,
  useGridEnv,
  useGridPolicy,
  useGridReward,
} from "@/lib/grid-env";
import {
  countStateAction,
  demoQLearning,
  generateEpisode,
} from "@/lib/td-learning";
import { mat } from "@/lib/tensor";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Line, LineChart, XAxis, YAxis } from "recharts";

export function QLearningPage() {
  const [runKey, setRunKey] = useState(0);
  const [env] = useGridEnv();
  const [reward] = useGridReward();
  const [policy] = useGridPolicy();

  const [epsilon, setEpsilon] = useState("1.0");
  const episodeLength = 1e5;

  const episode = useMemo(() => {
    // dependency on runKey to rerun
    (v => v)(runKey);
    return generateEpisode(env, policy, episodeLength, parseFloat(epsilon), {
      r: 0,
      c: 0,
      action: "idle",
    });
  }, [runKey, env, policy, epsilon]);

  const preciseValue = useMemo(() => {
    const iters = optimalValueIteration(env, reward, {
      numIters: Infinity,
      tolerance: 1e-6,
    });
    const preciseValue1D = iters[iters.length - 1]?.value;
    return mat(env.rows, env.cols, (r, c) => preciseValue1D[r * env.cols + c]);
  }, [env, reward]);

  const stateActionCount = useMemo(() => {
    return countStateAction(env, episode);
  }, [env, episode]);
  const maxCount = useMemo(() => {
    return Math.max(...Object.values(stateActionCount));
  }, [stateActionCount]);

  const steps = useMemo(() => {
    return demoQLearning(env, reward, [episode], { preciseValue });
  }, [env, reward, episode, preciseValue]);

  const lastPolicy = useMemo(() => {
    return steps[steps.length - 1]?.policy ?? createDefaultGridPolicy();
  }, [steps]);

  const lastStateValue = useMemo(() => {
    return (
      steps[steps.length - 1]?.stateValue ?? mat(env.rows, env.cols, () => 0)
    );
  }, [steps, env]);

  const chartData = useMemo(() => {
    return steps.flatMap(step =>
      step.error !== undefined
        ? [
            {
              step: step.step / 1e4,
              error: step.error,
            },
          ]
        : [],
    );
  }, [steps]);

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardContent>
          <div className="flex my-2 gap-2 items-center flex-wrap">
            <label className="m-2">ε:</label>
            {["0.1", "0.5", "1.0"].map(option => (
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
              <div className="text-sm">
                Use policy from{" "}
                <Button variant="link">
                  <Link to="/policy" className="flex items-center gap-1">
                    Policy Page <ArrowUpRight />
                  </Link>
                </Button>
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
              <div className="flex items-center gap-4 justify-center w-fit min-w-full flex-wrap">
                <GridView
                  className="my-2"
                  env={env}
                  cell={(r, c) => {
                    const ActionIcon =
                      gridActionIcon[safeGetCellAction(lastPolicy, r, c)];
                    return <ActionIcon className="w-6 h-6" />;
                  }}
                />
                <GridView
                  className="my-2"
                  env={env}
                  cell={(r, c) => (
                    <span className="text-xs">
                      {lastStateValue[r][c]?.toFixed(1) ?? ""}
                    </span>
                  )}
                />
              </div>

              <ChartContainer
                className="w-full"
                config={{
                  error: {
                    label: "Error",
                    color: "var(--chart-1)",
                  },
                }}
              >
                <LineChart
                  accessibilityLayer
                  data={chartData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <XAxis
                    dataKey="step"
                    label={{
                      value: "Step (×10,000)",
                      offset: -10,
                      position: "insideBottom",
                    }}
                  />
                  <YAxis
                    dataKey="error"
                    label={{
                      value: "Error",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent hideLabel={true} />}
                  />
                  <Line
                    type="monotone"
                    dataKey="error"
                    stroke="var(--chart-1)"
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
