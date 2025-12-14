import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { indexToRC, useGridEnv, useGridReward } from "@/lib/grid-env";
import {
  demoTDLinear,
  demoTDLinearGroundTruth,
  getTDLinearValue,
} from "@/lib/td-learning";
import { arr, mat } from "@/lib/tensor";
import { useIsDark } from "@/lib/theme";
import * as echarts from "echarts";
import ReactECharts from "echarts-for-react";
import "echarts-gl";
import { useMemo, useState } from "react";
import { Line, LineChart, XAxis, YAxis } from "recharts";
import z from "zod";

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
    return steps.map(step => ({
      iter: step.iter,
      error: step.error,
    }));
  }, [steps]);

  const isDark = useIsDark();
  const option = useMemo(() => {
    const textColor = isDark ? "rgb(200, 200, 200)" : "rgb(50, 50, 50)";
    const tooltipBackgroundColor = isDark
      ? "rgba(15, 23, 42, 0.7)"
      : "rgba(250, 250, 250, 0.7)";

    const data = arr(env.rows * env.cols, idx => {
      const { r, c } = indexToRC(env, idx);
      return [r + 1, c + 1, stateValue[r][c]];
    });

    const zRange = data
      .map(point => point[2])
      .reduce(
        (acc, val) => ({
          min: Math.min(acc.min, val),
          max: Math.max(acc.max, val),
        }),
        { min: Infinity, max: -Infinity },
      );
    const zPad = 0.1 * (zRange.max - zRange.min);
    const zRangeWithPadding = {
      min: (zRange.min - zPad).toFixed(1),
      max: (zRange.max + zPad).toFixed(1),
    };

    const FormatValueType = z.object({
      data: z.tuple([z.number(), z.number(), z.number()]),
    });

    return {
      tooltip: {
        backgroundColor: tooltipBackgroundColor,
        borderColor: textColor,
        borderWidth: 1,
        textStyle: { color: textColor },
        formatter: (value: unknown) => {
          const result = FormatValueType.safeParse(value);
          if (!result.success) {
            return "Error parsing value";
          }
          const [x, y, z] = result.data.data;
          return `Row: ${x}<br/>Col: ${y}<br/>Value: ${z.toFixed(4)}`;
        },
      },
      visualMap: {
        min: zRange.min,
        max: zRange.max,
        show: false,
        orient: "vertical",
        left: "left",
        top: "middle",
        inRange: {
          color: [
            "#313695dd",
            "#4575b4dd",
            "#74add1dd",
            "#abd9e9dd",
            "#e0f3f8dd",
            "#ffffbfdd",
            "#fee090dd",
            "#fdae61dd",
            "#f46d43dd",
            "#d73027dd",
            "#a50026dd",
          ],
        },
        textStyle: { color: textColor },
      },
      xAxis3D: {
        type: "value",
        name: "row",
        min: 1,
        max: env.rows,
        nameTextStyle: { color: textColor },
        axisLabel: { color: textColor },
        axisLine: { lineStyle: { color: textColor } },
      },
      yAxis3D: {
        type: "value",
        name: "col",
        min: 1,
        max: env.cols,
        nameTextStyle: { color: textColor },
        axisLabel: { color: textColor },
        axisLine: { lineStyle: { color: textColor } },
      },
      zAxis3D: {
        type: "value",
        name: "",
        min: zRangeWithPadding.min,
        max: zRangeWithPadding.max,
        nameTextStyle: { color: textColor },
        axisLabel: { color: textColor, margin: 25 },
        axisLine: { lineStyle: { color: textColor } },
      },
      grid3D: {
        boxHeight: 80,
        viewControl: {
          projection: "perspective",
          alpha: 20,
          beta: 65,
        },
      },
      series: [
        {
          type: "surface",
          data,
          shading: "realistic",
          wireframe: {},
        },
      ],
    } as echarts.EChartsOption;
  }, [isDark, stateValue, env]);

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
              <ReactECharts
                echarts={echarts}
                option={option}
                style={{ width: "100%", height: 400 }}
              />

              <ChartContainer
                className="w-full"
                config={{
                  error: {
                    label: "State Value Error",
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
                      value: "State Value Error",
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
