import { TDLinearSurface } from "@/components/td-linear-surface";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useGridEnv, useGridReward } from "@/lib/grid-env";
import {
  demoTDLinear,
  demoTDLinearGroundTruth,
  getTDLinearValue,
} from "@/lib/td-learning";
import { mat } from "@/lib/tensor";
import { useMemo, useState } from "react";
import { Line, LineChart, XAxis, YAxis } from "recharts";

export function TDLinearPage() {
  const [runKey, setRunKey] = useState(0);
  const [env] = useGridEnv();
  const [reward] = useGridReward();

  const [maxDegree, setMaxDegree] = useState(1);

  const groundTruth = useMemo(() => {
    return demoTDLinearGroundTruth(env, reward);
  }, [env, reward]);

  const steps = useMemo(() => {
    (v => v)(runKey);
    return demoTDLinear(env, reward, groundTruth, {
      maxDegree,
    });
  }, [runKey, env, reward, groundTruth, maxDegree]);

  const stateValue = useMemo(() => {
    const weights = steps[steps.length - 1]?.weights ?? [];
    return mat(env.rows, env.cols, (r, c) => {
      return getTDLinearValue(env, r, c, weights, maxDegree);
    });
  }, [steps, env, maxDegree]);

  const chartData = useMemo(() => {
    return steps.map((step, idx) => ({
      iter: idx,
      error: step.error,
    }));
  }, [steps]);

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardContent>
          <div className="flex my-2 gap-2 items-center flex-wrap">
            <label className="m-2">Polynomial Degree:</label>
            {[1, 2, 3].map(option => (
              <Button
                key={option}
                variant={option === maxDegree ? "default" : "link"}
                onClick={() => {
                  setMaxDegree(option);
                  setRunKey(prev => prev + 1);
                }}
              >
                {option}
              </Button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <div className="flex flex-col items-center gap-4 my-2 w-fit min-w-full">
              <TDLinearSurface values={stateValue} />

              <ChartContainer
                className="w-full"
                config={{
                  error: {
                    label: "RootMSE",
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
                    dataKey="iter"
                    label={{
                      value: "Iterations",
                      offset: -10,
                      position: "insideBottom",
                    }}
                  />
                  <YAxis
                    dataKey="error"
                    label={{
                      value: "RootMSE",
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
